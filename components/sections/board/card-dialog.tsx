"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BOARD_LIMITS, isSafeUrl } from "@/lib/board";
import type { BoardCard } from "@/types";

import { MarkdownEditor } from "./markdown-editor";

const FIELD_CLASS =
  "border-border bg-background placeholder:text-muted-foreground focus:border-foreground/30 w-full rounded-lg border px-3 py-2 text-sm outline-none";

export type CardFields = {
  title: string;
  note?: string;
  tag?: string;
  url?: string;
};

type CardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = creating a new card. */
  card: BoardCard | null;
  columnTitle: string;
  onSave: (fields: CardFields) => void;
  onDelete: () => void;
};

export function CardDialog({
  open,
  onOpenChange,
  card,
  columnTitle,
  onSave,
  onDelete,
}: CardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Keyed so field state resets whenever a different card (or "new") opens. */}
        <CardForm
          key={card?.id ?? "new"}
          card={card}
          columnTitle={columnTitle}
          onSave={onSave}
          onDelete={onDelete}
        />
      </DialogContent>
    </Dialog>
  );
}

function CardForm({
  card,
  columnTitle,
  onSave,
  onDelete,
}: Pick<CardDialogProps, "card" | "columnTitle" | "onSave" | "onDelete">) {
  const [title, setTitle] = useState(card?.title ?? "");
  const [note, setNote] = useState(card?.note ?? "");
  const [tag, setTag] = useState(card?.tag ?? "");
  const [url, setUrl] = useState(card?.url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (event) => {
    event.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("A title is required.");
      return;
    }

    let cleanUrl = url.trim();
    if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }
    if (cleanUrl && !isSafeUrl(cleanUrl)) {
      setError("The link must be a valid http(s) URL.");
      return;
    }

    onSave({
      title: cleanTitle,
      note: note.trim() || undefined,
      tag: tag.trim() || undefined,
      url: cleanUrl || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {card ? "Edit card" : `New card — ${columnTitle}`}
        </DialogTitle>
        <DialogDescription>
          {card
            ? "Update the details, or delete the card."
            : "Only you can see the editing controls; the board itself is public."}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 flex flex-col gap-3">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={BOARD_LIMITS.title}
          placeholder="Title"
          aria-label="Title"
          className={FIELD_CLASS}
        />
        <MarkdownEditor
          value={note}
          onChange={setNote}
          maxLength={BOARD_LIMITS.note}
          placeholder="Description (optional) — markdown supported"
          ariaLabel="Description"
        />
        <div className="flex gap-3">
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            maxLength={BOARD_LIMITS.tag}
            placeholder="Tag (optional)"
            aria-label="Tag"
            className={`${FIELD_CLASS} flex-1`}
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            maxLength={BOARD_LIMITS.url}
            placeholder="Link (optional)"
            aria-label="Link"
            inputMode="url"
            className={`${FIELD_CLASS} flex-[2]`}
          />
        </div>
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>

      <DialogFooter className="mt-5">
        {card && (
          <Button
            type="button"
            variant={confirmingDelete ? "destructive" : "outline"}
            onClick={() => {
              if (confirmingDelete) {
                onDelete();
              } else {
                setConfirmingDelete(true);
              }
            }}
            className="mr-auto"
          >
            {confirmingDelete ? "Really delete?" : "Delete"}
          </Button>
        )}
        <Button type="submit">{card ? "Save" : "Add card"}</Button>
      </DialogFooter>
    </form>
  );
}
