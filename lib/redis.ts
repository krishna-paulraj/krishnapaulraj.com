import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { createHash } from "node:crypto";

let client: Redis | null = null;

/**
 * Lazy singleton so importing this module never throws — a missing Upstash
 * env surfaces per call (where callers can degrade gracefully) instead of
 * taking down every route that transitively imports the module.
 */
export function getRedis(): Redis {
  client ??= Redis.fromEnv();
  return client;
}

const DEFAULT_WINDOW_SECONDS = 60 * 60 * 24;

/**
 * Client IP and user agent as reported by the platform. On Vercel
 * `x-forwarded-for` is set at the edge and can't be spoofed by the client;
 * on other hosts treat these as best-effort.
 */
async function requestMeta(): Promise<{ ip: string; ua: string }> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local";
  const ua = h.get("user-agent") ?? "";
  return { ip, ua };
}

export async function markUniqueVisit(
  scope: string,
  windowSeconds: number = DEFAULT_WINDOW_SECONDS,
): Promise<boolean> {
  const { ip, ua } = await requestMeta();
  const fp = createHash("sha256").update(`${ip}|${ua}`).digest("hex");
  const result = await getRedis().set(`${scope}:${fp}`, 1, {
    nx: true,
    ex: windowSeconds,
  });
  return result === "OK";
}

export async function getViews(
  scope: "post" | "project",
  slugs: string[],
): Promise<Record<string, number>> {
  if (slugs.length === 0) return {};
  try {
    const keys = slugs.map((s) => `${scope}:${s}:views`);
    const values = await getRedis().mget<(number | null)[]>(...keys);
    return Object.fromEntries(slugs.map((s, i) => [s, values[i] ?? 0]));
  } catch (error) {
    // Next signals "this fetch made the route dynamic" during prerendering by
    // throwing — that marker must propagate, not be treated as an outage.
    if (
      error instanceof Error &&
      (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    // View counters are cosmetic — never take a page down over them.
    console.error("getViews: falling back to zeros", error);
    return Object.fromEntries(slugs.map((s) => [s, 0]));
  }
}

/**
 * Fixed-window rate limiter keyed by client IP only — deliberately not the
 * user agent, which is attacker-controlled and would mint a fresh bucket per
 * request. Fails open: if Redis is unreachable the action is allowed rather
 * than blocking real users.
 */
export async function rateLimit(
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<{ ok: boolean; remaining: number }> {
  try {
    const { ip } = await requestMeta();
    const ipHash = createHash("sha256").update(ip).digest("hex");
    const key = `ratelimit:${scope}:${ipHash}`;
    const redis = getRedis();
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    return { ok: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (error) {
    console.error("rateLimit: failing open", error);
    return { ok: true, remaining: limit };
  }
}
