import type { Metadata } from "next";
import { DownloadIcon, ExternalLinkIcon } from "lucide-react";

import HighlightedHeading from "@/components/ui/highlighted-heading";
import WorkExperienceComponent from "@/components/sections/work/index";
import { Reveal } from "@/components/motion/reveal";
import { ACTION_BUTTON_CLASS } from "@/constants";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Suresh Krishna Paulraj — software engineer specializing in TypeScript, React, Next.js, and AI applications.",
  alternates: { canonical: "/resume" },
};

const RESUME_FILE = "/resume.pdf";

const skills = {
  Languages: ["TypeScript", "JavaScript", "Python", "SQL"],
  Frontend: ["React", "Next.js", "Tailwind CSS", "React Native"],
  "Backend & Data": ["Node.js", "PostgreSQL", "Redis", "Prisma"],
  "AI & Tooling": ["LangChain", "OpenAI", "Vector DBs", "Vercel"],
};

export default function ResumePage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-3 py-6 font-sans md:px-6">
      <Reveal className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
          <HighlightedHeading className="my-4">
            Suresh Krishna Paulraj · Jr. Blockchain Developer
          </HighlightedHeading>
          <Reveal delay={0.24}>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Software engineer building scalable web and mobile experiences.
              Most comfortable in TypeScript, React, and Next.js, with growing
              experience in AI tooling and retrieval systems.
            </p>
          </Reveal>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a href={RESUME_FILE} download className={ACTION_BUTTON_CLASS}>
            <DownloadIcon className="size-4" />
            Download
          </a>
          <a
            href={RESUME_FILE}
            target="_blank"
            rel="noopener noreferrer"
            className={ACTION_BUTTON_CLASS}
          >
            <ExternalLinkIcon className="size-4" />
            Open
          </a>
        </div>
      </Reveal>

      <Reveal delay={0.16} className="mt-6">
        <object
          data={`${RESUME_FILE}#view=FitH&toolbar=1`}
          type="application/pdf"
          aria-label="Resume PDF"
          className="border-border bg-muted/40 min-h-100 w-full overflow-hidden rounded-lg border md:min-h-200"
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Your browser can&apos;t display the PDF inline.
            </p>
            <a href={RESUME_FILE} className={ACTION_BUTTON_CLASS}>
              <DownloadIcon className="size-4" />
              Download the PDF
            </a>
          </div>
        </object>
      </Reveal>

      <Reveal delay={0.32} className="mt-8">
        <WorkExperienceComponent standalone />
      </Reveal>

      <Reveal as="section" delay={0.4} className="mt-10 border-t pt-6">
        <h2 className="text-lg font-semibold tracking-tight">Skills</h2>
        <dl className="mt-4 space-y-3">
          {Object.entries(skills).map(([category, items]) => (
            <div
              key={category}
              className="grid grid-cols-1 gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4"
            >
              <dt className="text-foreground text-sm font-medium">
                {category}
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item}
                    className="bg-muted/50 text-muted-foreground inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-xs"
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
