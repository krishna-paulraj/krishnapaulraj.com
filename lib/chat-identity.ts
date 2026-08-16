/**
 * How an anonymous visitor is bound to their thread.
 *
 * The cookie carries a 256-bit random token; the database stores only its
 * SHA-256. The token needs no signature because it is a capability, not a
 * claim — there is nothing to forge, and the hash lookup *is* the verification.
 *
 * The consequence that matters: the visitor API never accepts a thread id from
 * the client. Every visitor request resolves its thread through this module, so
 * there is no parameter to tamper with and no ownership check a future handler
 * can forget to write.
 */

import { cookies, headers } from "next/headers";
import { createHash, randomBytes } from "node:crypto";

export const CHAT_COOKIE = "chat_token";

const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 180;

export function mintVisitorToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * The caller's IP, hashed. Stored on the thread so the per-IP cap still holds
 * when Redis is unreachable — rateLimit() fails open by design, and this is the
 * backstop that keeps that from meaning "unlimited threads".
 */
export async function clientIpHash(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local";
  return createHash("sha256").update(ip).digest("hex");
}

/** The token hash for this request, or null if the visitor has no cookie yet. */
export async function readVisitorTokenHash(): Promise<string | null> {
  const token = (await cookies()).get(CHAT_COOKIE)?.value;
  return token ? hashToken(token) : null;
}

/**
 * Attach a freshly minted token. Only callable from a route handler — Next 16
 * removed synchronous cookie access and forbids Set-Cookie during render, which
 * is why the cookie is issued on the response to the first POST rather than
 * anywhere in the page tree.
 */
export async function attachVisitorCookie(token: string): Promise<void> {
  (await cookies()).set(CHAT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SIX_MONTHS_SECONDS,
  });
}

export async function clearVisitorCookie(): Promise<void> {
  (await cookies()).delete(CHAT_COOKIE);
}
