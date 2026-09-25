"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { Badge } from "@/components/reui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { displayName } from "@/lib/chat";
import type { ThreadSummary } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

type ThreadListProps = {
  threads: ThreadSummary[];
  activeId: string | null;
  loading: boolean;
};

/**
 * A list of cards, not a table. Name, snippet, time and an unread dot don't
 * form a tabular dataset, and a table cell can't cleanly hold a whole-row link.
 */
export function ThreadList({ threads, activeId, loading }: ThreadListProps) {
  const hydrated = useHydrated();

  if (loading && threads.length === 0) {
    return (
      <div className="flex flex-col gap-2 p-3" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyTitle>Nothing here</EmptyTitle>
          <EmptyDescription>
            New conversations from the site will show up in this list.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col">
      {threads.map((thread) => (
        <li key={thread.id}>
          <Link
            href={`/inbox/${thread.id}`}
            aria-current={thread.id === activeId ? "page" : undefined}
            className={cn(
              "border-border hover:bg-muted/60 flex flex-col gap-1 border-b px-4 py-3 transition-colors",
              thread.id === activeId && "bg-muted",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium">
                {displayName(thread)}
              </span>
              {/* Relative time depends on the reader's clock, so it can only
                  be computed after hydration. */}
              <span className="text-muted-foreground shrink-0 text-xs">
                {hydrated
                  ? formatDistanceToNow(new Date(thread.lastMessageAt), {
                      addSuffix: true,
                    })
                  : ""}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground truncate text-xs">
                {thread.preview || "No messages yet"}
              </span>
              {thread.unread > 0 && (
                <Badge size="sm" variant="default" radius="full">
                  {thread.unread}
                </Badge>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
