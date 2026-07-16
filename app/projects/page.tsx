import type { Metadata } from "next";

import ProjectsSection from "@/components/sections/projects/index";
import { Reveal } from "@/components/motion/reveal";
import { PROJECTS } from "@/lib/projects";
import { getViews } from "@/lib/redis";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A selection of things I've built — personal experiments and production work.",
  alternates: { canonical: "/projects" },
};

// Rendered dynamically (the Upstash fetch opts out of caching), so view
// counts are live on every request — same as /blog.

export default async function ProjectsPage() {
  const viewCounts = await getViews(
    "project",
    PROJECTS.map((p) => p.slug),
  );

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-3 py-6 font-sans md:px-6">
      <Reveal>
        <ProjectsSection standalone viewCounts={viewCounts} />
      </Reveal>
    </div>
  );
}
