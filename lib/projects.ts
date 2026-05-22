import {
  SiGnubash,
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

export type ProjectTech = {
  icon: React.ElementType;
  label: string;
  color?: string;
};

export type ProjectLink = {
  label: string;
  href: string;
  type?: "live" | "source" | "external";
};

export type ProjectStatus = "live" | "in-progress" | "archived";

export type Project = {
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  image?: string;
  tech: ProjectTech[];
  links?: ProjectLink[];
  year?: string;
  status?: ProjectStatus;
  highlights?: string[];
  featured?: boolean;
};

export const TECH: Record<string, ProjectTech> = {
  react: { icon: SiReact, label: "React", color: "#61DAFB" },
  next: { icon: SiNextdotjs, label: "Next.js", color: "currentColor" },
  tailwind: { icon: SiTailwindcss, label: "Tailwind", color: "#38BDF8" },
  typescript: { icon: SiTypescript, label: "TypeScript", color: "#3178C6" },
  shell: { icon: SiGnubash, label: "Shell", color: "currentColor" },
};

// Edit this list to add or change projects.
export const PROJECTS: Project[] = [
  {
    slug: "krishnapaulraj-com",
    name: "krishnapaulraj.com",
    description:
      "My personal portfolio, writing, and notes — built with Next.js 16 App Router.",
    longDescription: `
The site you're reading now. A personal portfolio that doubles as a writing surface and a public scratchpad for things I'm building or thinking about.

## Stack

- **Next.js 16** App Router with React 19, fully type-checked TypeScript.
- **Tailwind v4** + the typography plugin for prose, shadcn primitives where useful.
- **unified** + **remark-gfm** + **rehype-pretty-code** for the markdown pipeline. Syntax highlighting via **Shiki** (\`github-dark-default\`).
- **framer-motion** for entrance animations and the reading-progress pill.
- **Upstash Redis** for the sitewide visitor counter and per-post view counts.

## Notable bits

The site has a real SEO surface: sitemap, robots, RSS, dynamic Open Graph images (per post and site-wide), and JSON-LD for Person, WebSite, and BlogPosting. The Terminal Setup page is itself rendered as a Markdown-style walkthrough using the same Shiki highlighter via a tiny singleton in \`lib/highlight.ts\`. The Gears page lists hardware and software I actually use day to day.

The whole thing is content-driven enough that adding a blog post is just dropping an MDX file into \`blog/\`.
`,
    tech: [TECH.next, TECH.typescript, TECH.tailwind],
    links: [
      { label: "Live", href: "https://krishnapaulraj.com", type: "live" },
      {
        label: "Source",
        href: "https://github.com/krishnapaulraj/krishnapaulraj.com",
        type: "source",
      },
    ],
    year: "2026",
    status: "live",
    highlights: [
      "Markdown blog with Shiki syntax highlighting, heading anchors, reading time, and view counts.",
      "Programmatic OG images via next/og — both site-wide and per post.",
      "JSON-LD structured data (Person, WebSite, BlogPosting).",
      "Reduced-motion respected through MotionConfig.",
    ],
    featured: true,
  },
  {
    slug: "dotfiles",
    name: "dotfiles",
    description:
      "My Zsh + Starship + Fastfetch configuration — the terminal setup I actually run every day.",
    longDescription: `
The configuration I run on every machine. Zsh as the shell, Starship for the prompt, eza/fzf/zoxide for nicer navigation, and Fastfetch for the system info banner on shell start.

The full walkthrough — install, configure, apply — lives on the [Terminal Setup](/terminal) page on this site.

## Why these tools

- **Starship** — fast, sensible defaults, no Oh My Zsh framework overhead.
- **eza** — \`ls\` with file-type icons and git integration.
- **fzf + zoxide** — fuzzy finding everywhere, jump to recent directories.
- **Fastfetch** — quicker than neofetch and uses jsonc config.
`,
    tech: [TECH.shell],
    links: [
      {
        label: "Source",
        href: "https://github.com/krishnapaulraj/dotfiles",
        type: "source",
      },
      { label: "Walkthrough", href: "/terminal", type: "external" },
    ],
    status: "live",
    highlights: [
      "One-liner Homebrew install for the full toolchain.",
      "Starship prompt config + Zsh history settings.",
      "Fastfetch jsonc with custom module order.",
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getProjectSlugs(): string[] {
  return PROJECTS.map((p) => p.slug);
}
