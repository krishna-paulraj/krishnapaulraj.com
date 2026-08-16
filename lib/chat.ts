/**
 * The visitor↔owner chat. This module is the pure, testable half: the caps, the
 * normalizers the API routes validate against, and the grouping rules the
 * transcript renders from. Nothing here touches Prisma, Redis or the network.
 *
 * Rows live in Postgres (see prisma/schema.prisma). Bodies are plain text —
 * never markdown — for the same reason as board comments: an unauthenticated
 * box that renders markup is a link-spam vector.
 */

import { stripControlChars } from "@/lib/board-comments";

export const CHAT_LIMITS = {
  name: 40,
  email: 200,
  body: 2000,
  /** A thread stops accepting visitor messages past this; see normalizeChatDraft's note. */
  perThread: 200,
  id: 64,
  /** Raw request body cap, applied before the JSON is even parsed. */
  bytes: 8 * 1024,
} as const;

export type ChatRole = "visitor" | "owner";
export type ChatStatus = "open" | "archived";

export type ChatMessage = {
  id: string;
  seq: number;
  role: ChatRole;
  body: string;
  createdAt: string;
};

export type ChatThread = {
  id: string;
  name: string | null;
  email: string | null;
  status: ChatStatus;
  lastMessageAt: string;
  unread: number;
  messageCount: number;
};

/** What the visitor endpoints return. `thread` is null before the first send. */
export type ChatPayload = {
  thread: ChatThread | null;
  messages: ChatMessage[];
  /** Highest seq in `messages`, or 0. The client echoes this back as `?since=`. */
  cursor: number;
};

export const ANONYMOUS_VISITOR = "Anonymous";

/** Matches app/api/contact/route.ts, which imports this rather than keeping its own. */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export type ChatDraftResult =
  { ok: true; body: string } | { ok: false; error: string };

/**
 * Normalize a message body. Collapses runs of blank lines so one message can't
 * stretch the transcript vertically, and rejects anything empty after trimming.
 */
export function normalizeChatDraft(input: unknown): ChatDraftResult {
  if (typeof input !== "string") {
    return { ok: false, error: "Type a message first." };
  }

  const body = stripControlChars(input.replace(/\r\n?/g, "\n"), true)
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!body) return { ok: false, error: "Type a message first." };
  if (body.length > CHAT_LIMITS.body) {
    return { ok: false, error: "That message is too long." };
  }

  return { ok: true, body };
}

export type ChatIdentityResult =
  | { ok: true; name: string; email: string | null }
  | { ok: false; error: string };

/**
 * Normalize the name/email the widget collects after the first message. The
 * name is required — it is what makes the inbox readable — but the email is
 * optional and only exists so the owner can follow up out of band.
 */
export function normalizeIdentity(
  nameInput: unknown,
  emailInput: unknown,
): ChatIdentityResult {
  if (typeof nameInput !== "string") {
    return { ok: false, error: "A name is required." };
  }

  const name = stripControlChars(nameInput, false).trim();
  if (!name) return { ok: false, error: "A name is required." };
  if (name.length > CHAT_LIMITS.name) {
    return { ok: false, error: "That name is too long." };
  }

  if (emailInput === undefined || emailInput === null || emailInput === "") {
    return { ok: true, name, email: null };
  }
  if (typeof emailInput !== "string") {
    return { ok: false, error: "Check the email and try again." };
  }

  const email = stripControlChars(emailInput, false).trim();
  if (!email) return { ok: true, name, email: null };
  if (email.length > CHAT_LIMITS.email || !isEmail(email)) {
    return { ok: false, error: "Check the email and try again." };
  }

  return { ok: true, name, email };
}

/** How a thread is labelled before the visitor has told us who they are. */
export function displayName(thread: {
  id: string;
  name: string | null;
}): string {
  return thread.name ?? `${ANONYMOUS_VISITOR} · ${thread.id.slice(0, 6)}`;
}

/**
 * A message plus the layout facts the transcript needs, derived once so the
 * renderer stays declarative.
 *
 * `startsRun` / `endsRun` drive the header and footer of a run of consecutive
 * messages from the same author. `scrollAnchor` marks the row the scroller
 * should treat as the start of a turn — only the first message of a run, since
 * anchoring every row makes `defaultScrollPosition="last-anchor"` degenerate
 * into plain "end".
 */
export type ChatRow<T extends ChatMessage = ChatMessage> = {
  message: T;
  startsRun: boolean;
  endsRun: boolean;
  scrollAnchor: boolean;
  /** Set on the first message of a new calendar day; renders a date separator. */
  dayBreak: string | null;
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function groupMessages<T extends ChatMessage>(
  messages: T[],
): ChatRow<T>[] {
  return messages.map((message, index) => {
    const prev = messages[index - 1];
    const next = messages[index + 1];
    const day = dayKey(message.createdAt);
    const dayBreak = !prev || dayKey(prev.createdAt) !== day ? day : null;

    // A day separator visually breaks the run even between same-author
    // messages, so it has to reopen the run too — otherwise the first message
    // under a new date renders with no header.
    const startsRun = !prev || prev.role !== message.role || dayBreak !== null;
    const endsRun =
      !next || next.role !== message.role || dayKey(next.createdAt) !== day;

    return { message, startsRun, endsRun, scrollAnchor: startsRun, dayBreak };
  });
}

/**
 * How long to wait before polling again. Chat has no realtime transport, so the
 * schedule is what keeps an idle widget from hammering the database: it stops
 * entirely when the tab is hidden, and stretches out the longer a conversation
 * sits quiet.
 */
export function pollDelayMs(options: {
  open: boolean;
  visible: boolean;
  msSinceLastMessage: number;
}): number | null {
  if (!options.visible) return null;
  if (!options.open) return 60_000;
  if (options.msSinceLastMessage < 2 * 60_000) return 5_000;
  if (options.msSinceLastMessage < 10 * 60_000) return 15_000;
  return 30_000;
}
