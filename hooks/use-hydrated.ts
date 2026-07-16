"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True after hydration, false during SSR and the initial client render.
 * Prefer this over the `useEffect(() => setMounted(true), [])` pattern —
 * it is concurrent-safe and avoids setState-in-effect cascading renders.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
