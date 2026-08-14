import { describe, expect, it } from "vitest";

import {
  ANONYMOUS_AUTHOR,
  COMMENT_LIMITS,
  normalizeDraft,
} from "@/lib/board-comments";

/** A C0 control character — the class normalizeDraft is meant to strip. */
const BELL = "\u0007";

const ok = (result: ReturnType<typeof normalizeDraft>) => {
  if (!result.ok) throw new Error(`expected ok, got: ${result.error}`);
  return result;
};

describe("normalizeDraft", () => {
  it("keeps a plain comment and the given name", () => {
    const result = ok(normalizeDraft("Krishna", "Looks good to me"));
    expect(result.author).toBe("Krishna");
    expect(result.body).toBe("Looks good to me");
  });

  it("falls back to Anonymous when no usable name is given", () => {
    expect(ok(normalizeDraft("   ", "hi")).author).toBe(ANONYMOUS_AUTHOR);
    expect(ok(normalizeDraft(undefined, "hi")).author).toBe(ANONYMOUS_AUTHOR);
    expect(ok(normalizeDraft(42, "hi")).author).toBe(ANONYMOUS_AUTHOR);
  });

  it("requires a non-empty body", () => {
    expect(normalizeDraft("a", "   ").ok).toBe(false);
    expect(normalizeDraft("a", "").ok).toBe(false);
    expect(normalizeDraft("a", undefined).ok).toBe(false);
    expect(normalizeDraft("a", 5).ok).toBe(false);
  });

  it("rejects a body or name over the cap", () => {
    expect(normalizeDraft("a", "x".repeat(COMMENT_LIMITS.body + 1)).ok).toBe(
      false,
    );
    expect(normalizeDraft("x".repeat(COMMENT_LIMITS.author + 1), "hi").ok).toBe(
      false,
    );
  });

  it("accepts a body and name exactly at the cap", () => {
    expect(normalizeDraft("a", "x".repeat(COMMENT_LIMITS.body)).ok).toBe(true);
    expect(normalizeDraft("x".repeat(COMMENT_LIMITS.author), "hi").ok).toBe(
      true,
    );
  });

  it("normalizes CRLF and collapses blank-line runs", () => {
    expect(ok(normalizeDraft("a", "one\r\n\r\n\r\n\r\ntwo")).body).toBe(
      "one\n\ntwo",
    );
  });

  it("strips control characters but keeps newlines and tabs in the body", () => {
    expect(ok(normalizeDraft("a", `one${BELL}two\n\tthree`)).body).toBe(
      "onetwo\n\tthree",
    );
  });

  it("strips newlines from the display name", () => {
    expect(ok(normalizeDraft("Krish\nna", "hi")).author).toBe("Krishna");
  });

  it("measures the body against the cap after normalizing, not before", () => {
    // Otherwise control characters could pad a body past the length check and
    // still land in storage at full size.
    const padded = "x".repeat(COMMENT_LIMITS.body) + BELL.repeat(50);
    expect(normalizeDraft("a", padded).ok).toBe(true);
  });
});
