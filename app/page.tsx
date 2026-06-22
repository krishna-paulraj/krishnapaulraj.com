import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import pfpDark from "@/assets/pfp_dark.png";
import pfpLight from "@/assets/pfp_light.png";
import { MailIcon, TerminalIcon, WrenchIcon } from "lucide-react";
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { Metrics01 } from "@/components/sections/metrics-01";
import ClosingNote from "@/components/sections/closing-note";

import NowPlaying from "@/components/sections/NowPlaying";
import WorkExperienceComponent from "@/components/sections/work/index";
import ProjectsSection from "@/components/sections/projects/index";
import BlogSection from "@/components/sections/blog";
import ComponentsSection from "@/components/sections/components-page/components-section";
import { CopyEmail } from "@/components/ui/copy-email";
import HighlightedHeading from "@/components/ui/highlighted-heading";
import { Reveal } from "@/components/motion/reveal";
import {
  GitHubContributions,
  GitHubContributionsFallback,
} from "@/components/sections/github-contributions";
import { getCachedContributions } from "@/lib/get-cached-contributions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
};

export default async function Home() {
  const contributions = getCachedContributions("suresh-krishna-paulraj-1032");

  const socials = [
    {
      href: "https://x.com/thedevkrish",
      label: "X / Twitter",
      icon: FaXTwitter,
    },
    {
      href: "https://github.com/krishna-paulraj",
      label: "GitHub",
      icon: FaGithub,
    },
    {
      href: "https://linkedin.com/in/suresh-krishna-paulraj",
      label: "LinkedIn",
      icon: FaLinkedinIn,
    },
    {
      href: "https://instagram.com/krishnapaulraj",
      label: "Instagram",
      icon: FaInstagram,
    },
    {
      href: "mailto:krishnapaulraj2004@gmail.com",
      label: "Email",
      icon: MailIcon,
    },
  ];

  return (
    <>
      <div className="mx-auto w-full max-w-2xl flex-1 px-3 md:px-6 pb-6 font-sans">
        <div className="-mt-2.5 w-full overflow-x-auto overflow-y-hidden">
          <Suspense fallback={<GitHubContributionsFallback />}>
            <GitHubContributions
              contributions={contributions}
              className="text-xs"
            />
          </Suspense>
        </div>
        <Reveal>
          <div className="flex items-center gap-4 mt-3">
            <Image
              src={pfpLight}
              alt="Suresh Krishna Paulraj"
              width={110}
              height={110}
              className="size-20 rounded-full object-cover shrink-0 sm:size-[110px] dark:hidden"
              priority
            />
            <Image
              src={pfpDark}
              alt="Suresh Krishna Paulraj"
              width={110}
              height={110}
              className="size-20 rounded-full object-cover shrink-0 hidden sm:size-[110px] dark:block"
              priority
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Suresh Krishna
              </h1>
              <p className="text-sm text-muted-foreground">
                <span className="sm:hidden">SDE</span>
                <span className="hidden sm:inline">
                  Software Engineer
                </span> at{" "}
                <a
                  href="https://blocsys.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:underline underline-offset-4"
                >
                  Blocsys
                </a>
              </p>
              <p className="flex items-center text-sm text-muted-foreground">
                <CopyEmail email="krishnapaulraj2004@gmail.com" />
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-4">
          <TooltipProvider>
            <ul className="flex flex-wrap gap-1">
              {socials.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={href}
                        target={
                          href.startsWith("mailto") ? undefined : "_blank"
                        }
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Icon className="size-5" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </TooltipProvider>
        </Reveal>

        <Reveal
          delay={0.12}
          className="mt-4 space-y-2 text-sm text-muted-foreground leading-relaxed"
        >
          <p>
            Web developer passionate about building scalable, user-friendly
            applications with clean and efficient code. I focus on crafting
            intuitive solutions that deliver real value.
          </p>
          <p>
            I enjoy exploring new technologies, tackling complex problems, and
            transforming ideas into meaningful, impactful projects.
          </p>
        </Reveal>

        <Reveal delay={0.16} className="mt-6">
          <NowPlaying />
        </Reveal>
        <Reveal delay={0.24}>
          <ProjectsSection />
        </Reveal>
        <Reveal delay={0.32}>
          <WorkExperienceComponent />
        </Reveal>
        <Reveal delay={0.4}>
          <BlogSection />
        </Reveal>
        <Reveal delay={0.44}>
          <ComponentsSection />
        </Reveal>
        <Reveal delay={0.52}>
          <div className="mt-5 w-full border-t pt-5">
            <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
            <HighlightedHeading className="my-4">
              A peek into my setup
            </HighlightedHeading>

            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/terminal"
                className="group flex items-start gap-3 rounded-lg border border-border bg-card/40 p-4 transition-colors hover:bg-muted/40"
              >
                <TerminalIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:underline">
                    Terminal
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    My Zsh, Powerlevel10k, and tmux setup
                  </p>
                </div>
              </Link>
              <Link
                href="/gears"
                className="group flex items-start gap-3 rounded-lg border border-border bg-card/40 p-4 transition-colors hover:bg-muted/40"
              >
                <WrenchIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:underline">
                    Gears
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Devices, software, and tools I use daily
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
      <Metrics01 />
      <ClosingNote />
    </>
  );
}
