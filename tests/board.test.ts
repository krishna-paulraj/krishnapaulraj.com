import { describe, expect, it } from "vitest";

import {
  BOARD_LIMITS,
  emptyBoard,
  isSafeUrl,
  parseBoardState,
  type BoardCard,
} from "@/lib/board";

const card = (overrides: Partial<BoardCard> = {}): BoardCard => ({
  id: "card-1",
  title: "Ship the board",
  updatedAt: "2026-07-17T00:00:00.000Z",
  ...overrides,
});

const board = (backlog: BoardCard[] = [card()]) => ({
  backlog,
  "in-progress": [] as BoardCard[],
  done: [] as BoardCard[],
});

describe("emptyBoard", () => {
  it("has exactly the three fixed columns, all empty", () => {
    expect(emptyBoard()).toEqual({
      backlog: [],
      "in-progress": [],
      done: [],
    });
  });
});

describe("parseBoardState", () => {
  it("round-trips a valid board", () => {
    const input = board([
      card({
        note: "Premium monochrome",
        tag: "site",
        url: "https://reui.io/docs/kanban",
      }),
    ]);
    expect(parseBoardState(input)).toEqual(input);
  });

  it("rejects non-objects and null", () => {
    expect(parseBoardState(null)).toBeNull();
    expect(parseBoardState("board")).toBeNull();
    expect(parseBoardState([])).toBeNull();
  });

  it("rejects missing or extra columns", () => {
    expect(parseBoardState({ backlog: [], done: [] })).toBeNull();
    expect(parseBoardState({ ...board(), extra: [] })).toBeNull();
  });

  it("rejects a column over the card cap", () => {
    const cards = Array.from(
      { length: BOARD_LIMITS.cardsPerColumn + 1 },
      (_, i) => card({ id: `card-${i}` }),
    );
    expect(parseBoardState(board(cards))).toBeNull();
  });

  it("accepts a column exactly at the card cap", () => {
    const cards = Array.from({ length: BOARD_LIMITS.cardsPerColumn }, (_, i) =>
      card({ id: `card-${i}` }),
    );
    expect(parseBoardState(board(cards))).not.toBeNull();
  });

  it("rejects duplicate card ids across columns", () => {
    const input = {
      backlog: [card({ id: "dup" })],
      "in-progress": [card({ id: "dup", title: "Other" })],
      done: [] as BoardCard[],
    };
    expect(parseBoardState(input)).toBeNull();
  });

  it("requires a non-empty title within the cap", () => {
    expect(parseBoardState(board([card({ title: "  " })]))).toBeNull();
    expect(
      parseBoardState(
        board([card({ title: "x".repeat(BOARD_LIMITS.title + 1) })]),
      ),
    ).toBeNull();
  });

  it("trims whitespace on string fields", () => {
    const parsed = parseBoardState(
      board([card({ title: "  Ship it  ", tag: " site " })]),
    );
    expect(parsed?.backlog[0].title).toBe("Ship it");
    expect(parsed?.backlog[0].tag).toBe("site");
  });

  it("drops empty optional fields instead of keeping empty strings", () => {
    const parsed = parseBoardState(board([card({ note: "   ", url: "" })]));
    expect(parsed?.backlog[0]).not.toHaveProperty("note");
    expect(parsed?.backlog[0]).not.toHaveProperty("url");
  });

  it("rejects non-http(s) URLs", () => {
    expect(
      parseBoardState(board([card({ url: "javascript:alert(1)" })])),
    ).toBeNull();
    expect(parseBoardState(board([card({ url: "ftp://x.dev" })]))).toBeNull();
    expect(parseBoardState(board([card({ url: "not a url" })]))).toBeNull();
  });

  it("round-trips progress and treats it as optional", () => {
    expect(
      parseBoardState(board([card({ progress: 0 })]))?.backlog[0].progress,
    ).toBe(0);
    expect(
      parseBoardState(board([card({ progress: BOARD_LIMITS.progress })]))
        ?.backlog[0].progress,
    ).toBe(BOARD_LIMITS.progress);
    expect(parseBoardState(board([card()]))?.backlog[0]).not.toHaveProperty(
      "progress",
    );
  });

  it("rejects out-of-range, fractional, and non-numeric progress", () => {
    expect(parseBoardState(board([card({ progress: -1 })]))).toBeNull();
    expect(
      parseBoardState(board([card({ progress: BOARD_LIMITS.progress + 1 })])),
    ).toBeNull();
    expect(parseBoardState(board([card({ progress: 12.5 })]))).toBeNull();
    expect(
      parseBoardState(board([card({ progress: "50" as unknown as number })])),
    ).toBeNull();
    expect(
      parseBoardState(board([card({ progress: null as unknown as number })])),
    ).toBeNull();
  });

  it("rejects an invalid updatedAt", () => {
    expect(
      parseBoardState(board([card({ updatedAt: "yesterday-ish" })])),
    ).toBeNull();
  });

  it("rejects over-length note, tag, and url", () => {
    expect(
      parseBoardState(
        board([card({ note: "x".repeat(BOARD_LIMITS.note + 1) })]),
      ),
    ).toBeNull();
    expect(
      parseBoardState(board([card({ tag: "x".repeat(BOARD_LIMITS.tag + 1) })])),
    ).toBeNull();
    expect(
      parseBoardState(
        board([card({ url: `https://x.dev/${"y".repeat(BOARD_LIMITS.url)}` })]),
      ),
    ).toBeNull();
  });
});

describe("isSafeUrl", () => {
  it("allows http and https only", () => {
    expect(isSafeUrl("https://krishnapaulraj.com")).toBe(true);
    expect(isSafeUrl("http://localhost:3000")).toBe(true);
    expect(isSafeUrl("mailto:hi@x.dev")).toBe(false);
    expect(isSafeUrl("")).toBe(false);
  });
});
