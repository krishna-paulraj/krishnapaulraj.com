"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Live media-query state. Returns false during SSR, so callers must be written
 * so the desktop/non-matching branch is the safe one to render first.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Matches Tailwind's `sm` breakpoint, below which the chat panel goes full-screen. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 39.99rem)");
}
