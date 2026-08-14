"use client";

import { useTheme } from "next-themes";

import { CloudShader } from "@/components/ui/cloud-shader";
import { useHydrated } from "@/hooks/use-hydrated";

/**
 * Full-bleed sky behind a page. The palette feeds WebGL uniforms, not
 * CSS, so it can't follow the site's custom properties — the wrapper picks a
 * palette per theme after hydration, and until then shows a plain CSS sky
 * (which *can* theme itself), so dark mode never flashes a daylight canvas.
 *
 * A background-tinted veil sits over the canvas, fading heavier toward the
 * bottom: the clouds stay a subtle atmosphere at the top of the viewport
 * while the content below reads against near-solid background.
 */
const LIGHT = {
  skyTopColor: "#3876ba",
  skyBottomColor: "#8cbfe8",
  cloudColor: "#fbf8f2",
};

const DARK = {
  skyTopColor: "#090e1c",
  skyBottomColor: "#1e2a45",
  cloudColor: "#8fa1c7",
};

export function CloudBackdrop() {
  const hydrated = useHydrated();
  const { resolvedTheme } = useTheme();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {hydrated ? (
        <CloudShader
          className="h-full min-h-0"
          count={4}
          speed={0.6}
          {...(resolvedTheme === "dark" ? DARK : LIGHT)}
        />
      ) : (
        <div className="h-full w-full bg-linear-to-b from-[#3876ba] to-[#8cbfe8] dark:from-[#090e1c] dark:to-[#1e2a45]" />
      )}
      <div className="from-background/45 via-background/65 to-background/95 absolute inset-0 bg-linear-to-b" />
    </div>
  );
}
