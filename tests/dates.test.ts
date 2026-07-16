import { describe, expect, it } from "vitest";

import { dateSortValue, formatPostDate } from "@/lib/dates";

describe("formatPostDate", () => {
  it("renders a date-only string as the same calendar day in any timezone", () => {
    // Pinned to UTC internally, so this holds regardless of TZ env.
    expect(formatPostDate("2026-05-20")).toBe("May 20, 2026");
  });

  it("supports custom Intl options", () => {
    expect(
      formatPostDate("2026-05-20", { month: "long", year: "numeric" }),
    ).toBe("May 2026");
  });

  it("returns the raw value for unparseable input", () => {
    expect(formatPostDate("not-a-date")).toBe("not-a-date");
  });
});

describe("dateSortValue", () => {
  it("orders ISO dates chronologically", () => {
    expect(dateSortValue("2026-05-20")).toBeGreaterThan(
      dateSortValue("2025-09-07"),
    );
  });

  it("sorts empty/invalid dates last (as 0)", () => {
    expect(dateSortValue("")).toBe(0);
    expect(dateSortValue("nope")).toBe(0);
  });
});
