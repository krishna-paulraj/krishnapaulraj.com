"use client";

import { useEffect, useRef } from "react";

/**
 * Copyright year that self-corrects in the browser.
 *
 * On static pages `new Date().getFullYear()` is baked in at build time and
 * goes stale after New Year. The server-rendered year is kept for the initial
 * HTML (suppressHydrationWarning absorbs any mismatch) and a direct DOM write
 * in an effect brings it up to date without a state update.
 */
export function FooterYear() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const year = String(new Date().getFullYear());
    if (ref.current && ref.current.textContent !== year) {
      ref.current.textContent = year;
    }
  }, []);

  return (
    <span ref={ref} suppressHydrationWarning>
      {new Date().getFullYear()}
    </span>
  );
}
