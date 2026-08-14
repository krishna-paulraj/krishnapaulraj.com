"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquareIcon, Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/reui/badge";
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
import { Button } from "@/components/ui/button";
import { COMMENT_LIMITS, type BoardComment } from "@/lib/board-comments";
import { cn } from "@/lib/utils";

const NAME_STORAGE_KEY = "board:comment-name";

const FIELD_CLASS =
  "border-border bg-background placeholder:text-muted-foreground focus:border-foreground/30 w-full rounded-lg border px-3 py-2 text-sm outline-none";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; comments: BoardComment[] };

type CardCommentsProps = {
  cardId: string;
  /** Owner key, when unlocked — enables moderation and the owner badge. */
  editKey: string | null;
  /** Lets the board update its comment-count badge without a full refetch. */
  onCountChange?: (cardId: string, count: number) => void;
};

export function CardComments({
  cardId,
  editKey,
  onCountChange,
}: CardCommentsProps) {
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const settle = useCallback(
    (comments: BoardComment[]) => {
      setLoad({ status: "loaded", comments });
      onCountChange?.(cardId, comments.length);
    },
    [cardId, onCountChange],
  );

  useEffect(() => {
    // Reading localStorage has to wait for the client; seeding it as initial
    // state instead would desync the server-rendered input on hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthor(window.localStorage.getItem(NAME_STORAGE_KEY) ?? "");
  }, []);

  // No "loading" reset here: the viewer keys this pane by card id, so a
  // different card remounts it and the initial state already covers the fetch.
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/board/comments?cardId=${encodeURIComponent(cardId)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Comments request failed: ${res.status}`);
        const data = (await res.json()) as { comments?: BoardComment[] };
        // Through settle, not setLoad: the board's comment badge may be stale
        // (counts load with the board), so the fresh thread corrects it.
        settle(data.comments ?? []);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoad({ status: "error" });
      });
    return () => controller.abort();
  }, [cardId, settle]);

  const handlePost: React.ComponentProps<"form">["onSubmit"] = async (
    event,
  ) => {
    event.preventDefault();
    if (!body.trim() || posting) return;

    setPosting(true);
    try {
      const res = await fetch("/api/board/comments", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(editKey ? { "x-board-key": editKey } : {}),
        },
        body: JSON.stringify({ cardId, author, body }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        comments?: BoardComment[];
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't post that comment.");
        return;
      }
      settle(data.comments ?? []);
      setBody("");
      // Remember the name so a returning visitor doesn't retype it.
      if (author.trim()) {
        window.localStorage.setItem(NAME_STORAGE_KEY, author.trim());
      }
    } catch {
      toast.error("Couldn't post that comment.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!editKey) return;
    try {
      const res = await fetch(
        `/api/board/comments?cardId=${encodeURIComponent(cardId)}&commentId=${encodeURIComponent(commentId)}`,
        { method: "DELETE", headers: { "x-board-key": editKey } },
      );
      const data = (await res.json().catch(() => ({}))) as {
        comments?: BoardComment[];
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't delete that comment.");
        return;
      }
      settle(data.comments ?? []);
    } catch {
      toast.error("Couldn't delete that comment.");
    }
  };

  const remaining = COMMENT_LIMITS.body - body.length;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <MessageSquareIcon
          aria-hidden
          className="text-muted-foreground size-4"
        />
        <h3 className="text-sm font-semibold">Comments</h3>
        {load.status === "loaded" && load.comments.length > 0 && (
          <Badge variant="outline" size="sm" className="ml-auto tabular-nums">
            {load.comments.length}
          </Badge>
        )}
      </div>

      <form onSubmit={handlePost} className="flex flex-col gap-2">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={COMMENT_LIMITS.author}
          placeholder="Your name (optional)"
          aria-label="Your name"
          className={FIELD_CLASS}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={COMMENT_LIMITS.body}
          rows={3}
          placeholder="Write a comment…"
          aria-label="Write a comment"
          className={cn(FIELD_CLASS, "resize-none")}
        />
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={!body.trim() || posting}>
            {posting ? "Posting…" : "Save"}
          </Button>
          <span
            className={cn(
              "text-muted-foreground ml-auto text-[10px] tabular-nums",
              remaining < 50 && "text-foreground",
            )}
          >
            {remaining}
          </span>
        </div>
      </form>

      {load.status === "loading" && (
        <div className="flex flex-col gap-2" aria-hidden>
          <div className="bg-muted h-12 animate-pulse rounded-lg" />
          <div className="bg-muted h-12 animate-pulse rounded-lg" />
        </div>
      )}

      {load.status === "error" && (
        <p className="text-muted-foreground text-xs">
          Couldn&apos;t load comments.
        </p>
      )}

      {load.status === "loaded" &&
        (load.comments.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            No comments yet — start the conversation.
          </p>
        ) : (
          // Every entry is history, so every step counts as completed — the
          // indicators and connectors all render in their solid state.
          <Timeline value={load.comments.length}>
            {/* Newest first: the composer sits directly above the list. */}
            {[...load.comments].reverse().map((comment, index) => (
              <TimelineItem
                key={comment.id}
                step={index + 1}
                className="group/comment ms-6!"
              >
                <TimelineIndicator className="-left-4.5! size-3" />
                <TimelineSeparator className="-left-4.5!" />
                <TimelineHeader className="flex items-center gap-1.5">
                  <TimelineTitle className="truncate text-xs">
                    {comment.author}
                  </TimelineTitle>
                  {comment.owner && (
                    <Badge variant="secondary" size="xs" radius="full">
                      owner
                    </Badge>
                  )}
                  <TimelineDate
                    dateTime={comment.createdAt}
                    title={new Date(comment.createdAt).toLocaleString()}
                    className="mb-0 shrink-0 font-normal max-sm:h-auto!"
                  >
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </TimelineDate>
                  {editKey && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(comment.id)}
                      aria-label={`Delete comment by ${comment.author}`}
                      className="text-muted-foreground/60 hover:text-destructive focus-visible:ring-ring ml-auto shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover/comment:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <Trash2Icon aria-hidden className="size-3.5" />
                    </button>
                  )}
                </TimelineHeader>
                {/* Plain text, deliberately: an open comment box that renders
                    markdown is a link-spam vector on a public page. */}
                <TimelineContent className="break-words whitespace-pre-wrap">
                  {comment.body}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ))}
    </div>
  );
}
