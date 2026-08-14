"use client";

import { PlusIcon } from "lucide-react";

import { Badge } from "@/components/reui/badge";
import { Frame, FrameHeader, FrameTitle } from "@/components/reui/frame";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanOverlay,
} from "@/components/reui/kanban";
import { Button } from "@/components/ui/button";
import { BOARD_COLUMNS } from "@/lib/board";
import { cn } from "@/lib/utils";
import type { BoardCard, BoardColumnId, BoardState } from "@/types";

import { BoardCardView } from "./board-card";

/**
 * The roadmap block marks each column with a coloured dot; the site is
 * monochrome, so the ramp runs on ink density instead — faint for work not
 * started, solid for work shipped.
 */
const COLUMN_ACCENT: Record<BoardColumnId, string> = {
  backlog: "bg-muted-foreground/30",
  "in-progress": "bg-muted-foreground/70",
  done: "bg-foreground",
};

type BoardKanbanProps = {
  board: BoardState;
  editable: boolean;
  /** Per-card comment totals, keyed by card id. */
  commentCounts: Record<string, number>;
  onBoardChange: (board: BoardState) => void;
  onAddCard: (columnId: BoardColumnId) => void;
  onOpenCard: (columnId: BoardColumnId, card: BoardCard) => void;
};

export function BoardKanban({
  board,
  editable,
  commentCounts,
  onBoardChange,
  onAddCard,
  onOpenCard,
}: BoardKanbanProps) {
  const findCard = (id: string): BoardCard | null => {
    for (const column of BOARD_COLUMNS) {
      const match = board[column.id].find((card) => card.id === id);
      if (match) return match;
    }
    return null;
  };

  return (
    <Kanban
      value={board}
      onValueChange={(value) => onBoardChange(value as BoardState)}
      getItemValue={(card: BoardCard) => card.id}
      // Escape mid-drag puts the card back where it started instead of
      // leaving (and then persisting) the half-finished reshuffle.
      restoreOnCancel
    >
      {/* Neutralize the component's sm 3-col default: single column until md. */}
      <KanbanBoard className="gap-3 sm:grid-cols-1 md:grid-cols-3">
        {BOARD_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            value={column.id}
            // Columns are fixed — disable column dragging; opacity-100 undoes
            // the component's disabled dimming (disabled here means "pinned").
            disabled
            className="opacity-100"
          >
            <Frame spacing="sm" className="h-full">
              <FrameHeader className="flex flex-row items-center gap-2">
                <div
                  aria-hidden
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    COLUMN_ACCENT[column.id],
                  )}
                />
                <FrameTitle>
                  <h2>{column.title}</h2>
                </FrameTitle>
                <Badge
                  variant="outline"
                  size="sm"
                  className="ml-auto tabular-nums"
                >
                  {board[column.id].length}
                </Badge>
                {editable && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Add card to ${column.title}`}
                    onClick={() => onAddCard(column.id)}
                  >
                    <PlusIcon />
                  </Button>
                )}
              </FrameHeader>
              {/* grow so the whole column below the header is a drop target. */}
              <KanbanColumnContent
                value={column.id}
                className="min-h-16 grow gap-2 p-0.5"
              >
                {board[column.id].map((card) => (
                  <KanbanItem
                    key={card.id}
                    value={card.id}
                    disabled={!editable}
                    // Read-only items can't be dragged, so dnd-kit's
                    // role="button" + tab stop would only add noise around
                    // the real "Open" control inside. Editable items keep
                    // them — keyboard dragging depends on both.
                    {...(!editable ? { role: undefined, tabIndex: -1 } : {})}
                    // opacity-100: read-only cards are informational, not
                    // "disabled" — undo the component's dimming. While this
                    // card is being dragged, its in-list instance marks the
                    // landing position: hide the content and render a faint
                    // dashed slot of the same size instead.
                    className={cn(
                      "opacity-100",
                      "data-[dragging=true]:border-border data-[dragging=true]:bg-muted/40 data-[dragging=true]:rounded-xl data-[dragging=true]:border data-[dragging=true]:border-dashed",
                      "data-[dragging=true]:*:invisible",
                    )}
                  >
                    <BoardCardView
                      card={card}
                      editable={editable}
                      commentCount={commentCounts[card.id] ?? 0}
                      onOpen={() => onOpenCard(column.id, card)}
                    />
                  </KanbanItem>
                ))}
                {board[column.id].length === 0 && (
                  <div className="border-border text-muted-foreground rounded-xl border border-dashed p-4 text-center text-xs">
                    {editable
                      ? "Nothing here — add a card"
                      : "Nothing here yet"}
                  </div>
                )}
              </KanbanColumnContent>
            </Frame>
          </KanbanColumn>
        ))}
      </KanbanBoard>
      <KanbanOverlay>
        {({ value }) => {
          const card = findCard(String(value));
          return card ? (
            <BoardCardView card={card} editable={false} overlay />
          ) : null;
        }}
      </KanbanOverlay>
    </Kanban>
  );
}
