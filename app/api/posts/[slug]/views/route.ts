import { Redis } from "@upstash/redis";

import { getBlogSlugs } from "@/lib/blog";

const redis = Redis.fromEnv();

function viewsKey(slug: string) {
  return `post:${slug}:views`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!getBlogSlugs().includes(slug)) {
    return new Response("Not found", { status: 404 });
  }
  const count = (await redis.get<number>(viewsKey(slug))) ?? 0;
  return Response.json({ count });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!getBlogSlugs().includes(slug)) {
    return new Response("Not found", { status: 404 });
  }
  const count = await redis.incr(viewsKey(slug));
  return Response.json({ count });
}
