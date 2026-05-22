import type { Metadata } from "next";

import ProjectsSection from "@/components/projects/index";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A selection of things I've built — personal experiments and production work.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 font-sans">
      <Reveal>
        <ProjectsSection standalone />
      </Reveal>
    </div>
  );
}
