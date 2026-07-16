import { getBlogSlugs } from "@/lib/blog";
import { getRedis, markUniqueVisit } from "@/lib/redis";

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
  const count = (await getRedis().get<number>(viewsKey(slug))) ?? 0;
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

  const redis = getRedis();
  const isNew = await markUniqueVisit(`post:${slug}:viewer`);
  const count = isNew
    ? await redis.incr(viewsKey(slug))
    : ((await redis.get<number>(viewsKey(slug))) ?? 0);

  return Response.json({ count });
}
