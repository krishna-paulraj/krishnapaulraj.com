import type { Metadata } from "next";

import HighlightedHeading from "@/components/ui/highlighted-heading";
import { Reveal } from "@/components/motion/reveal";
import { TimelineSection } from "@/components/sections/timeline";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "Milestones of my journey so far — from the first line of code to what I'm building now.",
  alternates: { canonical: "/timeline" },
};

export default function TimelinePage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-3 py-6 font-sans md:px-6">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
        <HighlightedHeading className="my-4">
          The journey so far
        </HighlightedHeading>
      </Reveal>
      <Reveal delay={0.1} className="mt-8">
        <TimelineSection />
      </Reveal>
    </div>
  );
}
