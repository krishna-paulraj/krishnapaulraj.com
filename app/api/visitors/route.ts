import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { createHash } from "node:crypto";

const redis = Redis.fromEnv();
const WINDOW_SECONDS = 60 * 60 * 24;

export async function POST() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local";
  const ua = h.get("user-agent") ?? "";
  const fingerprint = createHash("sha256").update(`${ip}|${ua}`).digest("hex");

  const isNew = await redis.set(`visitor:${fingerprint}`, 1, {
    nx: true,
    ex: WINDOW_SECONDS,
  });

  const count = isNew
    ? await redis.incr("visitors")
    : ((await redis.get<number>("visitors")) ?? 0);

  return Response.json({ count });
}

export async function GET() {
  const count = (await redis.get<number>("visitors")) ?? 0;
  return Response.json({ count });
}
