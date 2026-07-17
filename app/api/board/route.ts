import { BOARD_REDIS_KEY, emptyBoard, parseBoardState } from "@/lib/board";
import { boardKeyMatches } from "@/lib/board-auth";
import { getRedis, rateLimit } from "@/lib/redis";

// Generous ceiling: a full board at the validator's caps (150 cards with
// 1000-char notes) serializes well under this.
const MAX_BODY_BYTES = 256 * 1024;

export async function GET() {
  try {
    const stored = await getRedis().get<unknown>(BOARD_REDIS_KEY);
    // Run stored data through the validator too — a corrupted value degrades
    // to an empty board instead of crashing every client.
    const board = parseBoardState(stored) ?? emptyBoard();
    return Response.json({ board });
  } catch (error) {
    console.error("Board read failed", error);
    return Response.json(
      { error: "The board is unavailable right now." },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request) {
  const secret = process.env.BOARD_SECRET;
  if (!secret) {
    return Response.json(
      { error: "Editing isn't configured." },
      { status: 503 },
    );
  }

  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large." }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const board = parseBoardState(parsed);
  if (!board) {
    return Response.json({ error: "Invalid board payload." }, { status: 400 });
  }

  const { ok: underLimit } = await rateLimit("board-write", 60, 600);
  if (!underLimit) {
    return Response.json(
      { error: "Too many updates — slow down a little." },
      { status: 429 },
    );
  }

  if (!boardKeyMatches(request.headers.get("x-board-key"), secret)) {
    return Response.json({ error: "Not allowed." }, { status: 401 });
  }

  try {
    await getRedis().set(BOARD_REDIS_KEY, board);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Board write failed", error);
    return Response.json(
      { error: "Couldn't save — try again." },
      { status: 503 },
    );
  }
}
