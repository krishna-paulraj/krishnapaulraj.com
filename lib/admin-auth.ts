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

import { isOAuthProvider, type OAuthProvider } from "@/lib/chat";
import { readSessionIdentityId } from "@/lib/chat-session";
import { findIdentityById } from "@/lib/chat-store";
import { enabledProviders } from "@/lib/oauth";

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

type EnvLike = Record<string, string | undefined>;

/** `OWNER_GITHUB_ID` / `OWNER_GOOGLE_ID` — the provider's numeric/opaque account id. */
function ownerAccountId(
  provider: OAuthProvider,
  env: EnvLike = process.env,
): string | null {
  const value = env[`OWNER_${provider.toUpperCase()}_ID`]?.trim();
  return value ? value : null;
}

/**
 * Which providers can actually let the owner in: configured for sign-in *and*
 * carrying an allowlisted account id. Usually empty, in which case the gate is
 * the passphrase alone.
 */
export function ownerProviders(env: EnvLike = process.env): OAuthProvider[] {
  return enabledProviders(env).filter(
    (provider) => ownerAccountId(provider, env) !== null,
  );
}

/**
 * Whether the signed-in visitor is the owner.
 *
 * This is the second, better door to the inbox. ADMIN_SECRET is a shared bearer
 * string: whoever holds it reads every private conversation, rotating it is the
 * only revocation, and it carries no second factor. An allowlisted provider
 * account has none of those properties — there is no secret to leak, and the
 * provider's own 2FA comes along for free.
 *
 * The check is against the immutable account id rather than a login or email,
 * because both of those can be changed and, on GitHub, re-registered by
 * somebody else.
 */
async function isOwnerAccount(): Promise<boolean> {
  const identityId = await readSessionIdentityId();
  if (!identityId) return false;

  const identity = await findIdentityById(identityId);
  if (!identity || !isOAuthProvider(identity.provider)) return false;

  const expected = ownerAccountId(identity.provider);
  if (!expected) return false;

  return safeEqual(identity.providerAccountId, expected);
}

/**
 * Line one of every owner-only handler. Enforcement is per-route rather than in
 * a proxy: Next's own guidance is that proxy checks are optimistic and can't be
 * the only line of defense, so the per-route check gets written either way and
 * a proxy would only duplicate it — while putting a Node function in front of
 * every request on the site to protect five routes.
 *
 * The passphrase is checked first and without touching the database, so the
 * common case stays cheap and — importantly — keeps working if the OAuth app is
 * ever misconfigured. Locking yourself out of your own inbox because a provider
 * changed something is not a failure mode worth accepting for a portfolio.
 *
 * Returns false when nothing is configured, so an unconfigured deploy is locked
 * rather than open.
 */
export async function isOwner(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (secret) {
    const value = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (verifyAdminSession(value, secret, Date.now())) return true;
  }
  return isOwnerAccount();
}
