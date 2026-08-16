/**
 * One thread, from the owner's side: read, reply, archive, delete.
 *
 * The owner is exempt from rate limiting on purpose — the same reasoning as
 * board comment moderation, where being throttled out of your own tools is the
 * failure mode worth avoiding.
 */

import { isOwner } from "@/lib/admin-auth";
import { CHAT_LIMITS, normalizeChatDraft } from "@/lib/chat";
import {
  acknowledge,
  appendMessage,
  deleteThread,
  findThreadById,
  payload,
  readMessages,
  setStatus,
} from "@/lib/chat-store";

const NO_STORE = { "Cache-Control": "no-store" } as const;

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: NO_STORE });
}

const denied = () => json({ error: "Not allowed." }, 401);
const missing = () => json({ error: "That conversation is gone." }, 404);

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  if (!(await isOwner())) return denied();

  const { id } = await context.params;
  const url = new URL(request.url);
  const since = Number(url.searchParams.get("since") ?? 0);
  const ack = url.searchParams.get("ack") === "1";

  try {
    const thread = await findThreadById(id);
    if (!thread) return missing();

    const messages = await readMessages(
      thread.id,
      Number.isFinite(since) && since > 0 ? since : 0,
    );

    if (ack && thread.ownerUnread > 0) {
      await acknowledge(thread.id, "owner");
      thread.ownerUnread = 0;
    }

    return json(payload(thread, messages, "owner"));
  } catch (error) {
    console.error("thread read failed", error);
    return json({ error: "Couldn't load that conversation." }, 503);
  }
}

export async function POST(request: Request, context: Context) {
  if (!(await isOwner())) return denied();

  const raw = await request.text();
  if (raw.length > CHAT_LIMITS.bytes) return json({ error: "Too long." }, 413);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const draft = normalizeChatDraft((parsed as { body?: unknown })?.body);
  if (!draft.ok) return json({ error: draft.error }, 400);

  const { id } = await context.params;
  try {
    const thread = await findThreadById(id);
    if (!thread) return missing();

    await appendMessage({
      threadId: thread.id,
      role: "owner",
      body: draft.body,
      clientId: null,
    });

    // Replying is also reading, so the unread badge clears here rather than
    // waiting for the next visibility ack.
    if (thread.ownerUnread > 0) await acknowledge(thread.id, "owner");

    const fresh = await findThreadById(thread.id);
    const messages = await readMessages(thread.id, 0);
    return json(payload(fresh, messages, "owner"));
  } catch (error) {
    console.error("thread reply failed", error);
    return json({ error: "Couldn't send that reply." }, 503);
  }
}

export async function PATCH(request: Request, context: Context) {
  if (!(await isOwner())) return denied();

  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const status = (parsed as { status?: unknown })?.status;
  if (status !== "open" && status !== "archived") {
    return json({ error: "Unknown status." }, 400);
  }

  const { id } = await context.params;
  try {
    const thread = await setStatus(id, status);
    return json({ thread: payload(thread, [], "owner").thread });
  } catch (error) {
    console.error("thread status failed", error);
    return missing();
  }
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await isOwner())) return denied();

  const { id } = await context.params;
  try {
    await deleteThread(id);
    return new Response(null, { status: 204, headers: NO_STORE });
  } catch (error) {
    console.error("thread delete failed", error);
    return missing();
  }
}
