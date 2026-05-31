import { markUniqueVisit, redis } from "@/lib/redis";

export async function POST() {
  const today = new Date().toISOString().slice(0, 10);

  const [isNew] = await Promise.all([
    markUniqueVisit("visitor"),
    redis.incr(`sessions:daily:${today}`),
  ]);

  const count = isNew
    ? await redis.incr("visitors")
    : ((await redis.get<number>("visitors")) ?? 0);

  if (isNew) {
    await redis.incr(`visitors:daily:${today}`);
  }

  return Response.json({ count });
}

export async function GET() {
  const count = (await redis.get<number>("visitors")) ?? 0;
  return Response.json({ count });
}
