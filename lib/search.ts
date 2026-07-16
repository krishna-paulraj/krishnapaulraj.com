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
    id: "page-board",
    title: "Board",
    description: "What I'm working on right now — a live kanban board.",
    href: "/board",
    kind: "page",
    keywords: ["kanban", "board", "tasks", "now", "working on"],
  },
  {
    id: "page-terminal",
    title: "Terminal Setup",
    description: "My Zsh + Powerlevel10k + tmux configuration.",
    href: "/terminal",
    kind: "page",
    keywords: ["zsh", "powerlevel10k", "tmux", "neovim", "dotfiles", "shell"],
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
