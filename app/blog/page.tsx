import type { Metadata } from "next";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { BlogFilters } from "@/components/sections/blog/blog-filters";
import { PostCard } from "@/components/sections/blog/post-card";
import { getAllTags, getBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes and explorations on engineering, AI, and building for the web.",
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[] }>;
}) {
  const { tag: rawTag } = await searchParams;
  // `?tag=a&tag=b` arrives as an array; a single `?tag=a` as a string.
  const activeTags = (Array.isArray(rawTag) ? rawTag : rawTag ? [rawTag] : [])
    .map((tag) => tag.toLowerCase().trim())
    .filter(Boolean);

  const allPosts = getBlogPosts();
  const posts =
    activeTags.length > 0
      ? allPosts.filter((p) => p.tags.some((tag) => activeTags.includes(tag)))
      : allPosts;
  const tags = getAllTags();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-3 py-6 font-sans md:px-6">
      {/* The blog-1 block's header — eyebrow, title, description — flush with
          the card grid below. */}
      <Reveal as="header" className="flex flex-col gap-2">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Writing
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Notes and explorations on engineering, AI, and building for the web.
        </p>
      </Reveal>

      {tags.length > 0 && (
        <Reveal delay={0.08} className="mt-6">
          <BlogFilters tags={tags} activeTags={activeTags} />
        </Reveal>
      )}

      {posts.length === 0 ? (
        <Reveal delay={0.16}>
          <p className="text-muted-foreground mt-10 text-sm">
            {activeTags.length > 0
              ? `No posts tagged ${activeTags.map((tag) => `#${tag}`).join(", ")} yet.`
              : "Nothing here yet — check back soon."}
          </p>
        </Reveal>
      ) : (
        <RevealGroup
          as="ul"
          className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {posts.map((post) => (
            <RevealItem as="li" key={post.slug} className="h-full">
              {/* Cover palette keys off the post's place in the full list, so
                  a card keeps its artwork inside filtered tag views too. */}
              <PostCard
                post={post}
                index={allPosts.findIndex((p) => p.slug === post.slug)}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
