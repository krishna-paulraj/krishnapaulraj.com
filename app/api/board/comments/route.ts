import { boardKeyMatches } from "@/lib/board-auth";
import {
  COMMENT_LIMITS,
  normalizeDraft,
  type BoardComment,
} from "@/lib/board-comments";
import { getPrisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/redis";

// A comment maxes out at 500 chars; this leaves ample room for the envelope
// while still rejecting anything pathological before it is parsed.
const MAX_BODY_BYTES = 8 * 1024;

/** Postgres foreign-key violation — the card id doesn't exist. */
const FK_VIOLATION = "P2003";

type StoredComment = {
  id: string;
  author: string;
  body: string;
  owner: boolean;
  createdAt: Date;
};

function toComment(row: StoredComment): BoardComment {
  return {
    id: row.id,
    author: row.author,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    ...(row.owner ? { owner: true as const } : {}),
  };
}

function isOwner(request: Request): boolean {
  const secret = process.env.BOARD_SECRET;
  if (!secret) return false;
  return boardKeyMatches(request.headers.get("x-board-key"), secret);
}

async function readThread(cardId: string): Promise<BoardComment[]> {
  const rows = await getPrisma().boardComment.findMany({
    where: { cardId },
    orderBy: { createdAt: "asc" },
    take: COMMENT_LIMITS.perCard,
  });
  return rows.map(toComment);
}

export async function GET(request: Request) {
  const cardId = new URL(request.url).searchParams.get("cardId")?.trim();
  if (!cardId || cardId.length > COMMENT_LIMITS.id) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    return Response.json({ comments: await readThread(cardId) });
  } catch (error) {
    console.error("Comment read failed", error);
    return Response.json(
      { error: "Comments are unavailable right now." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large." }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const payload = (parsed ?? {}) as Record<string, unknown>;
  const cardId =
    typeof payload.cardId === "string" ? payload.cardId.trim() : "";
  if (!cardId || cardId.length > COMMENT_LIMITS.id) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const draft = normalizeDraft(payload.author, payload.body);
  if (!draft.ok) {
    return Response.json({ error: draft.error }, { status: 400 });
  }

  // The owner posts through the same path; only their writes skip the limit,
  // so moderating a busy thread never locks them out of their own board.
  const owner = isOwner(request);
  if (!owner) {
    const { ok: underLimit } = await rateLimit("board-comment", 10, 3600);
    if (!underLimit) {
      return Response.json(
        { error: "Too many comments — try again later." },
        { status: 429 },
      );
    }
  }

  try {
    const prisma = getPrisma();
    // The foreign key is the existence check: an unknown card id can't be used
    // to accumulate rows, and comments can never outlive their card.
    await prisma.boardComment.create({
      data: { cardId, author: draft.author, body: draft.body, owner },
    });

    // Trim the thread to its cap, oldest first.
    const overflow = await prisma.boardComment.findMany({
      where: { cardId },
      orderBy: { createdAt: "desc" },
      skip: COMMENT_LIMITS.perCard,
      select: { id: true },
    });
    if (overflow.length > 0) {
      await prisma.boardComment.deleteMany({
        where: { id: { in: overflow.map((row) => row.id) } },
      });
    }

    return Response.json({ comments: await readThread(cardId) });
  } catch (error) {
    if ((error as { code?: string })?.code === FK_VIOLATION) {
      return Response.json({ error: "That card is gone." }, { status: 404 });
    }
    console.error("Comment write failed", error);
    return Response.json(
      { error: "Couldn't post that — try again." },
      { status: 503 },
    );
  }
}

/** Moderation: the board owner can remove any comment on any card. */
export async function DELETE(request: Request) {
  if (!process.env.BOARD_SECRET) {
    return Response.json(
      { error: "Editing isn't configured." },
      { status: 503 },
    );
  }
  if (!isOwner(request)) {
    return Response.json({ error: "Not allowed." }, { status: 401 });
  }

  const url = new URL(request.url);
  const cardId = url.searchParams.get("cardId")?.trim();
  const commentId = url.searchParams.get("commentId")?.trim();
  if (!cardId || !commentId) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    // Scoped by cardId as well, so a stale id can't delete across threads.
    await getPrisma().boardComment.deleteMany({
      where: { id: commentId, cardId },
    });
    return Response.json({ comments: await readThread(cardId) });
  } catch (error) {
    console.error("Comment delete failed", error);
    return Response.json(
      { error: "Couldn't delete that — try again." },
      { status: 503 },
    );
  }
}
