import { markUniqueVisit, redis } from "@/lib/redis";

export async function POST() {
  const isNew = await markUniqueVisit("visitor");

  const count = isNew
    ? await redis.incr("visitors")
    : ((await redis.get<number>("visitors")) ?? 0);

  return Response.json({ count });
}

export async function GET() {
  const count = (await redis.get<number>("visitors")) ?? 0;
  return Response.json({ count });
}
