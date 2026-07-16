import { describe, expect, it } from "vitest";

import { ordinalSuffix } from "@/lib/utils";

describe("ordinalSuffix", () => {
  it.each([
    [1, "st"],
    [2, "nd"],
    [3, "rd"],
    [4, "th"],
    [9, "th"],
    [11, "th"],
    [12, "th"],
    [13, "th"],
    [21, "st"],
    [22, "nd"],
    [23, "rd"],
    // Regression: everything ending 4-9 used to render "rd" (e.g. "24rd").
    [24, "th"],
    [111, "th"],
    [112, "th"],
    [113, "th"],
    [1395, "th"],
    [101, "st"],
    [0, "th"],
  ])("%i → %s", (n, suffix) => {
    expect(ordinalSuffix(n)).toBe(suffix);
  });
});
