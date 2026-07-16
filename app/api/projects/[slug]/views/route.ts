import { getProjectSlugs } from "@/lib/projects";
import { getRedis, markUniqueVisit } from "@/lib/redis";

function viewsKey(slug: string) {
  return `project:${slug}:views`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!getProjectSlugs().includes(slug)) {
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
  if (!getProjectSlugs().includes(slug)) {
    return new Response("Not found", { status: 404 });
  }

  const redis = getRedis();
  const isNew = await markUniqueVisit(`project:${slug}:viewer`);
  const count = isNew
    ? await redis.incr(viewsKey(slug))
    : ((await redis.get<number>(viewsKey(slug))) ?? 0);

  return Response.json({ count });
}
