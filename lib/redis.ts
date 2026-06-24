import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { createHash } from "node:crypto";

export const redis = Redis.fromEnv();

const DEFAULT_WINDOW_SECONDS = 60 * 60 * 24;

async function visitorFingerprint(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local";
  const ua = h.get("user-agent") ?? "";
  return createHash("sha256").update(`${ip}|${ua}`).digest("hex");
}

export async function markUniqueVisit(
  scope: string,
  windowSeconds: number = DEFAULT_WINDOW_SECONDS,
): Promise<boolean> {
  const fp = await visitorFingerprint();
  const result = await redis.set(`${scope}:${fp}`, 1, {
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
  const keys = slugs.map((s) => `${scope}:${s}:views`);
  const values = await redis.mget<(number | null)[]>(...keys);
  return Object.fromEntries(slugs.map((s, i) => [s, values[i] ?? 0]));
}

/**
 * Fixed-window rate limiter keyed by visitor fingerprint. Returns whether the
 * caller is still under `limit` for the current `windowSeconds` window.
 */
export async function rateLimit(
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<{ ok: boolean; remaining: number }> {
  const fp = await visitorFingerprint();
  const key = `ratelimit:${scope}:${fp}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return { ok: count <= limit, remaining: Math.max(0, limit - count) };
}
