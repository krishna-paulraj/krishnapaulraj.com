import {
  BOARD_COLUMNS,
  emptyBoard,
  parseBoardState,
  type BoardColumnId,
} from "@/lib/board";
import { boardKeyMatches } from "@/lib/board-auth";
import { getPrisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/redis";
import type { BoardCard, BoardState } from "@/types";

// Generous ceiling: a full board at the validator's caps (150 cards with
// 1000-char notes) serializes well under this.
const MAX_BODY_BYTES = 256 * 1024;

const COLUMN_IDS = new Set<string>(BOARD_COLUMNS.map((column) => column.id));

type StoredCard = {
  id: string;
  column: string;
  position: number;
  title: string;
  note: string | null;
  tag: string | null;
  url: string | null;
  progress: number | null;
  updatedAt: Date;
};

/** Nulls become absent keys, matching the shape `parseBoardState` produces. */
function toBoardCard(row: StoredCard): BoardCard {
  return {
    id: row.id,
    title: row.title,
    updatedAt: row.updatedAt.toISOString(),
    ...(row.note ? { note: row.note } : {}),
    ...(row.tag ? { tag: row.tag } : {}),
    ...(row.url ? { url: row.url } : {}),
    ...(row.progress === null ? {} : { progress: row.progress }),
  };
}

export async function GET() {
  try {
    const rows = await getPrisma().boardCard.findMany({
      orderBy: [{ column: "asc" }, { position: "asc" }],
      include: { _count: { select: { comments: true } } },
    });

    const board = emptyBoard();
    const commentCounts: Record<string, number> = {};

    for (const row of rows) {
      // A row in a column this build doesn't know about is skipped rather than
      // failing the whole read — the board degrades, it doesn't disappear.
      if (!COLUMN_IDS.has(row.column)) continue;
      board[row.column as BoardColumnId].push(toBoardCard(row));
      if (row._count.comments > 0) {
        commentCounts[row.id] = row._count.comments;
      }
    }

    return Response.json({ board, commentCounts });
  } catch (error) {
    console.error("Board read failed", error);
    return Response.json(
      { error: "The board is unavailable right now." },
      { status: 503 },
    );
  }
}

/** Flatten the validated payload into rows, carrying each card's column/index. */
function toRows(board: BoardState) {
  return BOARD_COLUMNS.flatMap((column) =>
    board[column.id].map((card, position) => ({
      id: card.id,
      column: column.id as string,
      position,
      title: card.title,
      note: card.note ?? null,
      tag: card.tag ?? null,
      url: card.url ?? null,
      progress: card.progress ?? null,
      updatedAt: new Date(card.updatedAt),
    })),
  );
}

type Row = ReturnType<typeof toRows>[number];

function isUnchanged(row: Row, existing: StoredCard): boolean {
  return (
    row.column === existing.column &&
    row.position === existing.position &&
    row.title === existing.title &&
    row.note === existing.note &&
    row.tag === existing.tag &&
    row.url === existing.url &&
    row.progress === existing.progress &&
    row.updatedAt.getTime() === existing.updatedAt.getTime()
  );
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
    const prisma = getPrisma();
    const rows = toRows(board);
    const existing = await prisma.boardCard.findMany();
    const byId = new Map(existing.map((row) => [row.id, row]));
    const incomingIds = new Set(rows.map((row) => row.id));

    // The client PUTs the whole board on every edit, but a drag usually moves
    // one card. Writing only the rows that actually differ keeps a reorder to a
    // couple of statements instead of one per card — and, crucially, never
    // deletes and recreates a row, which would cascade its comments away.
    const removed = existing
      .filter((row) => !incomingIds.has(row.id))
      .map((row) => row.id);
    const created = rows.filter((row) => !byId.has(row.id));
    const updated = rows.filter((row) => {
      const current = byId.get(row.id);
      return current && !isUnchanged(row, current);
    });

    if (removed.length === 0 && created.length === 0 && updated.length === 0) {
      return Response.json({ ok: true });
    }

    await prisma.$transaction([
      ...(removed.length
        ? [prisma.boardCard.deleteMany({ where: { id: { in: removed } } })]
        : []),
      ...created.map((row) => prisma.boardCard.create({ data: row })),
      ...updated.map((row) =>
        prisma.boardCard.update({ where: { id: row.id }, data: row }),
      ),
    ]);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Board write failed", error);
    return Response.json(
      { error: "Couldn't save — try again." },
      { status: 503 },
    );
  }
}
