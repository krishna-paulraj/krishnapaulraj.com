import fs from "fs";
import path from "path";
import matter from "gray-matter";

import {
  countWords,
  renderMarkdownWithToc,
  type TocItem,
} from "@/lib/markdown";
import { dateSortValue } from "@/lib/dates";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  image?: string;
  tags: string[];
  readingTimeMinutes: number;
  wordCount: number;
};

export type BlogPostDetail = BlogPost & {
  html: string;
  toc: TocItem[];
};

const BLOG_DIR = path.join(process.cwd(), "blog");
const WORDS_PER_MINUTE = 220;

/**
 * Frontmatter dates written unquoted (`createdAt: 2026-05-20`) are parsed by
 * YAML into `Date` objects; naive `String()` would yield a locale-dependent
 * `Date.prototype.toString()` that breaks sorting and every machine-readable
 * sink (JSON-LD, OpenGraph, <time datetime>, RSS). Normalize to `YYYY-MM-DD`.
 */
function normalizeDate(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function readPostFile(file: string) {
  const slug = file.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
  const { data, content } = matter(raw);
  const wordCount = countWords(content);
  const readingTimeMinutes = Math.max(
    1,
    Math.ceil(wordCount / WORDS_PER_MINUTE),
  );
  const post: BlogPost = {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    createdAt: normalizeDate(data.createdAt),
    updatedAt: data.updatedAt ? normalizeDate(data.updatedAt) : undefined,
    image: data.image,
    tags: Array.isArray(data.tags)
      ? data.tags
          .map((t: unknown) => String(t).toLowerCase().trim())
          .filter(Boolean)
      : [],
    readingTimeMinutes,
    wordCount,
  };
  return { post, content };
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getBlogPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

function listPostFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  // `a.md` and `a.mdx` would collide on the same slug; keep the .mdx variant.
  const bySlug = new Map<string, string>();
  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, "");
    if (!bySlug.has(slug) || file.endsWith(".mdx")) bySlug.set(slug, file);
  }
  return Array.from(bySlug.values());
}

let postsCache: BlogPost[] | null = null;

export function getBlogPosts(): BlogPost[] {
  // Posts are static files; cache per server process in production (dev keeps
  // re-reading so edits show up without a restart).
  if (process.env.NODE_ENV === "production" && postsCache) return postsCache;
  postsCache = listPostFiles()
    .map((file) => readPostFile(file).post)
    .sort((a, b) => dateSortValue(b.createdAt) - dateSortValue(a.createdAt));
  return postsCache;
}

export async function getBlogPost(
  slug: string,
): Promise<BlogPostDetail | null> {
  const file = listPostFiles().find((f) => f.replace(/\.mdx?$/, "") === slug);
  if (!file) return null;

  const { post, content } = readPostFile(file);
  const { html, toc } = await renderMarkdownWithToc(content);
  return { ...post, html, toc };
}

export function getBlogSlugs(): string[] {
  return listPostFiles().map((f) => f.replace(/\.mdx?$/, ""));
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const all = getBlogPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current || current.tags.length === 0) return [];

  const currentTags = new Set(current.tags);

  return all
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      score: p.tags.reduce((n, t) => n + (currentTags.has(t) ? 1 : 0), 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return dateSortValue(b.post.createdAt) - dateSortValue(a.post.createdAt);
    })
    .slice(0, limit)
    .map((x) => x.post);
}
