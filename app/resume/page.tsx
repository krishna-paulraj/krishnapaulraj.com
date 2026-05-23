import type { Metadata } from "next";
import { MailIcon } from "lucide-react";

import HighlightedHeading from "@/components/highlighted-heading";
import WorkExperienceComponent from "@/components/work/index";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Suresh Krishna Paulraj — software engineer specializing in TypeScript, React, Next.js, and AI applications.",
};

const skills = {
  Languages: ["TypeScript", "JavaScript", "Python", "SQL"],
  Frontend: ["React", "Next.js", "Tailwind CSS", "React Native"],
  "Backend & Data": ["Node.js", "PostgreSQL", "Redis", "Prisma"],
  "AI & Tooling": ["LangChain", "OpenAI", "Vector DBs", "Vercel"],
};

export default function ResumePage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-6 font-sans">
      <Reveal className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
          <HighlightedHeading className="my-4">
            Suresh Krishna Paulraj · Software Engineer
          </HighlightedHeading>
        </div>
        <a
          href="mailto:blocsysdevs@gmail.com"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
        >
          <MailIcon className="size-4" />
          Get in touch
        </a>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Software engineer building scalable web and mobile experiences. Most
          comfortable in TypeScript, React, and Next.js, with growing experience
          in AI tooling and retrieval systems.
        </p>
      </Reveal>

      <Reveal delay={0.2} className="mt-8">
        <WorkExperienceComponent standalone />
      </Reveal>

      <Reveal as="section" delay={0.3} className="mt-10 border-t pt-6">
        <h2 className="text-lg font-semibold tracking-tight">Skills</h2>
        <dl className="mt-4 space-y-3">
          {Object.entries(skills).map(([category, items]) => (
            <div
              key={category}
              className="grid grid-cols-1 gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4"
            >
              <dt className="text-sm font-medium text-foreground">
                {category}
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-md border bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </div>
  );
}
