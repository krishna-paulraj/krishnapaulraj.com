/**
 * Server-side reads and writes for the chat. Kept apart from lib/chat.ts so
 * that module stays pure and unit-testable; everything that touches Prisma or
 * Redis lives here.
 */

import {
  CHAT_LIMITS,
  isOAuthProvider,
  type ChatIdentity,
  type ChatMessage,
  type ChatPayload,
  type ChatRole,
  type ChatStatus,
  type ChatThread,
  type OAuthProvider,
} from "@/lib/chat";
import { getPrisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

export type IdentityRow = {
  id: string;
  provider: string;
  /** Never serialised to a client — toIdentity() picks fields explicitly. */
  providerAccountId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  avatarUrl: string | null;
};

export type ThreadRow = {
  id: string;
  visitorName: string | null;
  visitorEmail: string | null;
  status: string;
  lastMessageAt: Date;
  ownerUnread: number;
  visitorUnread: number;
  messageCount: number;
  identity: IdentityRow | null;
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

/** Provider rows are plain strings in the database; narrow before handing them out. */
export function toIdentity(row: IdentityRow): ChatIdentity | null {
  if (!isOAuthProvider(row.provider)) return null;
  return {
    provider: row.provider,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatarUrl,
  };
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
    // On the owner's side this is the whole point of sign-in: it says the name
    // on this conversation was vouched for by GitHub or Google rather than
    // typed into a box by whoever showed up.
    identity: row.identity ? toIdentity(row.identity) : null,
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

const IDENTITY_SELECT = {
  id: true,
  provider: true,
  providerAccountId: true,
  email: true,
  emailVerified: true,
  name: true,
  avatarUrl: true,
} as const;

const THREAD_SELECT = {
  id: true,
  visitorName: true,
  visitorEmail: true,
  status: true,
  lastMessageAt: true,
  ownerUnread: true,
  visitorUnread: true,
  messageCount: true,
  identity: { select: IDENTITY_SELECT },
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
  // Undefined and null mean different things here: undefined omits the key
  // entirely (the owner's inbox has no use for it), while null is the positive
  // statement "this visitor is not signed in".
  identity?: ChatIdentity | null,
): ChatPayload {
  return {
    thread: row ? toThread(row, viewer) : null,
    messages,
    cursor: messages.length ? messages[messages.length - 1]!.seq : 0,
    ...(identity !== undefined ? { identity } : {}),
  };
}

export async function createThread(input: {
  tokenHash: string;
  ipHash: string;
  body: string;
  clientId: string | null;
  /** Set when the visitor signed in before ever sending anything. */
  identityId?: string | null;
  visitorName?: string | null;
  visitorEmail?: string | null;
}): Promise<{ thread: ThreadRow; message: ChatMessage }> {
  const created = await getPrisma().chatThread.create({
    data: {
      tokenHash: input.tokenHash,
      ipHash: input.ipHash,
      identityId: input.identityId ?? null,
      visitorName: input.visitorName ?? null,
      visitorEmail: input.visitorEmail ?? null,
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

/* ── Signed-in identities ─────────────────────────────────────────────────── */

/**
 * Record the account behind a completed sign-in. Keyed on the provider's own
 * immutable id, so a visitor who later changes their GitHub username, display
 * name or email lands on the same row rather than a second one.
 */
export async function upsertIdentity(input: {
  provider: OAuthProvider;
  providerAccountId: string;
  name: string | null;
  email: string | null;
  emailVerified: boolean;
  avatarUrl: string | null;
}): Promise<IdentityRow> {
  const profile = {
    name: input.name,
    email: input.email,
    emailVerified: input.emailVerified,
    avatarUrl: input.avatarUrl,
  };

  return getPrisma().chatIdentity.upsert({
    where: {
      provider_providerAccountId: {
        provider: input.provider,
        providerAccountId: input.providerAccountId,
      },
    },
    create: {
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      ...profile,
    },
    // Refreshed on every sign-in: people rename themselves and change avatars,
    // and a stale one in the inbox is worse than no cache at all.
    update: { ...profile, lastSeenAt: new Date() },
    select: IDENTITY_SELECT,
  });
}

export async function findIdentityById(
  id: string,
): Promise<IdentityRow | null> {
  return getPrisma().chatIdentity.findUnique({
    where: { id },
    select: IDENTITY_SELECT,
  });
}

/**
 * The conversation a signed-in visitor should land in.
 *
 * Most recently active wins rather than oldest, because the column is
 * deliberately not unique: archiving a thread and starting a new one is a
 * supported flow, and the one they were last talking in is the one they mean.
 */
export async function findThreadByIdentity(
  identityId: string,
): Promise<ThreadRow | null> {
  return getPrisma().chatThread.findFirst({
    where: { identityId },
    orderBy: { lastMessageAt: "desc" },
    select: THREAD_SELECT,
  });
}

/**
 * Bind an existing anonymous thread to an account, and let the provider's
 * profile win over anything typed into the name box.
 *
 * Overwriting is the right call: "Robert Smith, verified by GitHub" is strictly
 * better inbox information than "bob", and the visitor has just demonstrated
 * these are the same person. The email is only taken when the provider actually
 * vouched for it — an unverified address is a claim, not a fact.
 */
export async function adoptThread(input: {
  threadId: string;
  identity: IdentityRow;
}): Promise<ThreadRow> {
  return getPrisma().chatThread.update({
    where: { id: input.threadId },
    data: {
      identityId: input.identity.id,
      ...(input.identity.name ? { visitorName: input.identity.name } : {}),
      ...(input.identity.emailVerified && input.identity.email
        ? { visitorEmail: input.identity.email }
        : {}),
    },
    select: THREAD_SELECT,
  });
}

const MERGE_SELECT = {
  id: true,
  tokenHash: true,
  ownerUnread: true,
  visitorUnread: true,
  messageCount: true,
  lastMessageAt: true,
} as const;

/**
 * Fold the anonymous thread this device was using into the one the account
 * already owns.
 *
 * This is the case that makes sign-in worth having and is also the easiest to
 * get wrong: someone types a message on their phone, then signs in, and already
 * has a conversation from their laptop. Abandoning either half would lose real
 * messages, and leaving both would hand the owner two rows for one person —
 * exactly the problem sign-in exists to fix.
 *
 * Moving messages across threads is safe because `seq` is a table-wide
 * sequence, not per-thread: the merged messages keep their original ordering
 * relative to everything else without any renumbering.
 */
export async function mergeThreads(input: {
  fromId: string;
  intoId: string;
}): Promise<ThreadRow | null> {
  if (input.fromId === input.intoId) return findThreadById(input.intoId);

  const prisma = getPrisma();
  const [from, into] = await Promise.all([
    prisma.chatThread.findUnique({
      where: { id: input.fromId },
      select: MERGE_SELECT,
    }),
    prisma.chatThread.findUnique({
      where: { id: input.intoId },
      select: MERGE_SELECT,
    }),
  ]);
  if (!from || !into) return findThreadById(input.intoId);

  await prisma.$transaction([
    prisma.chatMessage.updateMany({
      where: { threadId: from.id },
      data: {
        threadId: into.id,
        // clientId only exists to make a retried POST idempotent while it is in
        // flight; long after the fact it is dead weight, and carrying it across
        // could collide with the surviving thread's own @@unique([threadId,
        // clientId]). Dropping it is both safe and tidier.
        clientId: null,
      },
    }),
    // Deleted before the update below so its unique tokenHash is free to move.
    prisma.chatThread.delete({ where: { id: from.id } }),
    prisma.chatThread.update({
      where: { id: into.id },
      data: {
        // The surviving thread takes over this device's cookie, so signing out
        // later still leaves the conversation reachable here. The trade-off is
        // that the *other* device's anonymous cookie stops resolving — one
        // thread has one tokenHash — but that device can sign in, which is the
        // whole point.
        tokenHash: from.tokenHash,
        messageCount: { increment: from.messageCount },
        ownerUnread: { increment: from.ownerUnread },
        visitorUnread: { increment: from.visitorUnread },
        lastMessageAt:
          from.lastMessageAt > into.lastMessageAt
            ? from.lastMessageAt
            : into.lastMessageAt,
        // Merging is activity. A thread the owner had filed away should come
        // back to the top rather than silently absorb new messages.
        status: "open",
      },
    }),
  ]);

  // The seq hint for the surviving thread is now stale in both directions, so
  // republish from the truth rather than trying to reason about it.
  const newest = await prisma.chatMessage.findFirst({
    where: { threadId: into.id },
    orderBy: { seq: "desc" },
    select: { seq: true },
  });
  if (newest) await publishSeq(into.id, newest.seq);

  return findThreadById(into.id);
}
