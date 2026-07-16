"use client";

import { useChartStable } from "./chart-context";
import { HighlightSegment } from "./highlight-segment";
import { useHighlightSegment } from "./use-highlight-segment";

interface SeriesHighlightLayerProps {
  /** Caller already gated `showHighlight && showLine`; this just routes through. */
  enabled: boolean;
  height: number;
  /** The base stroke's path `d` (from `usePathStrokeMetrics`). */
  pathD: string | null;
  stroke: string;
  strokeWidth: number;
}

/**
 * Self-contained hover-highlight band over a series stroke.
 *
 * Owns the `useHighlightSegment` subscription (which reads both stable + hover
 * context) so the parent <Area> / <Line> can stay on the stable slice. This
 * component still re-renders on hover — that's the price of driving the
 * highlight band — but it's a tiny leaf so the cost is bounded to itself.
 */
export function SeriesHighlightLayer({
  enabled,
  height,
  pathD,
  stroke,
  strokeWidth,
}: SeriesHighlightLayerProps) {
  const { isLoaded } = useChartStable();
  const { xSpring, widthSpring, isActive } = useHighlightSegment({ enabled });
  return (
    <HighlightSegment
      height={height}
      pathD={pathD}
      stroke={stroke}
      strokeWidth={strokeWidth}
      visible={enabled && isActive && isLoaded}
      width={widthSpring}
      x={xSpring}
    />
  );
}

SeriesHighlightLayer.displayName = "SeriesHighlightLayer";

export default SeriesHighlightLayer;
