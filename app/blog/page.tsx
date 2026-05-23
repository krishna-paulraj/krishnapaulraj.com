import type { Metadata } from "next";
import Link from "next/link";

import HighlightedHeading from "@/components/highlighted-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { getAllTags, getBlogPosts } from "@/lib/blog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes and explorations on engineering, AI, and building for the web.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag: rawTag } = await searchParams;
  const activeTag = rawTag?.toLowerCase().trim() || null;

  const allPosts = getBlogPosts();
  const posts = activeTag
    ? allPosts.filter((p) => p.tags.includes(activeTag))
    : allPosts;
  const tags = getAllTags();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-6 font-sans">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">Writing</h1>
        <HighlightedHeading className="my-4">
          Sharing knowledge as I learn
        </HighlightedHeading>
      </Reveal>

      {tags.length > 0 && (
        <Reveal delay={0.08} className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/blog"
            aria-current={activeTag === null ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-xs transition-colors",
              activeTag === null
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            All
            <span
              className={cn(
                activeTag === null
                  ? "text-background/70"
                  : "text-muted-foreground/60",
              )}
            >
              {allPosts.length}
            </span>
          </Link>
          {tags.map(({ tag, count }) => {
            const isActive = activeTag === tag;
            return (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-xs transition-colors",
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                #{tag}
                <span
                  className={cn(
                    isActive
                      ? "text-background/70"
                      : "text-muted-foreground/60",
                  )}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </Reveal>
      )}

      {posts.length === 0 ? (
        <Reveal delay={0.16}>
          <p className="mt-10 text-sm text-muted-foreground">
            {activeTag
              ? `No posts tagged #${activeTag} yet.`
              : "Nothing here yet — check back soon."}
          </p>
        </Reveal>
      ) : (
        <RevealGroup as="ul" className="mt-6 divide-y divide-border">
          {posts.map((post) => (
            <RevealItem as="li" key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground group-hover:underline">
                    {post.title}
                  </p>
                  {post.description && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {post.description}
                    </p>
                  )}
                </div>
                {post.createdAt && (
                  <time
                    dateTime={post.createdAt}
                    className="shrink-0 text-sm text-muted-foreground"
                  >
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                )}
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
