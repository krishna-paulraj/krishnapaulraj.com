/**
 * Public Kanban board: fixed columns, owner-editable cards, persisted as a
 * single JSON value in Redis (key "board"). The validator is pure so the
 * write route and unit tests share it.
 */

export const BOARD_COLUMNS = [
  { id: "backlog", title: "Backlog" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
] as const;

export type BoardColumnId = (typeof BOARD_COLUMNS)[number]["id"];

export type BoardCard = {
  id: string;
  title: string;
  note?: string;
  tag?: string;
  url?: string;
  /** Completion, 0-100. Absent means "not tracked" — the card shows no bar. */
  progress?: number;
  updatedAt: string;
};

export type BoardState = Record<BoardColumnId, BoardCard[]>;

export const BOARD_REDIS_KEY = "board";

export const BOARD_LIMITS = {
  cardsPerColumn: 50,
  id: 64,
  title: 120,
  // Markdown description — roomy enough for a Trello-style write-up.
  note: 1000,
  tag: 24,
  url: 300,
  // Upper bound of the progress scale, not a length cap.
  progress: 100,
} as const;

export function emptyBoard(): BoardState {
  return { backlog: [], "in-progress": [], done: [] };
}

export function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseCard(value: unknown, seenIds: Set<string>): BoardCard | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;

  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!id || id.length > BOARD_LIMITS.id || seenIds.has(id)) return null;

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title || title.length > BOARD_LIMITS.title) return null;

  const updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : "";
  if (!updatedAt || Number.isNaN(Date.parse(updatedAt))) return null;

  const note = typeof raw.note === "string" ? raw.note.trim() : "";
  if (note.length > BOARD_LIMITS.note) return null;

  const tag = typeof raw.tag === "string" ? raw.tag.trim() : "";
  if (tag.length > BOARD_LIMITS.tag) return null;

  const url = typeof raw.url === "string" ? raw.url.trim() : "";
  if (url && (url.length > BOARD_LIMITS.url || !isSafeUrl(url))) return null;

  // Absent is valid (untracked); anything present must be a whole percentage.
  const hasProgress = raw.progress !== undefined;
  const progress = raw.progress;
  if (
    hasProgress &&
    (typeof progress !== "number" ||
      !Number.isInteger(progress) ||
      progress < 0 ||
      progress > BOARD_LIMITS.progress)
  ) {
    return null;
  }

  seenIds.add(id);
  return {
    id,
    title,
    updatedAt,
    ...(note ? { note } : {}),
    ...(tag ? { tag } : {}),
    ...(url ? { url } : {}),
    ...(hasProgress ? { progress: progress as number } : {}),
  };
}

/**
 * Validate an untrusted payload into a BoardState. Returns null on any
 * violation: wrong/extra columns, oversized columns, malformed cards,
 * duplicate card ids (drag-and-drop requires ids to be board-unique), or
 * non-http(s) URLs.
 */
export function parseBoardState(value: unknown): BoardState | null {
  if (typeof value !== "object" || value === null) return null;

  const raw = value as Record<string, unknown>;
  const expected = BOARD_COLUMNS.map((c) => c.id);
  const keys = Object.keys(raw);
  if (keys.length !== expected.length || !expected.every((id) => id in raw)) {
    return null;
  }

  const board = emptyBoard();
  const seenIds = new Set<string>();

  for (const columnId of expected) {
    const cards = raw[columnId];
    if (!Array.isArray(cards) || cards.length > BOARD_LIMITS.cardsPerColumn) {
      return null;
    }
    for (const rawCard of cards) {
      const card = parseCard(rawCard, seenIds);
      if (!card) return null;
      board[columnId].push(card);
    }
  }

  return board;
}
