import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import HighlightedHeading from "@/components/ui/highlighted-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CloudBackdrop } from "@/components/sections/cloud-backdrop";
import { getBlogPosts } from "@/lib/blog";
import { formatPostDate } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you tried doesn't exist (or doesn't anymore).",
  robots: { index: false, follow: false },
};

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Writing" },
  { href: "/resume", label: "Resume" },
];

export default function NotFound() {
  const recent = getBlogPosts().slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-3 py-16 font-sans md:px-6">
      {/* Off the map, into the clouds — a subtle sky behind the whole page. */}
      <CloudBackdrop />
      <Reveal>
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Off the map</h1>
        <HighlightedHeading className="my-4">
          This page doesn&apos;t exist (or doesn&apos;t anymore)
        </HighlightedHeading>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
          The URL you tried isn&apos;t a page on this site. Maybe a typo, maybe
          a stale link, maybe something I moved and forgot to redirect. Either
          way — here&apos;s where to go next.
        </p>
      </Reveal>

      <Reveal as="section" delay={0.2} className="mt-10 border-t pt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Try one of these
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {quickLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="border-border bg-background text-foreground hover:bg-muted inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-colors"
              >
                {label}
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>

      {recent.length > 0 && (
        <Reveal as="section" delay={0.3} className="mt-10 border-t pt-6">
          <h2 className="text-lg font-semibold tracking-tight">
            Recent writing
          </h2>
          <RevealGroup as="ul" className="divide-border mt-3 divide-y">
            {recent.map((post) => (
              <RevealItem as="li" key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <span className="text-foreground font-medium group-hover:underline">
                    {post.title}
                  </span>
                  {post.createdAt && (
                    <time
                      dateTime={post.createdAt}
                      className="text-muted-foreground shrink-0 text-xs"
                    >
                      {formatPostDate(post.createdAt)}
                    </time>
                  )}
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </Reveal>
      )}
    </div>
  );
}
