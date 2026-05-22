# krishnapaulraj.com

My personal site — about me, work, writing, and the tools I use.

Live: [krishnapaulraj.com](https://krishnapaulraj.com)

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with the `@tailwindcss/typography` plugin
- **shadcn/ui** primitives + **lucide-react** / **react-icons**
- **framer-motion** for entrance animations and the reading-progress pill
- **next-themes** for light/dark/system
- **unified** + **remark-gfm** + **rehype-pretty-code** (Shiki, `github-dark-default`) for blog rendering
- **gray-matter** for frontmatter
- **Upstash Redis** for the site-wide visitor counter and per-post view counts

## Features

- Pages: Home, About, Projects, Resume, Blog (list + detail), Terminal Setup, Gears, custom 404
- Markdown blog (`/blog/*.mdx`) with syntax highlighting, heading anchors (`#` on hover), reading time, scroll-progress pill, code-copy buttons, prev/next nav, and a per-post view counter
- SEO: `sitemap.xml`, `robots.txt`, RSS feed at `/rss.xml`, dynamic Open Graph images (site + per-post), JSON-LD (`Person`, `WebSite`, `BlogPosting`)
- Interactive Terminal Setup walkthrough with copy-able code blocks
- Reduced-motion respected via `MotionConfig`
- Theme-aware, prefers-reduced-motion-aware, keyboard-accessible

## Project structure

```
app/
├── (routes)
│   ├── page.tsx               # Home
│   ├── about/
│   ├── projects/
│   ├── resume/
│   ├── terminal/              # Dotfiles / setup guide
│   ├── gears/                 # Devices, extensions, software
│   ├── blog/
│   │   ├── page.tsx           # /blog list
│   │   └── [slug]/
│   │       ├── page.tsx       # Post detail
│   │       └── opengraph-image.tsx
│   └── not-found.tsx
├── opengraph-image.tsx        # Site-wide OG card
├── sitemap.ts
├── robots.ts
├── rss.xml/route.ts
└── api/
    ├── visitors/route.ts      # Sitewide counter
    └── posts/[slug]/views/route.ts

blog/                          # MDX posts with frontmatter
components/                    # UI, motion, blog, terminal, theme
lib/
├── blog.ts                    # Read posts, render markdown → HTML
├── highlight.ts               # Shiki singleton for terminal page
├── structured-data.ts         # JSON-LD builders
└── constants.ts               # SITE_URL, SITE_NAME, etc.
```

## Getting started

Requires Node 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create `.env.local`:

```bash
# Upstash Redis — required for visitor counter + per-post views
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Without these, the counter endpoints will throw at runtime; the rest of the site still works.

## Scripts

```bash
pnpm dev          # Next.js dev server
pnpm build        # Production build
pnpm start        # Run the production build
pnpm typecheck    # tsc --noEmit
pnpm lint         # ESLint
pnpm format       # Prettier --write .
```

## Adding a blog post

Create a new `.mdx` (or `.md`) file in `/blog/` with frontmatter:

```mdx
---
title: "Your post title"
description: "One-line description — used in OG, RSS, list page."
createdAt: 2026-05-22
updatedAt: 2026-05-22
---

Your content. Standard Markdown + raw HTML works. Code blocks
get syntax highlighted automatically:

\`\`\`ts
const hello = "world";
\`\`\`

Heading anchors (`#`) appear on hover for every `h1`–`h6`.
```

The slug is derived from the filename (`my-post.mdx` → `/blog/my-post`). Posts sort by `createdAt` descending on `/blog` and in the prev/next nav.

`generateStaticParams` reads the blog directory at build time, so a fresh `pnpm build` is required for new posts to appear in production.

## Customising

- **Identity**: edit `lib/constants.ts` (`SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION`, `SITE_AUTHOR`, `SITE_AUTHOR_EMAIL`). These flow into RSS, JSON-LD, and the sitemap.
- **Nav links**: `components/Navbar.tsx` (top) and `components/Footer.tsx` (bottom).
- **Projects**: `components/projects/index.tsx` — replace the `PROJECTS` array.
- **Work experience**: `components/work/index.tsx` — replace `WORK_EXPERIENCE`.
- **Gears**: `app/gears/page.tsx` — edit `DEVICES`, `EXTENSIONS`, `SOFTWARE`.
- **Terminal setup**: `app/terminal/page.tsx` — edit the snippet constants at the top.
- **OG cards**: `app/opengraph-image.tsx` (site) and `app/blog/[slug]/opengraph-image.tsx` (per post). Both use `next/og` `ImageResponse`.
- **Theme tokens**: `app/globals.css` — light/dark colour variables are in `:root` and `.dark`.

## Deployment

The site is built for Vercel. Push to a connected repository and add the two Upstash env vars in the project settings. Any platform that supports Node + the Next.js runtime will work — `pnpm build` outputs a fully static site except for the `/api/*` routes.
