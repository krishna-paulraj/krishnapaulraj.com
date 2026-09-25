/**
 * Sign-in with GitHub or Google, hand-rolled on node:crypto.
 *
 * This module is the pure, testable half: which providers exist, how their
 * authorize URLs are built, how the flow's state is signed, and what counts as
 * a safe place to return to. Nothing here opens a socket — the two network
 * steps live in lib/oauth-client.ts, mirroring the lib/chat.ts ↔ lib/chat-store.ts
 * split this codebase already uses.
 *
 * Why no auth library. This is sign-in only: the provider's access token is
 * used once, inside the callback, to read a profile — and then discarded. There
 * are no refresh tokens to rotate, no re-consent, and no later API calls made
 * on the visitor's behalf. What is left is an authorization-code exchange,
 * which is one signed cookie and two fetches, in a codebase that already
 * hand-rolls its session cookies in lib/admin-auth.ts.
 *
 * Sign-in is strictly additive. The anonymous cookie in lib/chat-identity.ts is
 * still the default path and still the one most visitors take; nothing here
 * puts an account in front of a first message.
 */

import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { isOAuthProvider, type OAuthProvider } from "@/lib/chat";
import { SITE_URL } from "@/lib/constants";

export type { OAuthProvider };

/** How long a half-finished sign-in stays valid. Enough to read a consent screen. */
const STATE_TTL_MS = 10 * 60 * 1000;

/** Cap on returnTo, so a crafted link can't push an oversized cookie. */
const MAX_RETURN_TO = 512;

/** Control characters, which have no business in a redirect target. */
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

type ProviderSpec = {
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  /**
   * Whether the provider actually honours PKCE. GitHub's OAuth Apps do not —
   * they ignore `code_challenge` without complaint. We still send it (harmless,
   * and it starts working for free if that ever changes), but this flag records
   * that for GitHub the signed state cookie is the *only* CSRF defence rather
   * than the second one. That is the difference between defence-in-depth and a
   * single point of failure, and it should be written down, not assumed.
   */
  pkce: boolean;
  authorizeParams?: Record<string, string>;
  envPrefix: string;
};

const SPECS: Record<OAuthProvider, ProviderSpec> = {
  github: {
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    // read:user on its own returns a null email whenever the visitor keeps
    // theirs private, which is the default on a large share of accounts.
    // user:email is what makes a verified address reachable at all.
    scope: "read:user user:email",
    pkce: false,
    envPrefix: "GITHUB",
  },
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    pkce: true,
    // select_account so someone signed into several Google accounts is asked
    // which one, instead of silently getting whichever is first.
    authorizeParams: { prompt: "select_account", access_type: "online" },
    envPrefix: "GOOGLE",
  },
};

export type ProviderCredentials = { clientId: string; clientSecret: string };

/**
 * Looser than NodeJS.ProcessEnv, which Next types with a required NODE_ENV.
 * These functions only ever read named keys, so demanding the full shape would
 * buy nothing and make them awkward to test with a two-key object.
 */
type EnvLike = Record<string, string | undefined>;

