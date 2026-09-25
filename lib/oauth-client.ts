/**
 * The two network steps of the sign-in flow: trade the authorization code for
 * an access token, then read the profile behind it.
 *
 * Kept apart from lib/oauth.ts so that module stays pure and unit-testable,
 * the same way lib/chat-store.ts is kept apart from lib/chat.ts.
 *
 * The access token never leaves this module and is never persisted. It exists
 * for the duration of one profile read and is then unreferenced — which is why
 * prisma/schema.prisma has no token columns to encrypt, rotate, or leak.
 */

import { normalizeProviderProfile, type OAuthProvider } from "@/lib/chat";
import {
  honoursPkce,
  tokenUrlFor,
  type ProviderCredentials,
} from "@/lib/oauth";

/**
 * A provider that hangs would otherwise hang the callback, and with it the tab
 * the visitor is staring at. Ten seconds is far past any healthy response.
 */
const TIMEOUT_MS = 10_000;

/** GitHub rejects API requests that don't identify themselves. */
const USER_AGENT = "krishnapaulraj.com";

export type OAuthProfile = {
  /**
   * The provider's own immutable id — never the login or the email. GitHub
   * logins can be released and re-registered by someone else, so keying an
   * account on one would make takeover a matter of waiting for a rename.
   */
  providerAccountId: string;
  name: string | null;
  email: string | null;
  emailVerified: boolean;
  avatarUrl: string | null;
};

export class OAuthError extends Error {}

async function postForm(
  url: string,
  body: URLSearchParams,
): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      // Without this GitHub answers in form-encoding rather than JSON.
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": USER_AGENT,
    },
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!res.ok || !data) {
    throw new OAuthError(`token endpoint returned ${res.status}`);
  }
  // GitHub reports a bad code as HTTP 200 with an `error` key, so the status
  // alone is not enough to tell success from failure.
  if (typeof data.error === "string") {
    throw new OAuthError(`token endpoint rejected the code: ${data.error}`);
  }
  return data;
}

export async function exchangeCode(input: {
  provider: OAuthProvider;
  code: string;
  verifier: string;
  redirectUri: string;
  credentials: ProviderCredentials;
}): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    client_id: input.credentials.clientId,
    client_secret: input.credentials.clientSecret,
    redirect_uri: input.redirectUri,
  });

  // Only sent where it is actually checked. GitHub ignores it, and sending a
  // verifier to a provider that does not verify it invites the reader to
  // believe in a protection that isn't there.
  if (honoursPkce(input.provider)) {
    body.set("code_verifier", input.verifier);
  }

  const data = await postForm(tokenUrlFor(input.provider), body);
  const token = data.access_token;
  if (typeof token !== "string" || !token) {
    throw new OAuthError("token endpoint returned no access token");
  }
  return token;
}

async function getJson(url: string, token: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
      "user-agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new OAuthError(`profile request returned ${res.status}`);
  return res.json();
}

export async function fetchProfile(
  provider: OAuthProvider,
  token: string,
): Promise<OAuthProfile> {
  return provider === "github" ? githubProfile(token) : googleProfile(token);
}

async function githubProfile(token: string): Promise<OAuthProfile> {
  const user = (await getJson("https://api.github.com/user", token)) as Record<
    string,
    unknown
  >;

  const id = user.id;
  if (typeof id !== "number" && typeof id !== "string") {
    throw new OAuthError("github profile had no id");
  }

  const profile = normalizeProviderProfile({
    // `name` is optional on GitHub and blank on plenty of accounts, so the
    // login is the fallback that keeps the inbox readable.
    name:
      (typeof user.name === "string" && user.name) ||
      (typeof user.login === "string" ? user.login : null),
    email: await githubEmail(token, user),
    // Reached only via the verified primary below, or left unset.
    emailVerified: true,
    avatarUrl: typeof user.avatar_url === "string" ? user.avatar_url : null,
  });

  return { providerAccountId: String(id), ...profile };
}

/**
 * GitHub's /user endpoint returns a null email whenever the account keeps it
 * private, which is the default. The dedicated endpoint is the only way to get
 * a verified address, and it needs the user:email scope — so a failure here is
 * an expected outcome, not an error worth failing the sign-in over.
 */
async function githubEmail(
  token: string,
  user: Record<string, unknown>,
): Promise<string | null> {
  try {
    const emails = (await getJson(
      "https://api.github.com/user/emails",
      token,
    )) as Array<{ email?: unknown; primary?: unknown; verified?: unknown }>;

    if (Array.isArray(emails)) {
      const primary = emails.find(
        (entry) => entry.primary === true && entry.verified === true,
      );
      const anyVerified = emails.find((entry) => entry.verified === true);
      const chosen = (primary ?? anyVerified)?.email;
      if (typeof chosen === "string") return chosen;
    }
  } catch {
    // Scope declined or the endpoint is unhappy. Fall through — an account
    // without a reachable email is still a perfectly good account.
  }
  return typeof user.email === "string" ? user.email : null;
}

async function googleProfile(token: string): Promise<OAuthProfile> {
  // The id_token would carry the same claims, but trusting it means verifying
  // a JWT against Google's rotating JWKS. The userinfo endpoint gives the same
  // answer over a TLS connection to Google, with no signature check to get
  // wrong.
  const user = (await getJson(
    "https://openidconnect.googleapis.com/v1/userinfo",
    token,
  )) as Record<string, unknown>;

  const sub = user.sub;
  if (typeof sub !== "string" || !sub) {
    throw new OAuthError("google profile had no subject");
  }

  const profile = normalizeProviderProfile({
    name:
      (typeof user.name === "string" && user.name) ||
      (typeof user.given_name === "string" ? user.given_name : null),
    email: typeof user.email === "string" ? user.email : null,
    emailVerified: user.email_verified === true,
    avatarUrl: typeof user.picture === "string" ? user.picture : null,
  });

  return { providerAccountId: sub, ...profile };
}
