"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * What the OAuth callback appends to the URL it sends the visitor back to.
 * A fragment rather than a query parameter: it never reaches the server, never
 * survives into a shared link, and is gone from the address bar a tick later.
 */
const RETURN_HASH = "#chat";
const FAILED_HASH = "#chat-failed";

/**
 * Captured on first read and never again, so stripping the fragment from the
 * address bar afterwards does not change the answer — the widget would
 * otherwise close itself the moment it tidied the URL.
 */
let captured: string | null = null;

/** The value is fixed after capture, so there is nothing to notify about. */
function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): string {
  captured ??= window.location.hash;
  return captured;
}

/**
 * The server has no fragment — browsers never send one. Returning the empty
 * value here is what keeps hydration clean: React renders the closed widget on
 * both sides, then re-renders with the real fragment once hydrated.
 */
function getServerSnapshot(): string {
  return "";
}

export type SignInReturn = {
  /** The visitor has just come back from a provider's consent screen. */
  resumed: boolean;
  failed: boolean;
};

export function useSignInReturn(): SignInReturn {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const resumed = hash === RETURN_HASH || hash === FAILED_HASH;

  useEffect(() => {
    if (!resumed) return;
    // Updating an external system — the address bar — rather than React state,
    // so a refresh or a copied link doesn't replay the outcome forever.
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  }, [resumed]);

  return { resumed, failed: hash === FAILED_HASH };
}
