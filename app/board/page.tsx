import type { Metadata } from "next";

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
      {/* The board is the whole page — the heading stays for the document
          outline and screen readers only. */}
      <h1 className="sr-only">Board</h1>
      <Reveal>
        <BoardSection />
      </Reveal>
    </div>
  );
}
