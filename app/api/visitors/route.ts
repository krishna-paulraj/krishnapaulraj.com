import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST() {
  const count = await redis.incr("visitors");
  return Response.json({ count });
}

export async function GET() {
  const count = (await redis.get<number>("visitors")) ?? 0;
  return Response.json({ count });
}
