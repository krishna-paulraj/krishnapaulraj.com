import { describe, expect, it } from "vitest";

import { signAdminSession, verifyAdminSession } from "@/lib/admin-auth";
import {
  CHAT_LIMITS,
  displayName,
  groupMessages,
  normalizeChatDraft,
  normalizeIdentity,
  pollDelayMs,
  type ChatMessage,
} from "@/lib/chat";

function message(over: Partial<ChatMessage> & { seq: number }): ChatMessage {
  return {
    id: `m${over.seq}`,
    role: "visitor",
    body: "hi",
    createdAt: "2026-08-16T10:00:00.000Z",
    ...over,
  };
}

describe("normalizeChatDraft", () => {
  it("rejects anything that isn't a non-empty string", () => {
    expect(normalizeChatDraft(undefined).ok).toBe(false);
    expect(normalizeChatDraft(42).ok).toBe(false);
    expect(normalizeChatDraft("   \n  ").ok).toBe(false);
  });

  it("strips control characters but keeps newlines and tabs", () => {
    const result = normalizeChatDraft("a\u0000b\tc\nd");
    expect(result).toEqual({ ok: true, body: "ab\tc\nd" });
  });

  it("normalizes CRLF and collapses runs of blank lines", () => {
    const result = normalizeChatDraft("one\r\n\r\n\r\n\r\ntwo");
    expect(result).toEqual({ ok: true, body: "one\n\ntwo" });
  });

  it("rejects a body over the cap but accepts one exactly at it", () => {
    expect(normalizeChatDraft("x".repeat(CHAT_LIMITS.body)).ok).toBe(true);
    expect(normalizeChatDraft("x".repeat(CHAT_LIMITS.body + 1)).ok).toBe(false);
  });
});

describe("normalizeIdentity", () => {
  it("requires a name", () => {
    expect(normalizeIdentity("", "a@b.co").ok).toBe(false);
    expect(normalizeIdentity("   ", null).ok).toBe(false);
    expect(normalizeIdentity(undefined, null).ok).toBe(false);
  });

  it("treats a missing or blank email as absent rather than invalid", () => {
    expect(normalizeIdentity("Ada", undefined)).toEqual({
      ok: true,
      name: "Ada",
      email: null,
    });
    expect(normalizeIdentity("Ada", "   ")).toEqual({
      ok: true,
      name: "Ada",
      email: null,
    });
  });

  it("rejects a malformed email", () => {
    expect(normalizeIdentity("Ada", "not-an-email").ok).toBe(false);
    expect(normalizeIdentity("Ada", "a@b.co")).toEqual({
      ok: true,
      name: "Ada",
      email: "a@b.co",
    });
  });

  it("never lets a newline into a display name", () => {
    const result = normalizeIdentity("Ada\nLovelace", null);
    expect(result).toEqual({ ok: true, name: "AdaLovelace", email: null });
  });

  it("enforces the caps", () => {
    expect(normalizeIdentity("x".repeat(CHAT_LIMITS.name + 1), null).ok).toBe(
      false,
    );
    const longEmail = `${"x".repeat(CHAT_LIMITS.email)}@b.co`;
    expect(normalizeIdentity("Ada", longEmail).ok).toBe(false);
  });
});

describe("displayName", () => {
  it("falls back to a short id so anonymous threads stay distinguishable", () => {
    expect(displayName({ id: "abc123def", name: null })).toBe(
      "Anonymous · abc123",
    );
    expect(displayName({ id: "abc123def", name: "Ada" })).toBe("Ada");
  });
});

