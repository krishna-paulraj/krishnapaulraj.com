/**
 * The visitor half of the chat.
 *
 * Every handler resolves its thread from the HttpOnly cookie — a thread id is
 * never accepted from the client — so one visitor structurally cannot read
 * another's conversation.
 *
 * Check ordering follows app/api/board/comments/route.ts: size cap, parse,
 * validate, rate limit, write. Cheap rejections happen before expensive ones.
 */

import { after } from "next/server";

import {
  CHAT_LIMITS,
  displayName,
  normalizeChatDraft,
  normalizeIdentity,
} from "@/lib/chat";
import {
  attachVisitorCookie,
  clearVisitorCookie,
  clientIpHash,
  hashToken,
  mintVisitorToken,
  readVisitorTokenHash,
} from "@/lib/chat-identity";
import {
  acknowledge,
  appendMessage,
  createThread,
  deleteThread,
  findThreadById,
  findThreadByTokenHash,
  payload,
  readMessages,
  recentThreadCount,
  setIdentity,
  toThread,
} from "@/lib/chat-store";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/redis";
import { SITE_URL } from "@/lib/constants";

/** These carry private conversations; nothing between here and the browser may keep a copy. */
const NO_STORE = { "Cache-Control": "no-store" } as const;

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: NO_STORE });
}

function unavailable() {
  return json({ error: "Chat isn't available right now." }, 503);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const since = Number(url.searchParams.get("since") ?? 0);
  const peek = url.searchParams.get("peek") === "1";
  const ack = url.searchParams.get("ack") === "1";

  try {
    const tokenHash = await readVisitorTokenHash();
    // No cookie is the normal state for most visitors, not an error.
    if (!tokenHash) return json(payload(null, [], "visitor"));

    const thread = await findThreadByTokenHash(tokenHash);
    if (!thread) return json(payload(null, [], "visitor"));

    // The closed-widget badge poll: counters only, no message bodies.
    if (peek) {
      return json({
        thread: toThread(thread, "visitor"),
        messages: [],
        cursor: since,
      });
    }

    const { ok: underLimit } = await rateLimit("chat-poll", 240, 60 * 60);
    if (!underLimit) return json({ error: "Slow down a moment." }, 429);

    const messages = await readMessages(
      thread.id,
      Number.isFinite(since) && since > 0 ? since : 0,
    );

    // Only acknowledge when the widget told us it is genuinely on screen, so
    // the badge means "you haven't looked at this", not "the server sent it".
    if (ack && thread.visitorUnread > 0) {
      await acknowledge(thread.id, "visitor");
      thread.visitorUnread = 0;
    }

    return json(payload(thread, messages, "visitor"));
  } catch (error) {
    console.error("chat GET failed", error);
    return unavailable();
  }
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > CHAT_LIMITS.bytes) {
    return json({ error: "That message is too long." }, 413);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const { body, clientId, company } = (parsed ?? {}) as Record<string, unknown>;

  // Honeypot: a hidden field humans never see. Report success and write
  // nothing, so a bot learns nothing from the response.
  if (typeof company === "string" && company.trim() !== "") {
    return json({ ok: true });
  }

  const draft = normalizeChatDraft(body);
  if (!draft.ok) return json({ error: draft.error }, 400);

  const id =
    typeof clientId === "string" && clientId.length <= CHAT_LIMITS.id
      ? clientId
      : null;

  try {
    const tokenHash = await readVisitorTokenHash();
    const existing = tokenHash ? await findThreadByTokenHash(tokenHash) : null;

    if (!existing) return startThread(draft.body, id);
    return continueThread(existing, draft.body, id);
  } catch (error) {
    console.error("chat POST failed", error);
    return unavailable();
  }
}

async function startThread(body: string, clientId: string | null) {
  const { ok: underLimit } = await rateLimit(
    "chat-thread-new",
    3,
    60 * 60 * 24,
  );
  if (!underLimit) {
    return json({ error: "You've started a few chats already today." }, 429);
  }

  const ipHash = await clientIpHash();
  // rateLimit fails open when Redis is down, so this is the cap that still
  // holds during an outage.
  if ((await recentThreadCount(ipHash)) >= 3) {
    return json({ error: "You've started a few chats already today." }, 429);
  }

  const token = mintVisitorToken();
  const { thread, message } = await createThread({
    tokenHash: hashToken(token),
    ipHash,
    body,
    clientId,
  });
  await attachVisitorCookie(token);

  notifyOwner(thread.id, null, body);
  return json(payload(thread, [message], "visitor"));
}

