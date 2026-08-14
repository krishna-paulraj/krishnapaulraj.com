import type { Metadata } from "next";
import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/reveal";
import BlogToc from "@/components/sections/blog/blog-toc";
import { PostCover } from "@/components/sections/blog/post-cover";
import ArticleCopyButtons from "@/components/sections/blog/article-copy-buttons";
import ShareButtons from "@/components/sections/blog/share-buttons";
import Views from "@/components/ui/views";
import {
  getBlogPost,
  getBlogPosts,
  getBlogSlugs,
  getRelatedPosts,
} from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";
import { formatPostDate } from "@/lib/dates";
import { buildBlogPostingSchema, jsonLdString } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.createdAt || undefined,
      modifiedTime: post.updatedAt || post.createdAt || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(value: string) {
  return formatPostDate(value, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const allPosts = getBlogPosts();
  const currentIdx = allPosts.findIndex((p) => p.slug === slug);
  const newer = currentIdx > 0 ? allPosts[currentIdx - 1] : null;
  const older =
    currentIdx >= 0 && currentIdx < allPosts.length - 1
      ? allPosts[currentIdx + 1]
      : null;
  const relatedPosts = getRelatedPosts(slug, 3);

  const ldJson = jsonLdString(
    buildBlogPostingSchema({
      slug: post.slug,
      title: post.title,
      description: post.description,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      wordCount: post.wordCount,
      readingTimeMinutes: post.readingTimeMinutes,
    }),
  );

  return (
    <article className="mx-auto w-full max-w-2xl flex-1 px-3 py-6 font-sans md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson }}
      />
      <BlogToc items={post.toc} />
      <ArticleCopyButtons key={slug} />
      <Reveal>
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
          >
            <ChevronLeft className="size-4" />
            Back to writing
          </Link>
          <ShareButtons
            title={post.title}
            url={`${SITE_URL}/blog/${post.slug}`}
          />
        </div>
      </Reveal>

      <header className="mt-6">
        {/* Morph target for the card's title — it must render immediately,
            so it sits outside the Reveal entrance. */}
        <ViewTransition name={`post-title-${post.slug}`} share="morph">
          <h1 className="text-3xl font-bold tracking-tight text-pretty md:text-balance">
            {post.title}
          </h1>
        </ViewTransition>
        <Reveal delay={0.08}>
          {post.description && (
            <p className="text-muted-foreground mt-3 leading-relaxed">
              {post.description}
            </p>
          )}
          <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-2 text-xs">
            {post.createdAt && (
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            )}
            {post.createdAt && <span aria-hidden="true">·</span>}
            <span>{post.readingTimeMinutes} min read</span>
            <Views endpoint={`/api/posts/${post.slug}/views`} />
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <>
                <span aria-hidden="true">·</span>
                <span>Updated {formatDate(post.updatedAt)}</span>
              </>
            )}
          </div>
          {post.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs transition-colors"
                  >
                    #{tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </header>

      {/* Hero: a real frontmatter image when the post has one, otherwise the
          same gradient artwork its card wears on the index. Morph target for
          the card's cover, so no Reveal entrance here. */}
      <div className="border-border mt-8 overflow-hidden rounded-xl border">
        <ViewTransition name={`post-cover-${post.slug}`} share="morph">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              width={1280}
              height={720}
              className="h-auto w-full object-cover"
            />
          ) : (
            <PostCover index={currentIdx} />
          )}
        </ViewTransition>
      </div>

      <Reveal
        delay={0.24}
        className="prose prose-ncdai dark:prose-invert mt-10 max-w-none"
      >
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </Reveal>

      {relatedPosts.length > 0 && (
        <Reveal
          as="section"
          delay={0.3}
          className="border-border mt-16 border-t pt-8"
          aria-label="Related posts"
        >
          <h2 className="text-lg font-semibold tracking-tight">
            Related posts
          </h2>
          <ul className="mt-4 space-y-3">
            {relatedPosts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group border-border bg-card/40 hover:bg-muted/40 flex flex-col gap-1 rounded-lg border p-4 transition-colors"
                >
                  <h3 className="text-foreground text-sm font-medium group-hover:underline">
                    {p.title}
                  </h3>
                  {p.description && (
                    <p className="text-muted-foreground line-clamp-2 text-xs">
                      {p.description}
                    </p>
                  )}
                  <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 text-xs">
                    {p.createdAt && (
                      <time dateTime={p.createdAt}>
                        {formatDate(p.createdAt)}
                      </time>
                    )}
                    {p.tags.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">
                          {p.tags
                            .slice(0, 3)
                            .map((t) => `#${t}`)
                            .join(" ")}
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {(older || newer) && (
        <Reveal
          as="section"
          delay={0.36}
          className="border-border mt-12 border-t pt-8"
          aria-label="Post navigation"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {older ? (
              <Link
                href={`/blog/${older.slug}`}
                className="group border-border bg-card/40 hover:bg-muted/40 flex flex-col gap-1 rounded-lg border p-4 transition-colors"
              >
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <ChevronLeft className="size-3" />
                  Previous post
                </span>
                <span className="text-foreground text-sm font-medium group-hover:underline">
                  {older.title}
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" className="hidden sm:block" />
            )}
            {newer ? (
              <Link
                href={`/blog/${newer.slug}`}
                className="group border-border bg-card/40 hover:bg-muted/40 flex flex-col items-end gap-1 rounded-lg border p-4 text-right transition-colors"
              >
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  Next post
                  <ChevronRight className="size-3" />
                </span>
                <span className="text-foreground text-sm font-medium group-hover:underline">
                  {newer.title}
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" className="hidden sm:block" />
            )}
          </div>
        </Reveal>
      )}
    </article>
  );
}
