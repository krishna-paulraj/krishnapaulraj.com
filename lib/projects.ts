import {
  SiDocker,
  SiGnubash,
  SiNestjs,
  SiNextdotjs,
  SiPostgresql,
  SiPrisma,
  SiRabbitmq,
  SiReact,
  SiRedis,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

export type ProjectTech = {
  icon: React.ElementType;
  label: string;
  color?: string;
};

export const TECH = {
  react: { icon: SiReact, label: "React", color: "#61DAFB" },
  next: { icon: SiNextdotjs, label: "Next.js", color: "currentColor" },
  tailwind: { icon: SiTailwindcss, label: "Tailwind", color: "#38BDF8" },
  typescript: { icon: SiTypescript, label: "TypeScript", color: "#3178C6" },
  shell: { icon: SiGnubash, label: "Shell", color: "currentColor" },
  nestjs: { icon: SiNestjs, label: "NestJS", color: "#E0234E" },
  postgres: { icon: SiPostgresql, label: "PostgreSQL", color: "#4169E1" },
  prisma: { icon: SiPrisma, label: "Prisma", color: "currentColor" },
  redis: { icon: SiRedis, label: "Redis", color: "#DC382D" },
  rabbitmq: { icon: SiRabbitmq, label: "RabbitMQ", color: "#FF6600" },
  docker: { icon: SiDocker, label: "Docker", color: "#2496ED" },
} satisfies Record<string, ProjectTech>;

export type TechKey = keyof typeof TECH;

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
  tech: TechKey[];
  links?: ProjectLink[];
  year?: string;
  status?: ProjectStatus;
  highlights?: string[];
  featured?: boolean;
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
    tech: ["next", "typescript", "tailwind"],
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
    slug: "writora",
    name: "Writora",
    description:
      "A self-hostable blogging platform — each author gets a themable site, custom domain, email subscribers, and a real authoring experience.",
    longDescription: `
A blogging platform built for writers who want their own space without the bloat of WordPress or the rent-seeking of Medium. Each author gets a public site at \`yourdomain.com/username\`, 40+ swappable themes, email subscribers with double opt-in, and a newsletter blast on every publish.

## Stack

- **Turborepo monorepo** with three apps: a **NestJS 11** API and two **Next.js 16** App Router frontends (public site + author dashboard).
- **PostgreSQL** via **Prisma 7** for the data layer.
- **Tiptap** editor with images, code blocks, embeds, and drag-and-drop image upload.
- **Redis** (ioredis) for hot-path caching with explicit invalidation, plus per-IP rate limiting on auth/subscribe/upload.
- **RabbitMQ** (amqplib) for durable newsletter blasts that survive crashes.
- **S3-compatible storage** (\`@aws-sdk/client-s3\`) — works with AWS S3, Cloudflare R2, B2, Spaces, or MinIO behind one env switch.
- **sharp** for image processing (resize, WebP, EXIF rotation).
- **Resend** + **react.email** for transactional and newsletter templates.
- **JWT** in an httpOnly cookie shared across the \`.yourdomain.com\` subdomain — one auth, three apps.

## Notable bits

The whole thing degrades gracefully — leave Redis, RabbitMQ, or S3 unset and the API falls back to no-ops, inline sends, and disk storage so local dev needs nothing but Postgres. The newsletter pipeline is durable end to end: publish a post, the API enqueues a job, a consumer fans it out to subscribers, and a crash mid-blast doesn't lose anyone.

Reader-side has a real SEO surface — sitemap, robots, RSS auto-discovery, JSON-LD \`BlogPosting\` schema, dynamic OG images per post, and a per-author RSS feed at \`/{username}/feed.xml\`. Authors get a Tiptap-based editor with autosave and an unsaved-changes guard, plus an analytics dashboard with views over time, top posts, and week-over-week trends.

Themes are powered by the [tweakcn](https://tweakcn.com) registry — 40+ themes, swappable per blog, no rebuild required. Ships with Dockerfiles for all three apps (slim multi-stage builds, ~180–220MB each) and a \`docker compose up\` spins the full stack.
`,
    tech: ["next", "typescript", "nestjs", "postgres", "prisma", "redis", "rabbitmq", "tailwind", "docker"],
    links: [
      {
        label: "Source",
        href: "https://github.com/krishnapaulraj/writora",
        type: "source",
      },
    ],
    year: "2026",
    status: "in-progress",
    highlights: [
      "Turborepo monorepo: NestJS API + two Next.js 16 frontends sharing a JWT cookie across subdomains.",
      "Durable newsletter pipeline — RabbitMQ producer/consumer so a crash mid-blast doesn't drop subscribers.",
      "Pluggable S3-compatible storage and graceful degradation when Redis/Rabbit/S3 are unset.",
      "Tiptap editor with autosave, drag-and-drop image upload, and sharp-based WebP processing.",
      "Per-author public site with 40+ tweakcn themes, RSS feed, JSON-LD, and dynamic OG images.",
      "Redis-backed read-through cache with explicit invalidation, plus per-IP throttling on sensitive endpoints.",
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
    tech: ["shell"],
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
