"use client";

import Link from "next/link";
import { ArrowRightIcon, RefreshCwIcon } from "lucide-react";
import { useEffect } from "react";

import HighlightedHeading from "@/components/ui/highlighted-heading";
import { Reveal } from "@/components/motion/reveal";
import { ACTION_BUTTON_CLASS } from "@/constants";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-3 py-16 font-sans md:px-6">
      <Reveal>
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          Error
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Something broke
        </h1>
        <HighlightedHeading className="my-4">
          That wasn&apos;t supposed to happen
        </HighlightedHeading>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
          The page hit an unexpected error on the way to your screen. You can
          retry — sometimes that&apos;s all it takes — or head back home.
        </p>
        {error.digest && (
          <p className="text-muted-foreground/70 mt-2 font-mono text-xs">
            Reference: {error.digest}
          </p>
        )}
      </Reveal>

      <Reveal as="section" delay={0.2} className="mt-10 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className={ACTION_BUTTON_CLASS}
        >
          <RefreshCwIcon className="size-3.5" />
          Try again
        </button>
        <Link
          href="/"
          className="border-border bg-background text-foreground hover:bg-muted inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-colors"
        >
          Go home
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </Reveal>
    </div>
  );
}
