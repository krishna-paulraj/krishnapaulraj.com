import type { Metadata } from "next";
import Link from "next/link";
import { MailIcon } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

import HighlightedHeading from "@/components/ui/highlighted-heading";
import { Reveal } from "@/components/motion/reveal";
import { FaInstagram } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "About",
  description:
    "A bit about me — what I work on, where I've been, and how to reach me.",
  alternates: { canonical: "/about" },
};

const socials = [
  { href: "https://x.com/thedevkrish", label: "X / Twitter", icon: FaXTwitter },
  {
    href: "https://github.com/krishna-paulraj",
    label: "GitHub",
    icon: FaGithub,
  },
  {
    href: "https://instagram.com/krishnapaulraj",
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    href: "https://linkedin.com/in/suresh-krishna-paulraj",
    label: "LinkedIn",
    icon: FaLinkedinIn,
  },
  {
    href: "mailto:krishnapaulraj2004@gmail.com",
    label: "Email",
    icon: MailIcon,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-3 py-6 font-sans md:px-6">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <HighlightedHeading className="my-4">
          A little context
        </HighlightedHeading>
      </Reveal>

      <Reveal
        delay={0.1}
        className="text-muted-foreground mt-6 space-y-4 text-sm leading-relaxed"
      >
        <p>
          Hey, I&apos;m Suresh Krishna Paulraj — a software engineer at{" "}
          <a
            href="https://blocsys.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Blocsys
          </a>
          . I build web applications end to end, working across the frontend and
          backend, and I also like getting my hands dirty with web3 projects on
          the side.
        </p>
        <p>
          What I enjoy most is the little stuff that makes a product feel right
          — the way a page comes to life, how interactions flow, the quiet logic
          behind a clean API. I&apos;d rather ship something simple that
          actually works than something clever that breaks.
        </p>
        <p>
          When I&apos;m not at my desk, you&apos;ll probably find me exploring a
          new place, putting in a workout, or cooking up something I&apos;ve
          been craving. I also jot down what I&apos;m picking up along the way
          over on{" "}
          <Link
            href="/blog"
            className="text-foreground font-medium underline-offset-4 hover:underline"
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
        <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
          <li>
            <span className="text-foreground">My day job:</span> shipping
            full-stack web applications at Blocsys.
          </li>
          <li>
            <span className="text-foreground">After hours:</span> tinkering with
            web3 ideas and building small things I find useful.
          </li>
          <li>
            <span className="text-foreground">When I unplug:</span> chasing new
            places, lifting at the gym, or trying a new recipe.
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
                className="border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground flex size-9 items-center justify-center rounded-lg border transition-colors"
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
