import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";
import { getBlogPosts } from "@/lib/blog";
import { PROJECTS } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();
  const latestPost = posts[0]?.updatedAt ?? posts[0]?.createdAt;

  // `lastModified` is only emitted where a real content date exists — stamping
  // every entry with the build time tells crawlers everything changed on every
  // deploy, which erodes trust in the field.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/projects`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/resume`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/terminal`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/gears`, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${SITE_URL}/blog`,
      ...(latestPost ? { lastModified: latestPost } : {}),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    const modified = post.updatedAt || post.createdAt;
    return {
      url: `${SITE_URL}/blog/${post.slug}`,
      ...(modified ? { lastModified: modified } : {}),
      changeFrequency: "yearly",
      priority: 0.6,
    };
  });

  const projectRoutes: MetadataRoute.Sitemap = PROJECTS.map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes, ...projectRoutes];
}
