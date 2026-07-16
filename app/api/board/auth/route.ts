import { boardKeyMatches } from "@/lib/board-auth";
import { rateLimit } from "@/lib/redis";

/**
 * Verifies the owner passphrase for the board's unlock dialog (and the silent
 * revalidation of a stored key on page load). Only FAILED attempts count
 * against the rate limit, so the owner is never locked out by their own
 * successful checks while brute force stalls after a handful of misses.
 */
export async function POST(request: Request) {
  const secret = process.env.BOARD_SECRET;
  if (!secret) {
    return Response.json(
      { error: "Editing isn't configured." },
      { status: 503 },
    );
  }

  if (!boardKeyMatches(request.headers.get("x-board-key"), secret)) {
    const { ok: underLimit } = await rateLimit("board-auth", 5, 900);
    return Response.json(
      {
        error: underLimit
          ? "Wrong passphrase."
          : "Too many attempts — try again later.",
      },
      { status: underLimit ? 401 : 429 },
    );
  }

  return new Response(null, { status: 204 });
}
