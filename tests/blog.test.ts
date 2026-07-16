import { describe, expect, it } from "vitest";

import { getBlogPosts } from "@/lib/blog";
import { dateSortValue } from "@/lib/dates";

// Runs against the real /blog content — this is the regression test for the
// unquoted-YAML-date bug that had posts sorted by weekday name.
describe("getBlogPosts", () => {
  it("normalizes frontmatter dates to YYYY-MM-DD", () => {
    for (const post of getBlogPosts()) {
      expect(post.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (post.updatedAt) {
        expect(post.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("sorts posts by creation date, newest first", () => {
    const posts = getBlogPosts();
    expect(posts.length).toBeGreaterThan(0);
    for (let i = 1; i < posts.length; i++) {
      expect(dateSortValue(posts[i - 1].createdAt)).toBeGreaterThanOrEqual(
        dateSortValue(posts[i].createdAt),
      );
    }
  });

  it("derives unique slugs", () => {
    const slugs = getBlogPosts().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
