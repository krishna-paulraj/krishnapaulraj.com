/**
 * Step one of sign-in: park the flow's state in a signed cookie and hand the
 * visitor to the provider.
 *
 * This is a top-level navigation, not a fetch, so every outcome — including
 * every failure — is a redirect back to a page. A JSON error body would leave
 * the visitor staring at raw text in the address bar.
 */

import { cookies } from "next/headers";

import { isOAuthProvider } from "@/lib/chat";
import {
  OAUTH_STATE_COOKIE,
  buildAuthorizeUrl,
  callbackUrl,
  createState,
  providerCredentials,
  resolveOrigin,
  safeReturnTo,
  signInRedirect,
  signState,
} from "@/lib/oauth";
import { rateLimit } from "@/lib/redis";

const NO_STORE = { "Cache-Control": "no-store" } as const;

/** Ten minutes, matching the state's own TTL — the cookie should not outlive it. */
const STATE_COOKIE_SECONDS = 600;

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/auth/[provider]">,
) {
  const { provider } = await ctx.params;
  const url = new URL(request.url);
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));

  if (!isOAuthProvider(provider)) return signInRedirect(returnTo, false);

  const secret = process.env.AUTH_SECRET;
  const credentials = providerCredentials(provider);
  // Unconfigured is not an error state to shout about — the buttons that lead
  // here are only rendered when enabledProviders() says otherwise, so reaching
  // this means a hand-typed URL.
  if (!secret || !credentials) return signInRedirect(returnTo, false);

  // Bounded because each start writes a cookie and sends someone to a third
  // party. Generous, because a visitor who bounces off a consent screen twice
  // and retries is doing nothing wrong.
  const { ok: underLimit } = await rateLimit("oauth-start", 20, 60 * 15);
  if (!underLimit) return signInRedirect(returnTo, false);

  const state = createState({ provider, returnTo, now: Date.now() });

  (await cookies()).set(OAUTH_STATE_COOKIE, signState(state, secret), {
    httpOnly: true,
    // Lax, not Strict: the provider redirects back with a top-level GET, and
    // Strict would withhold the cookie on exactly that navigation — the flow
    // would fail every time with nothing obviously wrong.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_COOKIE_SECONDS,
  });

  const redirectUri = callbackUrl(resolveOrigin(request.url), provider);
  return new Response(null, {
    status: 303,
    headers: {
      ...NO_STORE,
      Location: buildAuthorizeUrl({
        provider,
        clientId: credentials.clientId,
        redirectUri,
        state,
      }),
    },
  });
}