describe("groupMessages", () => {
  it("opens and closes a run per author", () => {
    const rows = groupMessages([
      message({ seq: 1, role: "visitor" }),
      message({ seq: 2, role: "visitor" }),
      message({ seq: 3, role: "owner" }),
    ]);

    expect(rows.map((r) => r.startsRun)).toEqual([true, false, true]);
    expect(rows.map((r) => r.endsRun)).toEqual([false, true, true]);
  });

  it("anchors exactly the rows that start a run", () => {
    const rows = groupMessages([
      message({ seq: 1, role: "visitor" }),
      message({ seq: 2, role: "visitor" }),
      message({ seq: 3, role: "owner" }),
    ]);

    // Anchoring every row would make "last-anchor" positioning degenerate into
    // plain "end", which is the whole point of the distinction.
    expect(rows.map((r) => r.scrollAnchor)).toEqual([true, false, true]);
  });

  it("marks only the first message of each day", () => {
    const rows = groupMessages([
      message({ seq: 1, createdAt: "2026-08-16T10:00:00.000Z" }),
      message({ seq: 2, createdAt: "2026-08-16T11:00:00.000Z" }),
      message({ seq: 3, createdAt: "2026-08-17T09:00:00.000Z" }),
    ]);

    expect(rows.map((r) => r.dayBreak)).toEqual([
      "2026-08-16",
      null,
      "2026-08-17",
    ]);
  });

  it("reopens a run across a day boundary even for the same author", () => {
    const rows = groupMessages([
      message({
        seq: 1,
        role: "visitor",
        createdAt: "2026-08-16T23:00:00.000Z",
      }),
      message({
        seq: 2,
        role: "visitor",
        createdAt: "2026-08-17T09:00:00.000Z",
      }),
    ]);

    // Without this the first message under a new date renders with no header,
    // orphaned beneath a separator.
    expect(rows[1]!.startsRun).toBe(true);
    expect(rows[0]!.endsRun).toBe(true);
  });

  it("handles an empty transcript", () => {
    expect(groupMessages([])).toEqual([]);
  });
});

describe("pollDelayMs", () => {
  it("stops entirely when the tab is hidden", () => {
    expect(
      pollDelayMs({ open: true, visible: false, msSinceLastMessage: 0 }),
    ).toBeNull();
  });

  it("backs off as the conversation goes quiet", () => {
    const at = (ms: number) =>
      pollDelayMs({ open: true, visible: true, msSinceLastMessage: ms });

    expect(at(0)).toBe(5_000);
    expect(at(3 * 60_000)).toBe(15_000);
    expect(at(30 * 60_000)).toBe(30_000);
  });

  it("checks only occasionally while closed", () => {
    expect(
      pollDelayMs({ open: false, visible: true, msSinceLastMessage: 0 }),
    ).toBe(60_000);
  });
});

describe("verifyAdminSession", () => {
  const secret = "a-long-test-passphrase";
  const now = 1_760_000_000_000;

  it("accepts a session it just signed", () => {
    const cookie = signAdminSession(secret, now);
    expect(verifyAdminSession(cookie, secret, now + 1000)).toBe(true);
  });

  it("rejects one that has expired", () => {
    const cookie = signAdminSession(secret, now);
    const week = 1000 * 60 * 60 * 24 * 7;
    expect(verifyAdminSession(cookie, secret, now + week + 1)).toBe(false);
  });

  it("rejects a different secret", () => {
    const cookie = signAdminSession(secret, now);
    expect(verifyAdminSession(cookie, "another-passphrase", now)).toBe(false);
  });

  it("rejects an extended expiry, because the expiry is inside the MAC", () => {
    const cookie = signAdminSession(secret, now);
    const sig = cookie.slice(cookie.lastIndexOf(".") + 1);
    const forged = `${now + 1000 * 60 * 60 * 24 * 365}.${sig}`;
    expect(verifyAdminSession(forged, secret, now)).toBe(false);
  });

  it("rejects junk", () => {
    expect(verifyAdminSession(undefined, secret, now)).toBe(false);
    expect(verifyAdminSession("", secret, now)).toBe(false);
    expect(verifyAdminSession("no-dot", secret, now)).toBe(false);
    expect(verifyAdminSession(".sig", secret, now)).toBe(false);
  });
});
