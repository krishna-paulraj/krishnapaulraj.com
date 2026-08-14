"use client";

import { LockIcon, LockOpenIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Frame, FrameHeader } from "@/components/reui/frame";
import { Button } from "@/components/ui/button";
import { parseBoardState } from "@/lib/board";
import type { BoardCard, BoardColumnId, BoardState } from "@/types";
import { BOARD_COLUMNS } from "@/lib/board";

import { BoardKanban } from "./board-kanban";
import { CardViewer, type CardFields } from "./card-viewer";
import { UnlockDialog } from "./unlock-dialog";

const STORAGE_KEY = "board:key";
const SAVE_DEBOUNCE_MS = 800;

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; board: BoardState };

type SaveState = "idle" | "saving" | "saved" | "failed";

/**
 * cardId null = composing a new card in that column. `snapshot` is the card as
 * it looked when opened (refreshed on moves): the live board is the source of
 * truth while the viewer is open, and the snapshot only renders the dialog's
 * close animation after a delete removes the live row.
 */
type DialogState = {
  columnId: BoardColumnId;
  cardId: string | null;
  snapshot: BoardCard | null;
} | null;

export function BoardSection() {
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  // Open flag and content are separate on purpose: closing only flips the
  // flag, so the card keeps rendering while the dialog animates out instead
  // of flashing the blank "new card" composer.
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);

  const keyRef = useRef<string | null>(null);
  const pendingRef = useRef<BoardState | null>(null);
  const timerRef = useRef<number | null>(null);

  // Callers that re-trigger a fetch (Retry) reset to "loading" in their event
  // handler; the initial state already covers the first run.
  const fetchBoard = useCallback((signal?: AbortSignal) => {
    return fetch("/api/board", { signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Board request failed: ${res.status}`);
        const data = (await res.json()) as {
          board?: unknown;
          commentCounts?: Record<string, number>;
        };
        const board = parseBoardState(data?.board);
        if (!board) throw new Error("Malformed board payload");
        setLoad({ status: "loaded", board });
        setCommentCounts(data.commentCounts ?? {});
      })
      .catch(() => {
        if (!signal?.aborted) setLoad({ status: "error" });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchBoard(controller.signal);
    return () => controller.abort();
  }, [fetchBoard]);

  // Silently revalidate a stored key so the owner lands unlocked. A network
  // hiccup keeps the key for next time; only an explicit 401 discards it.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    let cancelled = false;
    fetch("/api/board/auth", {
      method: "POST",
      headers: { "x-board-key": stored },
    })
      .then((res) => {
        if (cancelled) return;
        if (res.status === 204) {
          keyRef.current = stored;
          setEditKey(stored);
          setEditMode(true);
        } else if (res.status === 401) {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const flush = useCallback(async () => {
    const body = pendingRef.current;
    const key = keyRef.current;
    if (!body || !key) return;
    try {
      const res = await fetch("/api/board", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-board-key": key,
        },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        window.localStorage.removeItem(STORAGE_KEY);
        keyRef.current = null;
        setEditKey(null);
        setEditMode(false);
        setSaveState("idle");
        toast.error("Edit session expired — unlock again to keep editing.");
        return;
      }
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      // Only settle if no newer edit superseded this payload meanwhile.
      if (pendingRef.current === body) {
        pendingRef.current = null;
        setSaveState("saved");
      }
    } catch {
      setSaveState("failed");
      toast.error("Couldn't save the board.");
    }
  }, []);

  const applyChange = useCallback(
    (next: BoardState) => {
      setLoad({ status: "loaded", board: next });
      pendingRef.current = next;
      setSaveState("saving");
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        void flush();
      }, SAVE_DEBOUNCE_MS);
    },
    [flush],
  );

  const handleUnlocked = (key: string) => {
    window.localStorage.setItem(STORAGE_KEY, key);
    keyRef.current = key;
    setEditKey(key);
    setEditMode(true);
    setUnlockOpen(false);
    toast.success("Edit mode unlocked.");
  };

  const handleCommentCountChange = useCallback(
    (cardId: string, count: number) => {
      setCommentCounts((previous) => ({ ...previous, [cardId]: count }));
    },
    [],
  );

  // The live board wins while the card exists, so section-by-section saves
  // are reflected straight away; the snapshot covers the post-delete close.
  const liveCard =
    load.status === "loaded" && dialog?.cardId
      ? (load.board[dialog.columnId].find((c) => c.id === dialog.cardId) ??
        null)
      : null;
  const shownCard = dialog?.cardId ? (liveCard ?? dialog.snapshot) : null;

  const handleSaveCard = (fields: Partial<CardFields>) => {
    if (load.status !== "loaded" || !dialog) return;
    const { columnId, cardId } = dialog;
    const now = new Date().toISOString();

    if (cardId) {
      // Sections send only the fields they own; spreading the partial keeps
      // every other field exactly as saved. An explicitly-undefined key
      // clears its field (it drops out at JSON serialization).
      applyChange({
        ...load.board,
        [columnId]: load.board[columnId].map((existing) =>
          existing.id === cardId
            ? { ...existing, ...fields, updatedAt: now }
            : existing,
        ),
      });
      return;
    }

    // The viewer always includes a validated title when adding a card.
    if (!fields.title) return;
    applyChange({
      ...load.board,
      [columnId]: [
        ...load.board[columnId],
        {
          id: crypto.randomUUID(),
          updatedAt: now,
          ...fields,
          title: fields.title,
        },
      ],
    });
    setDialogOpen(false);
  };

  const handleDeleteCard = () => {
    if (load.status !== "loaded" || !dialog?.cardId) return;
    const { columnId, cardId } = dialog;
    applyChange({
      ...load.board,
      [columnId]: load.board[columnId].filter((c) => c.id !== cardId),
    });
    setDialogOpen(false);
  };

  const handleMoveCard = (to: BoardColumnId) => {
    if (load.status !== "loaded" || !dialog || !liveCard) return;
    const from = dialog.columnId;
    if (from === to) return;
    applyChange({
      ...load.board,
      [from]: load.board[from].filter((c) => c.id !== liveCard.id),
      [to]: [...load.board[to], liveCard],
    });
    setDialog({ columnId: to, cardId: liveCard.id, snapshot: liveCard });
  };

  const editable = editMode && editKey !== null;

  return (
    <div>
      <div className="flex min-h-8 items-center justify-end gap-2">
        {editable && (
          <span aria-live="polite" className="text-muted-foreground text-xs">
            {saveState === "saving" && "Saving…"}
            {saveState === "saved" && "Saved"}
            {saveState === "failed" && (
              <>
                Save failed{" "}
                <button
                  type="button"
                  onClick={() => void flush()}
                  className="text-foreground underline underline-offset-2"
                >
                  Retry
                </button>
              </>
            )}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={editable ? "Lock the board" : "Unlock editing"}
          onClick={() => {
            if (editable) {
              setEditMode(false);
            } else if (editKey) {
              setEditMode(true);
            } else {
              setUnlockOpen(true);
            }
          }}
        >
          {editable ? <LockOpenIcon /> : <LockIcon />}
        </Button>
      </div>

      {load.status === "loading" && (
        <div className="mt-2 grid gap-3 md:grid-cols-3">
          {BOARD_COLUMNS.map((column) => (
            <Frame key={column.id} spacing="sm">
              <FrameHeader className="flex flex-row items-center gap-2">
                <div className="bg-muted size-2 rounded-full" />
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              </FrameHeader>
              <div className="flex flex-col gap-2 p-0.5">
                <div className="bg-card border-border h-24 animate-pulse rounded-xl border" />
                <div className="bg-card border-border h-24 animate-pulse rounded-xl border" />
              </div>
            </Frame>
          ))}
        </div>
      )}

      {load.status === "error" && (
        <div className="border-border mt-2 grid min-h-56 place-content-center rounded-xl border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Couldn&apos;t load the board.
          </p>
          <Button
            variant="outline"
            className="mx-auto mt-3"
            onClick={() => {
              setLoad({ status: "loading" });
              void fetchBoard();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {load.status === "loaded" && (
        <div className="mt-2">
          <BoardKanban
            board={load.board}
            editable={editable}
            commentCounts={commentCounts}
            onBoardChange={applyChange}
            onAddCard={(columnId) => {
              setDialog({ columnId, cardId: null, snapshot: null });
              setDialogOpen(true);
            }}
            onOpenCard={(columnId, card) => {
              setDialog({ columnId, cardId: card.id, snapshot: card });
              setDialogOpen(true);
            }}
          />
        </div>
      )}

      <UnlockDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        onUnlocked={handleUnlocked}
      />
      <CardViewer
        open={dialogOpen && dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialogOpen(false);
        }}
        card={shownCard}
        columnId={dialog?.columnId ?? BOARD_COLUMNS[0].id}
        editable={editable}
        editKey={editable ? editKey : null}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        onMove={handleMoveCard}
        onCommentCountChange={handleCommentCountChange}
      />
    </div>
  );
}
