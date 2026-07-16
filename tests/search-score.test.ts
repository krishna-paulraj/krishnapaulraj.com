import { describe, expect, it } from "vitest";

import { scoreItem, type SearchItem } from "@/lib/search-score";

const item = (title: string): SearchItem => ({
  id: title,
  title,
  href: "/",
  kind: "page",
});

describe("scoreItem", () => {
  it("returns 1 for an empty query (matches everything)", () => {
    expect(scoreItem(item("Anything"), "")).toBe(1);
  });

  it("returns 0 for a non-match", () => {
    expect(scoreItem(item("Writing"), "zzz")).toBe(0);
  });

  it("ranks exact > prefix > substring", () => {
    const exact = scoreItem(item("blog"), "blog");
    const prefix = scoreItem(item("blogging"), "blog");
    const substring = scoreItem(item("my blog"), "blog");
    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(substring);
  });

  it("keeps sparse subsequence matches positive (regression: negative score)", () => {
    // A long haystack with a scattered match used to score negative and get
    // filtered out as a non-match.
    const noisy = `x${"-".repeat(150)}y${"-".repeat(150)}z`;
    expect(scoreItem(item(noisy), "xyz")).toBeGreaterThan(0);
  });
});
