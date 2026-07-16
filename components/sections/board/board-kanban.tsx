"use client";

import { PlusIcon } from "lucide-react";

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
import type { BoardCard, BoardColumnId, BoardState } from "@/types";

import { BoardCardView } from "./board-card";

type BoardKanbanProps = {
  board: BoardState;
  editable: boolean;
  onBoardChange: (board: BoardState) => void;
  onAddCard: (columnId: BoardColumnId) => void;
  onEditCard: (columnId: BoardColumnId, card: BoardCard) => void;
};

export function BoardKanban({
  board,
  editable,
  onBoardChange,
  onAddCard,
  onEditCard,
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
            className="border-border bg-muted/30 rounded-xl border p-2 opacity-100"
          >
            <div className="flex items-center justify-between gap-2 px-1 pt-0.5 pb-2">
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm font-medium">{column.title}</h2>
                <span className="text-muted-foreground font-mono text-xs">
                  {board[column.id].length}
                </span>
              </div>
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
            </div>
            <KanbanColumnContent value={column.id} className="min-h-16 gap-2">
              {board[column.id].map((card) => (
                <KanbanItem
                  key={card.id}
                  value={card.id}
                  disabled={!editable}
                  // Read-only cards are informational, not "disabled" — undo
                  // the dimming.
                  className="opacity-100"
                >
                  <BoardCardView
                    card={card}
                    editable={editable}
                    onEdit={() => onEditCard(column.id, card)}
                  />
                </KanbanItem>
              ))}
              {board[column.id].length === 0 && (
                <div className="border-border text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs">
                  {editable ? "Nothing here — add a card" : "Nothing here yet"}
                </div>
              )}
            </KanbanColumnContent>
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
