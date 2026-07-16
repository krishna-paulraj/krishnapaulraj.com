# krishnapaulraj.com

My personal site — about me, work, writing, and the tools I use.

Live: [krishnapaulraj.com](https://krishnapaulraj.com)

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with the `@tailwindcss/typography` plugin
- **shadcn/ui**-style primitives (Radix) + **lucide-react** / **react-icons**
- **motion** (Framer Motion's successor) for entrance animations and micro-interactions
- **@visx** for the hand-built insights line chart
- **next-themes** for light/dark/system
- **unified** + **remark-gfm** + **rehype-pretty-code** (Shiki) for blog rendering
- **gray-matter** for frontmatter
- **Upstash Redis** for visitor/session analytics, per-post and per-project view counts, and contact-form rate limiting
- **Resend** for contact-form delivery, **Last.fm** for the now-playing widget

## Features

- Pages: Home, About, Projects (list + detail), Resume, Blog (list + detail), Components, Terminal Setup, Gears, custom 404
- Markdown blog (`/blog/*.mdx`) with syntax highlighting, heading anchors, reading time, scroll-progress pill, code-copy buttons, prev/next nav, related posts, and per-post view counters
- Home-page insights: unique visitors/sessions chart, GitHub contribution graph, now-playing, contact chat
- SEO: `sitemap.xml`, `robots.txt`, RSS at `/rss.xml`, dynamic Open Graph images (site + per-post + per-project), JSON-LD (`Person`, `WebSite`, `BlogPosting`)
- Reduced-motion respected via `MotionConfig` (single `motion` package — all animated components share it)
- Theme-aware, keyboard-accessible (skip link, one `h1` per page, focus-managed dialogs)

## Project structure

```
app/
├── page.tsx                   # Home
├── about/ · projects/ · resume/ · terminal/ · gears/ · components/
├── blog/
│   ├── page.tsx               # /blog list (?tag= filter)
│   └── [slug]/                # Post detail + per-post OG image
├── opengraph-image.tsx        # Site-wide OG card
├── sitemap.ts · robots.ts · rss.xml/route.ts
├── error.tsx · global-error.tsx · not-found.tsx
└── api/
    ├── contact/route.ts       # Resend-backed contact form (honeypot + rate limit)
    ├── contributions/route.ts # GitHub contribution graph data (cached 24h)
    ├── insights/route.ts      # 30-day visitor/session series from Redis
    ├── visitors/route.ts      # Site-wide visitor counter
    ├── posts/[slug]/views/    # Per-post view counts
    └── projects/[slug]/views/ # Per-project view counts

blog/                          # MDX posts with frontmatter
components/                    # charts, layout, motion, search, sections, theme, ui
hooks/ · lib/ · config/ · constants/ · types/
tests/                         # Vitest unit tests (dates, blog, search, charts)
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
# Upstash Redis — visitor counter, view counts, insights, rate limiting.
# Without these the counters degrade gracefully (pages still render).
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Resend — contact form delivery (form errors politely without it)
RESEND_API_KEY=...

# Last.fm — now-playing widget (hidden without these)
LASTFM_API_KEY=...
LASTFM_USERNAME=...
```

## Scripts

```bash
pnpm dev          # Next.js dev server
pnpm build        # Production build
pnpm start        # Run the production build
pnpm typecheck    # tsc --noEmit
pnpm lint         # ESLint
pnpm test         # Vitest unit tests
pnpm format       # Prettier --write .
```

CI (GitHub Actions) runs build, typecheck, lint, and tests on every push/PR.

## Adding a blog post

Create a new `.mdx` (or `.md`) file in `/blog/` with frontmatter:

```mdx
---
title: "Your post title"
description: "One-line description — used in OG, RSS, list page."
createdAt: 2026-05-22
updatedAt: 2026-05-22
tags: [engineering]
---

Your content. Standard Markdown + raw HTML works. Code blocks
get syntax highlighted automatically.
```

The slug is derived from the filename (`my-post.mdx` → `/blog/my-post`). Posts
sort by `createdAt` descending. Dates may be written unquoted — they are
normalized to `YYYY-MM-DD` internally.

`generateStaticParams` reads the blog directory at build time, so a fresh
`pnpm build` is required for new posts to appear in production.

## Customising

- **Identity**: `lib/constants.ts` (`SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION`, `SITE_AUTHOR`, `SITE_AUTHOR_EMAIL`) — flows into RSS, JSON-LD, and the sitemap.
- **Nav links**: `config/site.ts` (`NAV_LINKS`); rendered by `components/layout/Navbar.tsx` and `Footer.tsx`.
- **Projects**: `lib/projects.ts` — the `PROJECTS` array.
- **Work experience**: `components/sections/work/index.tsx` — `WORK_EXPERIENCE`.
- **Gears**: `app/gears/page.tsx` — `DEVICES`, `EXTENSIONS`, `SOFTWARE`.
- **Terminal setup**: `app/terminal/page.tsx` — snippet constants at the top.
- **OG cards**: `app/opengraph-image.tsx` (site) and the per-post/per-project `opengraph-image.tsx` files.
- **Theme tokens**: `app/globals.css` — `:root` and `.dark` variables.

## Deployment

Built for Vercel: push to a connected repository and add the env vars above in
the project settings. Any platform that supports Node + the Next.js runtime
works — `pnpm build` outputs a mostly static site plus the `/api/*` routes.
