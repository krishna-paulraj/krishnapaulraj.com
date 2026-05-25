import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/reveal";
import ReadingProgress from "@/components/blog/reading-progress";
import ArticleCopyButtons from "@/components/blog/article-copy-buttons";
import ShareButtons from "@/components/blog/share-buttons";
import Views from "@/components/views";
import {
  getBlogPost,
  getBlogPosts,
  getBlogSlugs,
  getRelatedPosts,
} from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";
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
  return new Date(value).toLocaleDateString("en-US", {
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
    <article className="mx-auto w-full max-w-2xl flex-1 px-6 py-6 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson }}
      />
      <ReadingProgress />
      <ArticleCopyButtons key={slug} />
      <Reveal>
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
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

      <Reveal as="header" delay={0.08} className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-pretty md:text-balance">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {post.description}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          {post.createdAt && (
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
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
                  className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      {post.image && (
        <Reveal
          delay={0.16}
          className="mt-8 overflow-hidden rounded-lg border border-border bg-muted"
        >
          <Image
            src={post.image}
            alt={post.title}
            width={1280}
            height={720}
            className="h-auto w-full object-cover"
          />
        </Reveal>
      )}

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
          className="mt-16 border-t border-border pt-8"
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
                  className="group flex flex-col gap-1 rounded-lg border border-border bg-card/40 p-4 transition-colors hover:bg-muted/40"
                >
                  <h3 className="text-sm font-medium text-foreground group-hover:underline">
                    {p.title}
                  </h3>
                  {p.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
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
          className="mt-12 border-t border-border pt-8"
          aria-label="Post navigation"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {older ? (
              <Link
                href={`/blog/${older.slug}`}
                className="group flex flex-col gap-1 rounded-lg border border-border bg-card/40 p-4 transition-colors hover:bg-muted/40"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ChevronLeft className="size-3" />
                  Previous post
                </span>
                <span className="text-sm font-medium text-foreground group-hover:underline">
                  {older.title}
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" className="hidden sm:block" />
            )}
            {newer ? (
              <Link
                href={`/blog/${newer.slug}`}
                className="group flex flex-col items-end gap-1 rounded-lg border border-border bg-card/40 p-4 text-right transition-colors hover:bg-muted/40"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  Next post
                  <ChevronRight className="size-3" />
                </span>
                <span className="text-sm font-medium text-foreground group-hover:underline">
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
