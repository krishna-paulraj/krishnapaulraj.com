import { describe, expect, it } from "vitest";

import {
  decimateTimeSeries,
  maxRenderPointsForWidth,
} from "@/components/charts/decimate-time-series";

type Point = { t: number; v: number };

const series = (values: number[]): Point[] => values.map((v, t) => ({ t, v }));

describe("decimateTimeSeries (LTTB)", () => {
  it("returns the input untouched when maxPoints covers it", () => {
    const data = series([1, 2, 3]);
    expect(decimateTimeSeries(data, 10, ["v"])).toBe(data);
  });

  it("always keeps the first and last points and hits the target size", () => {
    const data = series(Array.from({ length: 50 }, (_, i) => i % 7));
    const out = decimateTimeSeries(data, 12, ["v"]);
    expect(out).toHaveLength(12);
    expect(out[0]).toBe(data[0]);
    expect(out.at(-1)).toBe(data.at(-1));
  });

  it("never emits duplicate points", () => {
    // Regression: the old bucket windows duplicated the final point.
    const data = series(Array.from({ length: 10 }, (_, i) => i));
    const out = decimateTimeSeries(data, 5, ["v"]);
    expect(new Set(out.map((p) => p.t)).size).toBe(out.length);
  });

  it("preserves a spike in the first bucket", () => {
    // Regression: the old windows skipped indices 1..floor(bucketSize), so a
    // leading extremum was silently dropped.
    const data = series([0, 100, ...Array.from({ length: 20 }, () => 0)]);
    const out = decimateTimeSeries(data, 5, ["v"]);
    expect(out.some((p) => p.v === 100)).toBe(true);
  });

  it("handles flat data without crashing or duplicating", () => {
    const data = series(Array.from({ length: 30 }, () => 5));
    const out = decimateTimeSeries(data, 6, ["v"]);
    expect(out).toHaveLength(6);
    expect(new Set(out.map((p) => p.t)).size).toBe(6);
  });
});

describe("maxRenderPointsForWidth", () => {
  it("floors at 64 points", () => {
    expect(maxRenderPointsForWidth(10)).toBe(64);
  });
});
