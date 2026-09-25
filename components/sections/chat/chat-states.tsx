"use client";

import { MessageCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ChatEmpty({ name }: { name?: string | null }) {
  // No time-of-day greeting: reading the clock during render is impure and
  // would differ between the server and client pass.
  return (
    <Empty className="my-auto">
      <EmptyHeader>
        <EmptyMedia>
          <MessageCircleIcon className="text-muted-foreground size-8" />
        </EmptyMedia>
        <EmptyTitle>Hey{name ? `, ${name}` : " there"}!</EmptyTitle>
        <EmptyDescription>
          What&apos;s on your mind? Press send to start a new conversation.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

/**
 * Shaped like real messages rather than generic bars, so settling in doesn't
 * shift the layout the reader is already looking at.
 */
export function ChatSkeleton() {
  const widths = ["w-2/3", "w-1/2", "w-3/5", "w-2/5"];
  return (
    <div className="flex flex-1 flex-col gap-3 px-4 py-4" aria-hidden>
      {widths.map((width, index) => (
        <Skeleton
          key={width}
          className={cn("h-9 rounded-xl", width, index % 2 && "self-end")}
        />
      ))}
    </div>
  );
}

export function ChatError({ onRetry }: { onRetry: () => void }) {
  return (
    <Empty className="my-auto">
      <EmptyHeader>
        <EmptyTitle>Couldn&apos;t load the conversation</EmptyTitle>
        <EmptyDescription>
          The connection dropped somewhere along the way.
        </EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </Empty>
  );
}
