"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ExternalLinkIcon,
  GripVerticalIcon,
  MessageSquareIcon,
} from "lucide-react";

import { Badge } from "@/components/reui/badge";
import { Frame, FramePanel } from "@/components/reui/frame";
import { KanbanItemHandle } from "@/components/reui/kanban";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { BoardCard } from "@/types";

/** Matches the panel's own radius so the overlaid hit area clips identically. */
const OVERLAY_ACTION_CLASS =
  "focus-visible:ring-ring absolute inset-0 rounded-(--frame-panel-radius) focus-visible:ring-2 focus-visible:outline-none";

/**
 * Notes are markdown, but the card face is a compact snippet, so strip the
 * syntax to plain text — the formatted version lives in the editor's preview.
 */
function markdownSnippet(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/(\*\*|__|[*_~]+)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function CardBody({
  card,
  inset,
  commentCount,
}: {
  card: BoardCard;
  inset: boolean;
  commentCount: number;
}) {
  const tracked = typeof card.progress === "number";
  const updatedAt = new Date(card.updatedAt);

  return (
    <div className="flex flex-col gap-2.5">
      {/* inset: leave room for the drag handle parked in the top-right. */}
      <span className={cn("text-sm font-medium", inset && "pr-5")}>
        {card.title}
      </span>
      {card.note && (
        <p className="text-muted-foreground line-clamp-2 text-xs">
          {markdownSnippet(card.note)}
        </p>
      )}
      {tracked && <Progress value={card.progress} className="h-1.5" />}
      {/* justify-between with a single child falls back to start alignment,
          so untracked cards keep their meta left-aligned. */}
      <div className="text-muted-foreground flex items-center justify-between gap-2 text-[10px]">
        {tracked && (
          <span className="tabular-nums">{card.progress}% complete</span>
        )}
        <div className="flex items-center gap-1.5">
          {card.tag && (
            <Badge
              variant="outline"
              size="xs"
              radius="full"
              className="font-mono"
            >
              {card.tag}
            </Badge>
          )}
          <span title={updatedAt.toLocaleString()}>
            {formatDistanceToNow(updatedAt, { addSuffix: true })}
          </span>
          {card.url && <ExternalLinkIcon aria-hidden className="size-3" />}
          {commentCount > 0 && (
            <span
              className="flex items-center gap-0.5 tabular-nums"
              title={`${commentCount} comment${commentCount === 1 ? "" : "s"}`}
            >
              <MessageSquareIcon aria-hidden className="size-3" />
              {commentCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

type BoardCardViewProps = {
  card: BoardCard;
  editable: boolean;
  commentCount?: number;
  /** Opens the card viewer — available to visitors and the owner alike. */
  onOpen?: () => void;
  /** Rendering inside the drag overlay — static, slightly elevated. */
  overlay?: boolean;
};

export function BoardCardView({
  card,
  editable,
  commentCount = 0,
  onOpen,
  overlay = false,
}: BoardCardViewProps) {
  return (
    <Frame variant="ghost" spacing="sm" className="p-0">
      <FramePanel
        className={cn(
          "relative p-3 transition-colors",
          overlay && "shadow-md",
          !overlay && "hover:border-foreground/20",
        )}
      >
        <CardBody
          card={card}
          inset={editable && !overlay}
          commentCount={commentCount}
        />

        {/* The body holds flow content (progress bar, badges), which can't sit
            inside a button — so the primary action is an empty control layered
            over the whole panel instead. The card's own link lives inside the
            viewer, so a click always opens the card rather than leaving. */}
        {!overlay && (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Open "${card.title}"`}
            className={OVERLAY_ACTION_CLASS}
          />
        )}

        {editable && !overlay && (
          <KanbanItemHandle asChild>
            <button
              type="button"
              aria-label={`Move "${card.title}"`}
              className="text-muted-foreground/60 hover:text-foreground focus-visible:ring-ring absolute top-2 right-2 rounded p-1 focus-visible:ring-2 focus-visible:outline-none"
            >
              <GripVerticalIcon aria-hidden className="size-3.5" />
            </button>
          </KanbanItemHandle>
        )}
      </FramePanel>
    </Frame>
  );
}