async function continueThread(
  thread: NonNullable<Awaited<ReturnType<typeof findThreadByTokenHash>>>,
  body: string,
  clientId: string | null,
) {
  // A full thread stops accepting writes rather than silently dropping the
  // oldest messages the way board comments do. Losing the start of a
  // conversation is worse than being told it is full.
  if (thread.messageCount >= CHAT_LIMITS.perThread) {
    return json({ error: "This conversation is full." }, 429);
  }

  // No minimum-interval check here. A read-then-insert guard races under any
  // concurrent burst — exactly the case it would exist to stop — and the
  // per-IP send limit below is a strictly tighter control anyway. When Redis is
  // down and that limit fails open, the per-thread cap above still bounds it.
  const { ok: underLimit } = await rateLimit("chat-send", 20, 60 * 60);
  if (!underLimit) {
    return json(
      { error: "You've sent a lot of messages — try again later." },
      429,
    );
  }

  try {
    // The return value is discarded on purpose: the response below re-reads the
    // whole thread, so the client never has to reconcile a partial append.
    await appendMessage({
      threadId: thread.id,
      role: "visitor",
      body,
      clientId,
    });
  } catch (error) {
    // A retried request carrying the same clientId trips the unique index.
    // That is a duplicate, not a failure — hand back the thread as it stands.
    if (isUniqueViolation(error)) {
      const messages = await readMessages(thread.id, 0);
      return json(payload(thread, messages, "visitor"));
    }
    throw error;
  }

  // Notify once per unread run, not once per message: a visitor typing five
  // lines in a row should produce one email, not five.
  if (thread.ownerUnread === 0) {
    notifyOwner(thread.id, thread.visitorName, body);
  }

  // Re-read rather than patching the pre-write row by hand: the append also
  // reopens an archived thread, and a hand-adjusted copy would report the stale
  // status back to the client.
  const [fresh, messages] = await Promise.all([
    findThreadById(thread.id),
    readMessages(thread.id, 0),
  ]);
  return json(payload(fresh ?? thread, messages, "visitor"));
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

/**
 * Fire-and-forget via after(), so a slow or failing Resend call never delays
 * the visitor's send. The message is already committed by this point, which
 * makes the email strictly best-effort.
 *
 * No reply_to: replying by email would not reach the thread, and an action that
 * silently does nothing is worse than one that isn't offered.
 */
function notifyOwner(threadId: string, name: string | null, body: string) {
  after(async () => {
    try {
      await sendEmail({
        scope: "Chat",
        subject: `New chat from ${displayName({ id: threadId, name })}`,
        text: `${body}\n\n---\nReply: ${SITE_URL}/inbox/${threadId}`,
      });
    } catch (error) {
      console.error("chat notify failed", error);
    }
  });
}

/** Set the name (and optionally email) the widget asks for after the first message. */
export async function PATCH(request: Request) {
  const raw = await request.text();
  if (raw.length > CHAT_LIMITS.bytes) return json({ error: "Too long." }, 413);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const { name, email } = (parsed ?? {}) as Record<string, unknown>;
  const identity = normalizeIdentity(name, email);
  if (!identity.ok) return json({ error: identity.error }, 400);

  try {
    const tokenHash = await readVisitorTokenHash();
    const thread = tokenHash ? await findThreadByTokenHash(tokenHash) : null;
    if (!thread) return json({ error: "No conversation yet." }, 404);

    const updated = await setIdentity(thread.id, identity.name, identity.email);
    const messages = await readMessages(thread.id, 0);
    return json(payload(updated, messages, "visitor"));
  } catch (error) {
    console.error("chat PATCH failed", error);
    return unavailable();
  }
}

/** Self-service erasure. The cookie already identifies the thread, so this is the whole feature. */
export async function DELETE() {
  try {
    const tokenHash = await readVisitorTokenHash();
    const thread = tokenHash ? await findThreadByTokenHash(tokenHash) : null;
    if (thread) await deleteThread(thread.id);
    await clearVisitorCookie();
    return new Response(null, { status: 204, headers: NO_STORE });
  } catch (error) {
    console.error("chat DELETE failed", error);
    return unavailable();
  }
}
