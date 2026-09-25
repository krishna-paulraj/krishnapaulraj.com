/**
 * Step two of sign-in: verify the state, trade the code for a profile, and
 * decide what happens to whatever conversation this browser was already having.
 *
 * That last part is the substance. Sign-in on a portfolio chat is worth having
 * precisely because it reunites conversations that the cookie alone would leave
 * scattered across devices, so the four cases below are the feature — not
 * bookkeeping around it.
 */

import { cookies } from "next/headers";

import { isOAuthProvider } from "@/lib/chat";
import { clearVisitorCookie, readVisitorTokenHash } from "@/lib/chat-identity";
import { attachSessionCookie } from "@/lib/chat-session";
import {
  adoptThread,
  findThreadByIdentity,
  findThreadByTokenHash,
  mergeThreads,
  upsertIdentity,
} from "@/lib/chat-store";
import {
  OAUTH_STATE_COOKIE,
  callbackUrl,
  providerCredentials,
  resolveOrigin,
  signInRedirect,
  stateMatches,
  verifyState,
} from "@/lib/oauth";
import { exchangeCode, fetchProfile } from "@/lib/oauth-client";

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/auth/[provider]/callback">,
) {
  const { provider } = await ctx.params;
  const url = new URL(request.url);
  const jar = await cookies();

  // Single use, cleared before anything can go wrong later. A state cookie that
  // survives its own callback is a replayable one.
  const rawState = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete(OAUTH_STATE_COOKIE);

  const secret = process.env.AUTH_SECRET;
  if (!secret || !isOAuthProvider(provider)) return signInRedirect("/", false);

  const state = verifyState(rawState, secret, Date.now());
  // No usable state means we cannot know where this visitor came from, so "/"
  // is the only honest destination.
  if (!state) return signInRedirect("/", false);

  // Declining consent is a decision, not a failure. Send them back to where
  // they were with the widget open and no scolding.
  if (url.searchParams.get("error")) {
    return signInRedirect(state.returnTo, true);
  }

  if (!stateMatches(state, provider, url.searchParams.get("state"))) {
    return signInRedirect(state.returnTo, false);
  }

  const code = url.searchParams.get("code");
  const credentials = providerCredentials(provider);
  if (!code || !credentials) return signInRedirect(state.returnTo, false);

  try {
    const token = await exchangeCode({
      provider,
      code,
      verifier: state.verifier,
      redirectUri: callbackUrl(resolveOrigin(request.url), provider),
      credentials,
    });
    const profile = await fetchProfile(provider, token);

    const identity = await upsertIdentity({ provider, ...profile });
    await reconcileThreads(identity);
    await attachSessionCookie(identity.id);

    return signInRedirect(state.returnTo, true);
  } catch (error) {
    // Provider, not payload. Nothing about a visitor's profile — name, email,
    // account id — belongs in a log line for a portfolio site.
    console.error(`oauth callback failed for ${provider}`, error);
    return signInRedirect(state.returnTo, false);
  }
}

/**
 * Reconcile the thread this browser was using with the one the account already
 * owns. Each case has a wrong answer that loses — or leaks — real messages:
 *
 *  1. Neither exists — nothing to do. The next send opens a thread already
 *     bound to the account.
 *  2. Only an unclaimed anonymous thread — adopt it. This is the common path:
 *     someone types a message, is asked who they are, and signs in instead.
 *  3. Only the account's thread — nothing to do; resolveVisitor() finds it.
 *     This is the payoff, a conversation reappearing on a new device.
 *  4. Both, and different — merge. Keeping one silently discards real messages;
 *     keeping both hands the owner two rows for one person, which is the exact
 *     problem sign-in is meant to solve.
 */
async function reconcileThreads(
  identity: Awaited<ReturnType<typeof upsertIdentity>>,
): Promise<void> {
  const tokenHash = await readVisitorTokenHash();
  const anonymous = tokenHash ? await findThreadByTokenHash(tokenHash) : null;
  const owned = await findThreadByIdentity(identity.id);

  // A cookie left behind by whoever used this browser last must never be
  // absorbed into a different account. On a shared machine that would hand the
  // new arrival a permanent, signed-in claim on someone else's conversation —
  // and unlike the cookie itself, which the next sign-out clears, that claim
  // would not be recoverable. Drop the stale cookie and start clean instead.
  const claimable =
    anonymous && (!anonymous.identity || anonymous.identity.id === identity.id)
      ? anonymous
      : null;
  if (anonymous && !claimable) await clearVisitorCookie();

  if (!claimable) return;

  if (!owned) {
    await adoptThread({ threadId: claimable.id, identity });
    return;
  }

  if (owned.id !== claimable.id) {
    await mergeThreads({ fromId: claimable.id, intoId: owned.id });
    return;
  }

  // The same row reached both ways: already adopted on an earlier visit, but
  // the profile may have changed since, so let it refresh the name and email.
  await adoptThread({ threadId: owned.id, identity });
}
