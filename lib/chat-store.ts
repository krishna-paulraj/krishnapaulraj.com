/**
 * Server-side reads and writes for the chat. Kept apart from lib/chat.ts so
 * that module stays pure and unit-testable; everything that touches Prisma or
 * Redis lives here.
 */

import {
  CHAT_LIMITS,
  type ChatMessage,
  type ChatPayload,
  type ChatRole,
  type ChatStatus,
  type ChatThread,
} from "@/lib/chat";
import { getPrisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

type ThreadRow = {
  id: string;
  visitorName: string | null;
  visitorEmail: string | null;
  status: string;
  lastMessageAt: Date;
  ownerUnread: number;
  visitorUnread: number;
  messageCount: number;
};

type MessageRow = {
  id: string;
  seq: number;
  role: string;
  body: string;
  createdAt: Date;
  clientId: string | null;
};

/**
 * The seq the poll compares against before it is willing to query Postgres.
 * This is the whole reason polling is affordable: an idle poll is one Redis GET
 * and an empty delta, and the database is touched only when something actually
 * changed. Redis is best-effort here — if it is down we simply always fall
 * through to Postgres, matching rateLimit()'s fail-open contract.
 */
const seqKey = (threadId: string) => `chat:seq:${threadId}`;
const OWNER_SEQ_KEY = "chat:owner:seq";

async function publishSeq(threadId: string, seq: number): Promise<void> {
  try {
    const redis = getRedis();
    await Promise.all([
      redis.set(seqKey(threadId), seq),
      redis.incr(OWNER_SEQ_KEY),
    ]);
  } catch {
    // A missed hint only costs one extra Postgres read on the next poll.
  }
}

/** null means "no idea, go ask Postgres". */
async function readSeqHint(threadId: string): Promise<number | null> {
  try {
    const value = await getRedis().get<number | string>(seqKey(threadId));
    const seq = typeof value === "string" ? Number(value) : value;
    return typeof seq === "number" && Number.isFinite(seq) ? seq : null;
  } catch {
    return null;
  }
}

export function toThread(row: ThreadRow, viewer: ChatRole): ChatThread {
  return {
    id: row.id,
    name: row.visitorName,
    email: row.visitorEmail,
    status: row.status === "archived" ? "archived" : "open",
    lastMessageAt: row.lastMessageAt.toISOString(),
    unread: viewer === "owner" ? row.ownerUnread : row.visitorUnread,
    messageCount: row.messageCount,
  };
}

export function toMessage(row: MessageRow): ChatMessage {
  return {
    // The sender's optimistic id wins so the row it already rendered is never
    // replaced by a different key — that would drop the scroller's anchor.
    id: row.clientId ?? row.id,
    seq: row.seq,
    role: row.role === "owner" ? "owner" : "visitor",
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

const THREAD_SELECT = {
  id: true,
  visitorName: true,
  visitorEmail: true,
  status: true,
  lastMessageAt: true,
  ownerUnread: true,
  visitorUnread: true,
  messageCount: true,
} as const;

const MESSAGE_SELECT = {
  id: true,
  seq: true,
  role: true,
  body: true,
  createdAt: true,
  clientId: true,
} as const;

export async function findThreadByTokenHash(
  tokenHash: string,
): Promise<ThreadRow | null> {
  return getPrisma().chatThread.findUnique({
    where: { tokenHash },
    select: THREAD_SELECT,
  });
}

export async function findThreadById(id: string): Promise<ThreadRow | null> {
  return getPrisma().chatThread.findUnique({
    where: { id },
    select: THREAD_SELECT,
  });
}

/**
 * Messages after `since`. Consults the Redis hint first so an unchanged thread
 * never reaches the database.
 */
export async function readMessages(
  threadId: string,
  since: number,
): Promise<ChatMessage[]> {
  if (since > 0) {
    const hint = await readSeqHint(threadId);
    if (hint !== null && hint <= since) return [];
  }

  const rows = await getPrisma().chatMessage.findMany({
    where: { threadId, ...(since > 0 ? { seq: { gt: since } } : {}) },
    orderBy: { seq: "asc" },
    take: CHAT_LIMITS.perThread,
    select: MESSAGE_SELECT,
  });
  return rows.map(toMessage);
}

export function payload(
  row: ThreadRow | null,
  messages: ChatMessage[],
  viewer: ChatRole,
): ChatPayload {
  return {
    thread: row ? toThread(row, viewer) : null,
    messages,
    cursor: messages.length ? messages[messages.length - 1]!.seq : 0,
  };
}

export async function createThread(input: {
  tokenHash: string;
  ipHash: string;
  body: string;
  clientId: string | null;
}): Promise<{ thread: ThreadRow; message: ChatMessage }> {
  const created = await getPrisma().chatThread.create({
    data: {
      tokenHash: input.tokenHash,
      ipHash: input.ipHash,
      ownerUnread: 1,
      messageCount: 1,
      messages: {
        create: {
          role: "visitor",
          body: input.body,
          clientId: input.clientId,
        },
      },
    },
    select: { ...THREAD_SELECT, messages: { select: MESSAGE_SELECT } },
  });

  const { messages, ...thread } = created;
  const message = toMessage(messages[0]!);
  await publishSeq(created.id, message.seq);
  return { thread, message };
}

/**
 * Append a message and move the thread's counters in one transaction. The
 * unread counter for the *other* side goes up; the sender's own stays put.
 */
export async function appendMessage(input: {
  threadId: string;
  role: ChatRole;
  body: string;
  clientId: string | null;
}): Promise<ChatMessage> {
  const prisma = getPrisma();
  const [message] = await prisma.$transaction([
    prisma.chatMessage.create({
      data: {
        threadId: input.threadId,
        role: input.role,
        body: input.body,
        clientId: input.clientId,
      },
      select: MESSAGE_SELECT,
    }),
    prisma.chatThread.update({
      where: { id: input.threadId },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
        // Any new message reopens an archived thread, whoever sent it.
        // Archiving means "done for now", not "mute": leaving a thread filed
        // away after someone writes into it buries their message where the
        // owner's default view will never show it.
        status: "open",
        ...(input.role === "visitor"
          ? { ownerUnread: { increment: 1 } }
          : { visitorUnread: { increment: 1 } }),
      },
    }),
  ]);

  const mapped = toMessage(message);
  await publishSeq(input.threadId, mapped.seq);
  return mapped;
}

/** Clear the reader's unread counter. Only ever called for a reader who is looking. */
export async function acknowledge(
  threadId: string,
  viewer: ChatRole,
): Promise<void> {
  await getPrisma().chatThread.update({
    where: { id: threadId },
    data: viewer === "owner" ? { ownerUnread: 0 } : { visitorUnread: 0 },
  });
}

export async function setIdentity(
  threadId: string,
  name: string,
  email: string | null,
): Promise<ThreadRow> {
  return getPrisma().chatThread.update({
    where: { id: threadId },
    data: { visitorName: name, visitorEmail: email },
    select: THREAD_SELECT,
  });
}

export async function setStatus(
  threadId: string,
  status: ChatStatus,
): Promise<ThreadRow> {
  return getPrisma().chatThread.update({
    where: { id: threadId },
    data: { status },
    select: THREAD_SELECT,
  });
}

export async function deleteThread(threadId: string): Promise<void> {
  // Messages cascade; the thread row is the only thing to remove.
  await getPrisma().chatThread.delete({ where: { id: threadId } });
}

/** Threads opened from this IP in the last day — the cap that survives a Redis outage. */
export async function recentThreadCount(ipHash: string): Promise<number> {
  return getPrisma().chatThread.count({
    where: { ipHash, createdAt: { gt: new Date(Date.now() - 86_400_000) } },
  });
}

export type ThreadSummary = ChatThread & {
  preview: string;
  createdAt: string;
};

/** The inbox list. Ordered newest-activity-first, riding the (status, lastMessageAt) index. */
export async function listThreads(options: {
  status: ChatStatus | "all";
  cursor: string | null;
  limit: number;
}): Promise<ThreadSummary[]> {
  const rows = await getPrisma().chatThread.findMany({
    where: {
      ...(options.status === "all" ? {} : { status: options.status }),
      ...(options.cursor
        ? { lastMessageAt: { lt: new Date(options.cursor) } }
        : {}),
    },
    orderBy: { lastMessageAt: "desc" },
    take: options.limit,
    select: {
      ...THREAD_SELECT,
      createdAt: true,
      messages: {
        orderBy: { seq: "desc" },
        take: 1,
        select: { body: true },
      },
    },
  });

  return rows.map(({ messages, createdAt, ...row }) => ({
    ...toThread(row, "owner"),
    createdAt: createdAt.toISOString(),
    preview: messages[0]?.body.replace(/\s+/g, " ").slice(0, 140) ?? "",
  }));
}
