/**
 * The signed-in visitor's session.
 *
 * This sits *beside* lib/chat-identity.ts, not on top of it. That module's
 * anonymous capability cookie is still the default way a thread is resolved and
 * is untouched by any of this; a session only adds a second, stronger way to
 * find the same conversation — one that survives a cleared cookie jar and works
 * on a phone as well as a laptop.
 *
 * The cookie is `<identityId>.<expiry>.<hmac>`, the same stateless shape as
 * lib/admin-auth.ts. Stateless is the right trade here: the only thing the
 * cookie asserts is "this is identity X", and if that row is later deleted the
 * lookup simply returns null and the visitor falls back to anonymous. There is
 * no privilege to revoke in a hurry.
 */

import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const CHAT_SESSION_COOKIE = "chat_session";

/**
 * Ninety days. Long enough that "I'll come back to this next month" works
 * without a second sign-in, short enough that a stateless cookie with no
 * revocation path isn't valid indefinitely.
 */
const SESSION_MS = 1000 * 60 * 60 * 24 * 90;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`chat.${payload}`)
    .digest("base64url");
}

/** Equal-length constant-time compare; see lib/admin-auth.ts for the reasoning. */
function safeEqual(a: string, b: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function signChatSession(
  identityId: string,
  secret: string,
  now: number,
): string {
  const payload = `${identityId}.${now + SESSION_MS}`;
  return `${payload}.${sign(payload, secret)}`;
}

/** The identity id the cookie vouches for, or null if it doesn't. */
export function verifyChatSession(
  value: string | undefined | null,
  secret: string,
  now: number,
): string | null {
  if (!value) return null;

  const split = value.lastIndexOf(".");
  if (split <= 0) return null;

  const payload = value.slice(0, split);
  if (!safeEqual(value.slice(split + 1), sign(payload, secret))) return null;

  // The payload is `<identityId>.<expiry>`. A uuid contains no dots, so the
  // last one is unambiguous.
  const boundary = payload.lastIndexOf(".");
  if (boundary <= 0) return null;

  const identityId = payload.slice(0, boundary);
  const expiresAt = Number(payload.slice(boundary + 1));
  if (!identityId) return null;
  // The expiry sits inside the MAC, so it cannot be pushed out by the holder.
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return null;

  return identityId;
}

/** null when AUTH_SECRET is unset, so an unconfigured deploy has no sessions at all. */
export async function readSessionIdentityId(): Promise<string | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const value = (await cookies()).get(CHAT_SESSION_COOKIE)?.value;
  return verifyChatSession(value, secret, Date.now());
}

export async function attachSessionCookie(identityId: string): Promise<void> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return;
  (await cookies()).set(
    CHAT_SESSION_COOKIE,
    signChatSession(identityId, secret, Date.now()),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MS / 1000,
    },
  );
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(CHAT_SESSION_COOKIE);
}
