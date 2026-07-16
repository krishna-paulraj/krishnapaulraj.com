import { type RefObject, useEffect, useState } from "react";

interface PathStrokeMetrics {
  pathD: string | null;
  pathLength: number;
}

const EMPTY_METRICS: PathStrokeMetrics = { pathD: null, pathLength: 0 };

/**
 * Reads the rendered `<path>`'s `d` and total length into state after commit.
 *
 * Re-measures whenever any of the inputs that drive the rendered path
 * geometry change identity: `renderData`, the x/y scales (new identities on
 * domain or range changes), and the curve factory. Identity — not a
 * stringified summary like `${renderData.length}:${innerWidth}` — is required
 * here: a same-length in-place replacement of `renderData` would keep the
 * summary identical, so the effect would never re-fire and `pathD` /
 * `pathLength` would stay frozen on the previous geometry.
 */
export function usePathStrokeMetrics(
  pathRef: RefObject<SVGPathElement | null>,
  renderData: readonly unknown[],
  xScale: unknown,
  yScale: unknown,
  curve: unknown,
): PathStrokeMetrics {
  const [metrics, setMetrics] = useState<PathStrokeMetrics>(EMPTY_METRICS);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) {
      return;
    }
    const d = path.getAttribute("d");
    const len = d ? path.getTotalLength() : 0;
    setMetrics((prev) =>
      prev.pathD === d && prev.pathLength === len
        ? prev
        : { pathD: d, pathLength: len },
    );
  }, [pathRef, renderData, xScale, yScale, curve]);

  return metrics;
}

export function resolveDashTailBounds(
  dashFromIndex: number | undefined,
  dataLength: number,
): boolean {
  return (
    dashFromIndex != null &&
    dashFromIndex >= 0 &&
    dashFromIndex < dataLength - 1
  );
}

export function resolveDashStartX(
  data: Record<string, unknown>[],
  dashFromIndex: number,
  xScale: (value: Date | number) => number | undefined,
  xAccessor: (datum: Record<string, unknown>) => Date | number,
): number {
  const dashFromPoint = data[dashFromIndex];
  if (!dashFromPoint) {
    return 0;
  }
  return xScale(xAccessor(dashFromPoint)) ?? 0;
}
