/**
 * Owner authentication for /inbox.
 *
 * The board's model — a passphrase in localStorage, replayed as a header — is
 * fine for public board data but wrong here: the inbox exposes visitor emails
 * and private message bodies, and localStorage is readable by any script on the
 * page. So the passphrase is exchanged once for an HttpOnly session cookie and
 * never stored client-side at all.
 *
 * The cookie is `<expiry>.<hmac>`. Because the expiry sits inside the MAC it
 * cannot be extended, and because there is exactly one principal there is no
 * user or session id to carry. Rotating ADMIN_SECRET logs everyone out, which
 * is the only revocation v1 needs.
 */

import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "admin_session";

const SESSION_MS = 1000 * 60 * 60 * 24 * 7;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`admin.${payload}`)
    .digest("base64url");
}

/**
 * Constant-time compare. Hashing both sides first guarantees equal-length
 * buffers for timingSafeEqual, so neither length nor content leaks through
 * timing — the same idiom as lib/board-auth.ts.
 */
function safeEqual(a: string, b: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function signAdminSession(secret: string, now: number): string {
  const payload = String(now + SESSION_MS);
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSession(
  value: string | undefined | null,
  secret: string,
  now: number,
): boolean {
  if (!value) return false;

  const split = value.lastIndexOf(".");
  if (split <= 0) return false;

  const payload = value.slice(0, split);
  const provided = value.slice(split + 1);
  if (!safeEqual(provided, sign(payload, secret))) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > now;
}

export async function attachAdminCookie(secret: string): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE, signAdminSession(secret, Date.now()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

export async function clearAdminCookie(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

/**
 * Line one of every owner-only handler. Enforcement is per-route rather than in
 * a proxy: Next's own guidance is that proxy checks are optimistic and can't be
 * the only line of defense, so the per-route check gets written either way and
 * a proxy would only duplicate it — while putting a Node function in front of
 * every request on the site to protect five routes.
 *
 * Returns false when ADMIN_SECRET is unset, so an unconfigured deploy is locked
 * rather than open.
 */
export async function isOwner(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifyAdminSession(value, secret, Date.now());
}
