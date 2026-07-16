import type { Metadata } from "next";

import HighlightedHeading from "@/components/ui/highlighted-heading";
import { Reveal } from "@/components/motion/reveal";
import { BoardSection } from "@/components/sections/board";

export const metadata: Metadata = {
  title: "Board",
  description:
    "What I'm working on right now — a live kanban board, tracked in public.",
  alternates: { canonical: "/board" },
};

export default function BoardPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-3 py-6 font-sans md:px-6">
      {/* Header keeps the site's 2xl reading rhythm; the board below breaks
          out to the full 4xl container. */}
      <div className="mx-auto w-full max-w-2xl">
        <Reveal>
          <h1 className="text-3xl font-bold tracking-tight">Board</h1>
          <HighlightedHeading className="my-4">
            Tracking my work in public
          </HighlightedHeading>
        </Reveal>
      </div>
      <Reveal delay={0.1} className="mt-4">
        <BoardSection />
      </Reveal>
    </div>
  );
}
