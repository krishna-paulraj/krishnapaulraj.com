import type { StaticImageData } from "next/image";
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
  SiVite,
  SiWebrtc,
  SiRelay,
  SiIterm2,
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
  vite: { icon: SiVite, label: "Vite", color: "#646CFF" },
  webrtc: { icon: SiWebrtc, label: "WebRTC", color: "#" },
  relay: { icon: SiRelay, label: "Relay", color: "#" },
  cli: { icon: SiIterm2, label: "Cli", color: "#17A64E" },
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
  image?: string | StaticImageData;
  imageDark?: string | StaticImageData;
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
    tech: [
      "next",
      "typescript",
      "nestjs",
      "postgres",
      "prisma",
      "redis",
      "rabbitmq",
      "tailwind",
      "docker",
    ],
    links: [
      {
        label: "Source",
        href: "https://github.com/krishna-paulraj/writora",
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
    slug: "p2p-messenger",
    name: "p2p-messenger",
    description:
      "A serverless, end-to-end encrypted peer-to-peer messenger that combines WebRTC for low-latency P2P data transport with Nostr relays for decentralized signaling, peer discovery, and store-and-forward offline delivery.",
    longDescription:
      "A serverless, end-to-end encrypted peer-to-peer messenger that combines `WebRTC` for low-latency P2P data transport with `Nostr` relays for decentralized signaling, peer discovery, and store-and-forward offline delivery. It has zero vendor-controlled infrastructure -- users run their own relay or use public Nostr relays. The project ships with both a `CLI` (basic readline and a full-screen TUI built with React/ink) and a `browser web client` (Vite + React + Tailwind + Zustand). Both the CLI and web client are fully interoperable, sharing the same wire format and encryption protocols.\n\n## Stack\n\n- **Language**: TypeScript (strict mode, ES2022) across all packages\n- **Monorepo tooling**: pnpm workspaces\n- **Web framework**: React 19, React DOM 19\n- **Web bundler**: Vite 6 with @vitejs/plugin-react\n- **CSS**: Tailwind CSS 3.4 (dark-mode, custom peer accent colors)\n- **State management (web)**: Zustand 5\n- **CLI UI**: ink 7 (React for terminal)\n- **Crypto**: @noble/ciphers (XChaCha20-Poly1305), @noble/curves (X25519, secp256k1), @noble/hashes (SHA-256, BLAKE3, HKDF-SHA256)\n- **Nostr protocol**: nostr-tools v2.23 (NIP-44, NIP-59 gift wrap, relay pool)\n- **WebRTC**: @roamhq/wrtc (Node WebRTC), browser native RTCPeerConnection\n- **WebSocket**: ws (both client and server)\n- **Database (CLI)**: better-sqlite3 (message history persistence)\n- **Database (web)**: idb-keyval (IndexedDB wrapper for identity, contacts, ratchet states, history)\n\n## Notable bits\n\nThe messenger implements Signal-grade cryptography including Double Ratchet for 1:1 offline messages, Sender Keys for group chats, and NIP-59 gift wrap for sender anonymity. It features hybrid P2P routing: WebRTC data channels when peers are online and connected, falling back to Nostr relays for offline delivery or when P2P is unavailable. File transfer uses chunked transfer with BLAKE3 Merkle root verification. The architecture is Nostr-native with multi-relay fan-out + subscription, NIP-05 identity resolution, presence events, and vector clock causal ordering. Two UI implementations are provided: a CLI TUI (React + ink) with split-pane scrollback, detached input, tab completion, and multi-window support; and a browser client (Vite + React + Tailwind + Zustand) with identity in IndexedDB, contact management, 1:1 chat, relay management, and settings panel.",
    tech: ["vite", "tailwind", "typescript", "relay", "webrtc", "cli"],
    links: [
      {
        label: "Source",
        href: "https://github.com/krishna-paulraj/p2p-messenger",
        type: "source",
      },
    ],
    year: "2026",
    status: "live",
    highlights: [
      "End-to-end encrypted with Signal-grade Double Ratchet and Sender Keys.",
      "Hybrid P2P routing: WebRTC data channels + Nostr relays for offline delivery.",
      "File transfer with chunked transfer and BLAKE3 Merkle root verification.",
      "Nostr-native architecture with multi-relay fan-out and NIP-05 identity resolution.",
      "Dual UI: CLI TUI (React/ink) and browser client (Vite+React+Tailwind+Zustand).",
      "Offline-first with store-and-forward delivery via Nostr relays.",
    ],
    featured: true,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getProjectSlugs(): string[] {
  return PROJECTS.map((p) => p.slug);
}
