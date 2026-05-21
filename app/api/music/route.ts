import { getLastPlayed } from "@/lib/music"

export const revalidate = 60

export async function GET() {
  const track = await getLastPlayed()
  if (!track) return Response.json(null)
  return Response.json(track)
}
