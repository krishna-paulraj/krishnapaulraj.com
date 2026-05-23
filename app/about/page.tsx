import type { Metadata } from "next";
import Link from "next/link";
import { MailIcon } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

import HighlightedHeading from "@/components/highlighted-heading";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "A bit about me — what I work on, where I've been, and how to reach me.",
};

const socials = [
  { href: "https://x.com/thedevkrish", label: "X / Twitter", icon: FaXTwitter },
  {
    href: "https://github.com/krishnapaulraj",
    label: "GitHub",
    icon: FaGithub,
  },
  {
    href: "https://linkedin.com/in/krishnapaulraj",
    label: "LinkedIn",
    icon: FaLinkedinIn,
  },
  { href: "mailto:blocsysdevs@gmail.com", label: "Email", icon: MailIcon },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-6 font-sans">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <HighlightedHeading className="my-4">
          A little context
        </HighlightedHeading>
      </Reveal>

      <Reveal
        delay={0.1}
        className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground"
      >
        <p>
          I&apos;m Suresh-Krishna Paulraj — a software engineer at{" "}
          <a
            href="https://blocsys.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            Blocsys
          </a>
          , focused on building scalable, user-friendly web applications. Most
          of my day is spent in TypeScript, React, and Next.js, shipping
          features for web and mobile.
        </p>
        <p>
          I care a lot about the small details — how a page feels on first load,
          the rhythm of interactions, the shape of an API. I lean toward clean,
          simple solutions that survive contact with real users.
        </p>
        <p>
          Outside of work, I&apos;m usually experimenting with something new —
          recently AI tooling, RAG systems, and infrastructure for autonomous
          agents. I write about what I&apos;m learning on this site under{" "}
          <Link
            href="/blog"
            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            Writing
          </Link>
          .
        </p>
      </Reveal>

      <Reveal as="section" delay={0.2} className="mt-10 border-t pt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          What I&apos;m working on
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground">Day job:</span> building frontend
            and infra at Blocsys.
          </li>
          <li>
            <span className="text-foreground">Side projects:</span> tinkering
            with AI agents and developer tools.
          </li>
          <li>
            <span className="text-foreground">Learning:</span> systems design,
            distributed databases, retrieval pipelines.
          </li>
        </ul>
      </Reveal>

      <Reveal as="section" delay={0.3} className="mt-10 border-t pt-6">
        <h2 className="text-lg font-semibold tracking-tight">Elsewhere</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {socials.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <a
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