/** null when the provider isn't configured — the normal state locally. */
export function providerCredentials(
  provider: OAuthProvider,
  env: EnvLike = process.env,
): ProviderCredentials | null {
  const prefix = SPECS[provider].envPrefix;
  const clientId = env[`${prefix}_CLIENT_ID`];
  const clientSecret = env[`${prefix}_CLIENT_SECRET`];
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

/**
 * Which sign-in buttons to render. Read on the server and handed down as a
 * prop, so the widget never makes a request just to discover that nothing is
 * configured — and so no client id has to be exposed as NEXT_PUBLIC_.
 *
 * AUTH_SECRET gates all of them: with no secret there is nothing to sign a
 * session with, so showing a button would only lead somewhere broken.
 */
export function enabledProviders(env: EnvLike = process.env): OAuthProvider[] {
  if (!env.AUTH_SECRET) return [];
  return (Object.keys(SPECS) as OAuthProvider[]).filter(
    (provider) => providerCredentials(provider, env) !== null,
  );
}

/**
 * The origin the provider redirects back to. It has to match what is registered
 * on the provider's side byte for byte, which is also why production pins to
 * SITE_URL instead of trusting the request: the Host header is caller-supplied,
 * and reflecting it here would let someone aim the callback at their own site.
 */
export function resolveOrigin(
  requestUrl: string,
  env: EnvLike = process.env,
): string {
  const override = env.AUTH_URL?.trim();
  if (override) return override.replace(/\/+$/, "");
  if (env.NODE_ENV === "production") return SITE_URL;
  return new URL(requestUrl).origin;
}

export function callbackUrl(origin: string, provider: OAuthProvider): string {
  return `${origin}/api/auth/${provider}/callback`;
}

/* ── PKCE ─────────────────────────────────────────────────────────────────── */

export function createVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function challengeFor(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

/* ── Flow state ───────────────────────────────────────────────────────────── */

export const OAUTH_STATE_COOKIE = "chat_oauth";

export type OAuthState = {
  /** The nonce echoed through the provider and compared on the way back. */
  nonce: string;
  verifier: string;
  returnTo: string;
  provider: OAuthProvider;
  expiresAt: number;
};

/**
 * Reject anything that is not a path on this site. Without this, returnTo is an
 * open redirect — and a link to our own domain that bounces the visitor
 * elsewhere *after* a genuine sign-in is exactly what a phishing page wants,
 * because the URL the victim inspects really is ours.
 *
 * Both `//evil.com` and `/\evil.com` are protocol-relative in browsers, so
 * checking for a leading slash is not enough on its own.
 */
export function safeReturnTo(value: unknown): string {
  if (typeof value !== "string") return "/";
  const path = value.trim();
  if (!path.startsWith("/")) return "/";
  if (path.startsWith("//") || path.startsWith("/\\")) return "/";
  if (path.length > MAX_RETURN_TO) return "/";
  // A newline here would let the value break out into a second response header.
  if (CONTROL_CHARS.test(path)) return "/";
  return path;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`oauth.${payload}`)
    .digest("base64url");
}

/**
 * Constant-time compare. Hashing both sides first guarantees equal-length
 * buffers, so neither length nor content leaks through timing — the same idiom
 * as lib/admin-auth.ts and lib/board-auth.ts.
 */
function safeEqual(a: string, b: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

/**
 * The in-flight state, signed and parked in an HttpOnly cookie.
 *
 * HttpOnly and SameSite already keep page scripts out. The signature covers
 * what they do not: a cookie written by something else on the domain — a
 * sibling subdomain, or a MITM over plain http in local development — which is
 * precisely how session fixation against the state parameter works.
 */
export function signState(state: OAuthState, secret: string): string {
  const payload = Buffer.from(JSON.stringify(state), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyState(
  value: string | undefined | null,
  secret: string,
  now: number,
): OAuthState | null {
  if (!value) return null;

  const split = value.lastIndexOf(".");
  if (split <= 0) return null;

  const payload = value.slice(0, split);
  if (!safeEqual(value.slice(split + 1), sign(payload, secret))) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;

  const { nonce, verifier, returnTo, provider, expiresAt } = parsed as Record<
    string,
    unknown
  >;

  if (typeof nonce !== "string" || !nonce) return null;
  if (typeof verifier !== "string" || !verifier) return null;
  if (!isOAuthProvider(provider)) return null;
  if (typeof expiresAt !== "number" || !(expiresAt > now)) return null;

  return {
    nonce,
    verifier,
    provider,
    returnTo: safeReturnTo(returnTo),
    expiresAt,
  };
}

export function createState(input: {
  provider: OAuthProvider;
  returnTo: unknown;
  now: number;
}): OAuthState {
  return {
    nonce: randomBytes(16).toString("base64url"),
    verifier: createVerifier(),
    provider: input.provider,
    returnTo: safeReturnTo(input.returnTo),
    expiresAt: input.now + STATE_TTL_MS,
  };
}

/** Stops a callback for one provider from replaying another provider's state. */
export function stateMatches(
  state: OAuthState,
  provider: OAuthProvider,
  nonce: string | null,
): boolean {
  if (state.provider !== provider) return false;
  if (!nonce) return false;
  return safeEqual(state.nonce, nonce);
}

/* ── Authorize URL ────────────────────────────────────────────────────────── */

export function buildAuthorizeUrl(input: {
  provider: OAuthProvider;
  clientId: string;
  redirectUri: string;
  state: OAuthState;
}): string {
  const spec = SPECS[input.provider];
  const url = new URL(spec.authorizeUrl);

  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", spec.scope);
  url.searchParams.set("state", input.state.nonce);
  url.searchParams.set("code_challenge", challengeFor(input.state.verifier));
  url.searchParams.set("code_challenge_method", "S256");

  for (const [key, value] of Object.entries(spec.authorizeParams ?? {})) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

/**
 * How every sign-in attempt ends, successful or not.
 *
 * The whole flow is a top-level navigation, so the outcome has to be a page the
 * visitor can look at — a JSON error body would leave them staring at raw text
 * in the address bar. The result is carried in a fragment rather than a query
 * parameter so it survives nowhere: not in the URL bar after the widget strips
 * it, not in a shared link, and not in the referrer sent to the next site.
 */
export function signInRedirect(path: string, ok: boolean): Response {
  return new Response(null, {
    // 303 so the browser follows with a GET no matter what it sent here.
    status: 303,
    headers: {
      "Cache-Control": "no-store",
      Location: `${safeReturnTo(path)}${ok ? "#chat" : "#chat-failed"}`,
    },
  });
}

export function tokenUrlFor(provider: OAuthProvider): string {
  return SPECS[provider].tokenUrl;
}

export function honoursPkce(provider: OAuthProvider): boolean {
  return SPECS[provider].pkce;
}
