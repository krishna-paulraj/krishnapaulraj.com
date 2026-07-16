"use client";

import { LockIcon, LockOpenIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { parseBoardState } from "@/lib/board";
import type { BoardCard, BoardColumnId, BoardState } from "@/types";
import { BOARD_COLUMNS } from "@/lib/board";

import { BoardKanban } from "./board-kanban";
import { CardDialog, type CardFields } from "./card-dialog";
import { UnlockDialog } from "./unlock-dialog";

const STORAGE_KEY = "board:key";
const SAVE_DEBOUNCE_MS = 800;

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; board: BoardState };

type SaveState = "idle" | "saving" | "saved" | "failed";

type DialogState = { columnId: BoardColumnId; card: BoardCard | null } | null;

export function BoardSection() {
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [dialog, setDialog] = useState<DialogState>(null);
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
        const data = (await res.json()) as { board?: unknown };
        const board = parseBoardState(data?.board);
        if (!board) throw new Error("Malformed board payload");
        setLoad({ status: "loaded", board });
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

  const handleSaveCard = (fields: CardFields) => {
    if (load.status !== "loaded" || !dialog) return;
    const { columnId, card } = dialog;
    const now = new Date().toISOString();
    const column = card
      ? load.board[columnId].map((existing) =>
          existing.id === card.id
            ? { ...existing, ...fields, updatedAt: now }
            : existing,
        )
      : [
          ...load.board[columnId],
          { id: crypto.randomUUID(), updatedAt: now, ...fields },
        ];
    applyChange({ ...load.board, [columnId]: column });
    setDialog(null);
  };

  const handleDeleteCard = () => {
    if (load.status !== "loaded" || !dialog?.card) return;
    const { columnId, card } = dialog;
    applyChange({
      ...load.board,
      [columnId]: load.board[columnId].filter((c) => c.id !== card.id),
    });
    setDialog(null);
  };

  const editable = editMode && editKey !== null;
  const dialogColumnTitle = dialog
    ? (BOARD_COLUMNS.find((c) => c.id === dialog.columnId)?.title ?? "")
    : "";

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
            <div
              key={column.id}
              className="border-border bg-muted/30 rounded-xl border p-2"
            >
              <div className="bg-muted mx-1 mt-1 h-4 w-20 animate-pulse rounded" />
              <div className="mt-3 flex flex-col gap-2">
                <div className="bg-muted h-16 animate-pulse rounded-lg" />
                <div className="bg-muted h-16 animate-pulse rounded-lg" />
              </div>
            </div>
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
            onBoardChange={applyChange}
            onAddCard={(columnId) => setDialog({ columnId, card: null })}
            onEditCard={(columnId, card) => setDialog({ columnId, card })}
          />
        </div>
      )}

      <UnlockDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        onUnlocked={handleUnlocked}
      />
      <CardDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        card={dialog?.card ?? null}
        columnTitle={dialogColumnTitle}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />
    </div>
  );
}
