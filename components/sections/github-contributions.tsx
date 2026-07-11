"use client";

import { format } from "date-fns";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Activity } from "@/components/sections/contribution-graph";
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
} from "@/components/sections/contribution-graph";

export function GitHubContributions({
  data,
  className,
}: {
  data: Activity[];
  className?: string;
}) {
  return (
    <ContributionGraph
      className={cn("mx-auto", className)}
      data={data}
      blockSize={11}
      blockMargin={3}
      blockRadius={2}
    >
      <ContributionGraphCalendar
        className="no-scrollbar"
        title="GitHub Contributions"
      >
        {({ activity, dayIndex, weekIndex }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <g>
                <ContributionGraphBlock
                  activity={activity}
                  dayIndex={dayIndex}
                  weekIndex={weekIndex}
                />
              </g>
            </TooltipTrigger>
            <TooltipContent className="font-sans">
              <p>
                {activity.count} contribution{activity.count > 1 ? "s" : null}{" "}
                on {format(new Date(activity.date), "dd.MM.yyyy")}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </ContributionGraphCalendar>
    </ContributionGraph>
  );
}

export function GitHubContributionsFallback() {
  // Mirror the real graph's geometry so swapping in the data causes no layout shift.
  const blockSize = 11;
  const blockMargin = 3;
  const weeks = 53;
  const days = 7;
  const labelHeight = 22;
  const width = weeks * (blockSize + blockMargin) - blockMargin;
  const height = labelHeight + (blockSize + blockMargin) * days - blockMargin;

  return (
    <div
      className="mx-auto flex w-max max-w-full flex-col gap-2"
      role="status"
      aria-label="Loading GitHub contributions"
    >
      <svg
        className="block animate-pulse overflow-visible"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
      >
        {Array.from({ length: weeks }).map((_, weekIndex) =>
          Array.from({ length: days }).map((_, dayIndex) => (
            <rect
              key={`${weekIndex}-${dayIndex}`}
              className="fill-muted-foreground/15"
              height={blockSize}
              width={blockSize}
              rx={2}
              ry={2}
              x={(blockSize + blockMargin) * weekIndex}
              y={labelHeight + (blockSize + blockMargin) * dayIndex}
            />
          )),
        )}
      </svg>
    </div>
  );
}
