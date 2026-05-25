import { getBlogPosts } from "@/lib/blog";
import { PROJECTS, TECH } from "@/lib/projects";
import type { SearchItem } from "@/lib/search-score";

export type { SearchItem, SearchKind } from "@/lib/search-score";
export { scoreItem } from "@/lib/search-score";

const PAGE_ITEMS: SearchItem[] = [
  {
    id: "page-home",
    title: "Home",
    description: "Landing page — bio, now playing, projects, work, writing.",
    href: "/",
    kind: "page",
  },
  {
    id: "page-about",
    title: "About",
    description: "A bit about me, what I work on, how to reach me.",
    href: "/about",
    kind: "page",
  },
  {
    id: "page-projects",
    title: "Projects",
    description:
      "Things I've built — personal experiments and production work.",
    href: "/projects",
    kind: "page",
  },
  {
    id: "page-resume",
    title: "Resume",
    description: "Work history, skills, contact.",
    href: "/resume",
    kind: "page",
  },
  {
    id: "page-blog",
    title: "Writing",
    description: "Notes on engineering, AI, and building for the web.",
    href: "/blog",
    kind: "page",
  },
  {
    id: "page-terminal",
    title: "Terminal Setup",
    description: "My Zsh / Starship / Fastfetch configuration.",
    href: "/terminal",
    kind: "page",
    keywords: ["zsh", "starship", "dotfiles", "shell"],
  },
  {
    id: "page-gears",
    title: "Gears",
    description: "Hardware, software, and extensions I use day to day.",
    href: "/gears",
    kind: "page",
    keywords: ["hardware", "software", "tools"],
  },
];

export function getSearchItems(): SearchItem[] {
  const posts: SearchItem[] = getBlogPosts().map((p) => ({
    id: `post-${p.slug}`,
    title: p.title,
    description: p.description,
    href: `/blog/${p.slug}`,
    kind: "post",
    keywords: p.tags,
  }));

  const projects: SearchItem[] = PROJECTS.map((p) => ({
    id: `project-${p.slug}`,
    title: p.name,
    description: p.description,
    href: `/projects/${p.slug}`,
    kind: "project",
    keywords: p.tech.map((key) => TECH[key].label.toLowerCase()),
  }));

  return [...PAGE_ITEMS, ...posts, ...projects];
}
