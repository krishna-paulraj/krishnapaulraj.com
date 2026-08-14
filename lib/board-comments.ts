/**
 * Comments on board cards. The board itself is owner-only, but comments are
 * open to anonymous visitors, so everything here is written for untrusted
 * input: hard caps, no markdown (bodies render as plain text), and an owner
 * flag that only the server may set.
 *
 * Rows live in Postgres (see prisma/schema.prisma); this module is the pure,
 * testable half — the caps and the normalizer the API route validates against.
 */

export const COMMENT_LIMITS = {
  author: 40,
  body: 500,
  /** Oldest are dropped once a thread exceeds this. */
  perCard: 100,
  id: 64,
} as const;

export type BoardComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  /** Set server-side when the poster proved ownership of the board key. */
  owner?: boolean;
};

export const ANONYMOUS_AUTHOR = "Anonymous";

const TAB = 9;
const NEWLINE = 10;
const SPACE = 32;
const DELETE = 127;

/**
 * Drop C0/DEL control characters, which have no place in a comment and would
 * otherwise let a poster smuggle invisible payloads past the length caps.
 * Tabs survive; newlines survive only in bodies, never in display names.
 */
function stripControlChars(value: string, keepNewlines: boolean): string {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const kept =
      code === TAB ||
      (keepNewlines && code === NEWLINE) ||
      (code >= SPACE && code !== DELETE);
    if (kept) out += char;
  }
  return out;
}

export type CommentDraftResult =
  { ok: true; author: string; body: string } | { ok: false; error: string };

/**
 * Normalize what a visitor typed. Collapses runs of blank lines so one comment
 * can't stretch the thread vertically, and falls back to "Anonymous" when no
 * name is given.
 */
export function normalizeDraft(
  authorInput: unknown,
  bodyInput: unknown,
): CommentDraftResult {
  if (typeof bodyInput !== "string") {
    return { ok: false, error: "A comment is required." };
  }

  const body = stripControlChars(bodyInput.replace(/\r\n?/g, "\n"), true)
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!body) return { ok: false, error: "A comment is required." };
  if (body.length > COMMENT_LIMITS.body) {
    return { ok: false, error: "That comment is too long." };
  }

  const author =
    typeof authorInput === "string"
      ? stripControlChars(authorInput, false).trim()
      : "";
  if (author.length > COMMENT_LIMITS.author) {
    return { ok: false, error: "That name is too long." };
  }

  return { ok: true, author: author || ANONYMOUS_AUTHOR, body };
}
