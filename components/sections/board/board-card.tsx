"use client";

import { formatDistanceToNow } from "date-fns";
import { ExternalLinkIcon, GripVerticalIcon } from "lucide-react";

import { KanbanItemHandle } from "@/components/reui/kanban";
import { cn } from "@/lib/utils";
import type { BoardCard } from "@/types";

const SHELL_CLASS =
  "border-border bg-card rounded-lg border p-3 shadow-xs transition-shadow";

function CardBody({ card }: { card: BoardCard }) {
  return (
    <>
      <p className="text-foreground text-sm font-medium">{card.title}</p>
      {card.note && (
        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
          {card.note}
        </p>
      )}
      <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
        {card.tag && (
          <span className="border-border bg-background rounded-full border px-2 py-0.5 font-mono">
            {card.tag}
          </span>
        )}
        <span title={new Date(card.updatedAt).toLocaleString()}>
          {formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}
        </span>
        {card.url && <ExternalLinkIcon aria-hidden className="size-3" />}
      </div>
    </>
  );
}

type BoardCardViewProps = {
  card: BoardCard;
  editable: boolean;
  onEdit?: () => void;
  /** Rendering inside the drag overlay — static, slightly elevated. */
  overlay?: boolean;
};

export function BoardCardView({
  card,
  editable,
  onEdit,
  overlay = false,
}: BoardCardViewProps) {
  if (overlay) {
    return (
      <div className={cn(SHELL_CLASS, "shadow-md")}>
        <CardBody card={card} />
      </div>
    );
  }

  if (!editable) {
    if (card.url) {
      return (
        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className={cn(
            SHELL_CLASS,
            "hover:bg-muted/40 block transition-colors",
          )}
        >
          <CardBody card={card} />
        </a>
      );
    }
    return (
      <div className={SHELL_CLASS}>
        <CardBody card={card} />
      </div>
    );
  }

  return (
    <div className={cn(SHELL_CLASS, "flex items-start gap-1.5")}>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit "${card.title}"`}
        className="min-w-0 flex-1 text-left"
      >
        <CardBody card={card} />
      </button>
      <KanbanItemHandle asChild>
        <button
          type="button"
          aria-label={`Move "${card.title}"`}
          className="text-muted-foreground/60 hover:text-foreground focus-visible:ring-ring -mt-1 -mr-1 rounded p-1 focus-visible:ring-2 focus-visible:outline-none"
        >
          <GripVerticalIcon aria-hidden className="size-3.5" />
        </button>
      </KanbanItemHandle>
    </div>
  );
}
