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
