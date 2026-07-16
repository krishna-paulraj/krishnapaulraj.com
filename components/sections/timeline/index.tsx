import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/reui/timeline";
import { MILESTONES } from "@/lib/timeline";
import { cn } from "@/lib/utils";

// Left-aligned date gutter on sm+ (adapted from the ReUI c-timeline-2 block);
// below sm the date stacks above the title. The gutter (ms-40) leaves the
// date column (w-28 at -left-40) a clear 16px gap before the rail dots.
const ITEM_CLASS = "sm:group-data-[orientation=vertical]/timeline:ms-40";
const DATE_CLASS =
  "font-mono sm:group-data-[orientation=vertical]/timeline:absolute sm:group-data-[orientation=vertical]/timeline:-left-40 sm:group-data-[orientation=vertical]/timeline:w-28 sm:group-data-[orientation=vertical]/timeline:text-right";

/**
 * Server-rendered journey timeline: every past milestone renders as a
 * completed step, and the single `current` chapter renders as in-progress
 * (hollow indicator at the end of the filled rail).
 */
export function TimelineSection() {
  const completedCount = MILESTONES.filter((m) => !m.current).length;

  return (
    <Timeline value={completedCount} className="w-full">
      {MILESTONES.map((milestone, index) => (
        <TimelineItem
          key={milestone.id}
          step={index + 1}
          className={ITEM_CLASS}
        >
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineDate
              dateTime={milestone.dateTime}
              className={cn(DATE_CLASS, milestone.current && "text-foreground")}
            >
              {milestone.date}
            </TimelineDate>
            <TimelineTitle className="sm:-mt-0.5">
              {milestone.title}
            </TimelineTitle>
            <TimelineIndicator />
          </TimelineHeader>
          <TimelineContent>{milestone.description}</TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
