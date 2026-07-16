"use client";

import { format, parseISO } from "date-fns";
import { useState, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import type { Activity } from "@/components/sections/contribution-graph";
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
} from "@/components/sections/contribution-graph";

// Shared geometry so the skeleton, the empty/error notice, and the real graph
// all reserve exactly the same space (no layout shift when swapping).
const BLOCK_SIZE = 11;
const BLOCK_MARGIN = 3;
const WEEKS = 53;
const DAYS = 7;
const LABEL_HEIGHT = 22;
const GRAPH_WIDTH = WEEKS * (BLOCK_SIZE + BLOCK_MARGIN) - BLOCK_MARGIN;
const GRAPH_HEIGHT =
  LABEL_HEIGHT + (BLOCK_SIZE + BLOCK_MARGIN) * DAYS - BLOCK_MARGIN;

type TooltipState = {
  label: string;
  /** Viewport coordinates of the hovered cell's top-center. */
  x: number;
  y: number;
};

export function GitHubContributions({
  data,
  className,
}: {
  data: Activity[];
  className?: string;
}) {
  // One shared tooltip for the whole grid instead of ~371 Radix tooltip
  // roots (one per day cell). Pointer events on the calendar container read
  // the hovered cell's data-* attributes and position a single floating
  // element; screen readers get a summary via aria-label instead.
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const totalCount = data.reduce((sum, activity) => sum + activity.count, 0);

  const handlePointerOver = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target;
    const cell =
      target instanceof Element ? target.closest("rect[data-date]") : null;

    if (!cell) {
      setTooltip(null);
      return;
    }

    const date = cell.getAttribute("data-date");
    if (!date) {
      setTooltip(null);
      return;
    }

    const count = Number(cell.getAttribute("data-count")) || 0;
    const rect = cell.getBoundingClientRect();

    setTooltip({
      label: `${count} contribution${count === 1 ? "" : "s"} on ${format(
        // parseISO reads "YYYY-MM-DD" as local midnight; new Date() would be
        // UTC midnight and shift a day west of UTC.
        parseISO(date),
        "dd.MM.yyyy",
      )}`,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  return (
    <>
      <ContributionGraph
        className={cn("mx-auto", className)}
        data={data}
        blockSize={BLOCK_SIZE}
        blockMargin={BLOCK_MARGIN}
        blockRadius={2}
      >
        <ContributionGraphCalendar
          className="no-scrollbar"
          title="GitHub Contributions"
          role="img"
          aria-label={`GitHub contributions calendar: ${totalCount.toLocaleString()} contributions in the last year`}
          onPointerOver={handlePointerOver}
          onPointerLeave={() => setTooltip(null)}
        >
          {({ activity, dayIndex, weekIndex }) => (
            <ContributionGraphBlock
              activity={activity}
              dayIndex={dayIndex}
              weekIndex={weekIndex}
              aria-hidden="true"
            />
          )}
        </ContributionGraphCalendar>
      </ContributionGraph>

      {tooltip &&
        createPortal(
          <div
            aria-hidden="true"
            className="bg-foreground text-background pointer-events-none fixed z-50 w-fit -translate-x-1/2 -translate-y-full rounded-md px-3 py-1.5 font-sans text-xs whitespace-nowrap"
            style={{ left: tooltip.x, top: tooltip.y - 8 }}
          >
            {tooltip.label}
            <span className="bg-foreground absolute top-full left-1/2 size-2.5 -translate-x-1/2 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
          </div>,
          document.body,
        )}
    </>
  );
}

/**
 * Muted status line (error/empty) that reserves the same footprint as the
 * rendered graph, so a failed fetch doesn't collapse the ~120px block.
 */
export function GitHubContributionsNotice({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="mx-auto flex w-max max-w-full items-center justify-center"
      style={{ height: GRAPH_HEIGHT, width: GRAPH_WIDTH }}
      role="status"
    >
      <p className="text-muted-foreground text-xs">{children}</p>
    </div>
  );
}

export function GitHubContributionsFallback() {
  // Mirror the real graph's geometry so swapping in the data causes no layout shift.
  return (
    <div
      className="mx-auto flex w-max max-w-full flex-col gap-2"
      role="status"
      aria-label="Loading GitHub contributions"
    >
      <svg
        className="block animate-pulse overflow-visible"
        height={GRAPH_HEIGHT}
        viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
        width={GRAPH_WIDTH}
      >
        {Array.from({ length: WEEKS }).map((_, weekIndex) =>
          Array.from({ length: DAYS }).map((_, dayIndex) => (
            <rect
              key={`${weekIndex}-${dayIndex}`}
              className="fill-muted-foreground/15"
              height={BLOCK_SIZE}
              width={BLOCK_SIZE}
              rx={2}
              ry={2}
              x={(BLOCK_SIZE + BLOCK_MARGIN) * weekIndex}
              y={LABEL_HEIGHT + (BLOCK_SIZE + BLOCK_MARGIN) * dayIndex}
            />
          )),
        )}
      </svg>
    </div>
  );
}
