"use client";

import { formatDistanceToNow } from "date-fns";
import {
  AlignLeftIcon,
  ExternalLinkIcon,
  ListChecksIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { BOARD_COLUMNS, BOARD_LIMITS, isSafeUrl } from "@/lib/board";
import { cn } from "@/lib/utils";
import type { BoardCard, BoardColumnId } from "@/types";

import { CardComments } from "./card-comments";
import { MarkdownEditor } from "./markdown-editor";

const FIELD_CLASS =
  "border-border bg-background placeholder:text-muted-foreground focus:border-foreground/30 w-full rounded-lg border px-3 py-2 text-sm outline-none";

export type CardFields = {
  title: string;
  note?: string;
  tag?: string;
  url?: string;
  /** undefined clears the bar — the card stops tracking progress. */
  progress?: number;
};

type CardViewerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = composing a new card. */
  card: BoardCard | null;
  columnId: BoardColumnId;
  /** The owner is unlocked: sections gain Edit controls. */
  editable: boolean;
  /** Owner key, forwarded to the comments pane for moderation. */
  editKey: string | null;
  /**
   * Sections save independently, so an existing card receives only the fields
   * that section owns; a new card always arrives with the full set (and a
   * title). An explicitly-undefined key clears that field.
   */
  onSave: (fields: Partial<CardFields>) => void;
  onDelete: () => void;
  onMove: (to: BoardColumnId) => void;
  onCommentCountChange?: (cardId: string, count: number) => void;
};

export function CardViewer(props: CardViewerProps) {
  const { open, onOpenChange, card } = props;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        {/* Keyed so every draft and open editor resets when a different card
            (or "new") takes over the dialog. */}
        <CardViewerBody key={card?.id ?? "new"} {...props} />
      </DialogContent>
    </Dialog>
  );
}

function Section({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 first:mt-0">
      <div className="flex min-h-8 items-center gap-2">
        <Icon aria-hidden className="text-muted-foreground size-4 shrink-0" />
        <h3 className="text-sm font-semibold">{title}</h3>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      <div className="mt-2 pl-6">{children}</div>
    </section>
  );
}

function CardViewerBody({
  card,
  columnId,
  editable,
  editKey,
  onSave,
  onDelete,
  onMove,
  onCommentCountChange,
}: CardViewerProps) {
  const isNew = card === null;

  const [title, setTitle] = useState(card?.title ?? "");
  const [note, setNote] = useState(card?.note ?? "");
  const [tag, setTag] = useState(card?.tag ?? "");
  const [url, setUrl] = useState(card?.url ?? "");
  const [progress, setProgress] = useState<number | null>(
    card?.progress ?? null,
  );

  const [editingTitle, setEditingTitle] = useState(isNew);
  const [editingNote, setEditingNote] = useState(isNew);
  const [editingDetails, setEditingDetails] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // Errors live with the section that produced them, so a bad draft in one
  // section can neither block nor mislabel a save in another.
  const [titleError, setTitleError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const columnTitle =
    BOARD_COLUMNS.find((column) => column.id === columnId)?.title ?? "";

  /** Validated title, or null after surfacing the error in its section. */
  const cleanTitle = (): string | null => {
    const clean = title.trim();
    if (!clean) {
      setTitleError("A title is required.");
      return null;
    }
    setTitleError(null);
    return clean;
  };

  /**
   * Normalized details fields, or null after surfacing the error. Also writes
   * the normalized URL back into the draft so what saves is what's shown.
   */
  const cleanDetails = (): Pick<
    CardFields,
    "tag" | "url" | "progress"
  > | null => {
    let cleanUrl = url.trim();
    if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }
    if (cleanUrl && !isSafeUrl(cleanUrl)) {
      setDetailsError("The link must be a valid http(s) URL.");
      return null;
    }
    setDetailsError(null);
    setUrl(cleanUrl);
    return {
      tag: tag.trim() || undefined,
      url: cleanUrl || undefined,
      progress: progress ?? undefined,
    };
  };

  const saveTitle = () => {
    const clean = cleanTitle();
    if (clean === null) return;
    onSave({ title: clean });
    setEditingTitle(false);
  };

  const saveNote = () => {
    onSave({ note: note.trim() || undefined });
    setEditingNote(false);
  };

  const saveDetails = () => {
    const details = cleanDetails();
    if (details === null) return;
    onSave(details);
    setEditingDetails(false);
  };

  /** A new card commits everything at once. */
  const addCard = () => {
    const clean = cleanTitle();
    const details = cleanDetails();
    if (clean === null || details === null) return;
    onSave({ title: clean, note: note.trim() || undefined, ...details });
  };

  const resolvedUrl = card?.url;
  const tracked = typeof card?.progress === "number";

  return (
    <>
      <div className="border-border flex items-center gap-2 border-b px-4 py-2.5 pr-14">
        {editable ? (
          <>
            <label htmlFor="card-column" className="sr-only">
              Column
            </label>
            <select
              id="card-column"
              value={columnId}
              onChange={(e) => onMove(e.target.value as BoardColumnId)}
              disabled={isNew}
              className="border-border bg-muted/50 hover:bg-muted focus-visible:ring-ring rounded-md border px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
            >
              {BOARD_COLUMNS.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </>
        ) : (
          <Badge variant="outline" size="sm">
            {columnTitle}
          </Badge>
        )}
        {card && (
          <span className="text-muted-foreground ml-auto text-[10px]">
            updated{" "}
            {formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}
          </span>
        )}
      </div>

      <div
        className={cn(
          "grid min-h-0",
          !isNew && "md:grid-cols-[minmax(0,1fr)_20rem]",
        )}
      >
        <div className="min-h-0 overflow-y-auto p-4 md:p-5">
          {editingTitle ? (
            <>
              <DialogTitle className="sr-only">
                {isNew ? `New card in ${columnTitle}` : card.title}
              </DialogTitle>
              <textarea
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={BOARD_LIMITS.title}
                rows={2}
                placeholder="Card title"
                aria-label="Card title"
                className={cn(FIELD_CLASS, "resize-none text-lg font-semibold")}
              />
              {titleError && (
                <p className="text-destructive mt-1.5 text-xs">{titleError}</p>
              )}
              {!isNew && (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={saveTitle}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setTitle(card.title);
                      setEditingTitle(false);
                      setTitleError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </>
          ) : (
            <DialogTitle className="text-xl leading-tight font-bold">
              {editable ? (
                <button
                  type="button"
                  onClick={() => setEditingTitle(true)}
                  className="hover:bg-muted/60 focus-visible:ring-ring -mx-1 flex w-[calc(100%+0.5rem)] items-start gap-2 rounded px-1 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="min-w-0 flex-1">{title}</span>
                  <PencilIcon
                    aria-hidden
                    className="text-muted-foreground mt-1.5 size-3.5 shrink-0"
                  />
                  <span className="sr-only">Edit title</span>
                </button>
              ) : (
                title
              )}
            </DialogTitle>
          )}

          <DialogDescription className="sr-only">
            {isNew
              ? "Fill in the card details, then add it to the board."
              : `Card details for "${card.title}".`}
          </DialogDescription>

          <Section
            icon={AlignLeftIcon}
            title="Description"
            action={
              editable && !editingNote && !isNew ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingNote(true)}
                >
                  Edit
                </Button>
              ) : null
            }
          >
            {editingNote ? (
              <>
                <MarkdownEditor
                  value={note}
                  onChange={setNote}
                  maxLength={BOARD_LIMITS.note}
                  placeholder="Add a more detailed description — markdown supported"
                  ariaLabel="Description"
                />
                {!isNew && (
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={saveNote}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setNote(card.note ?? "");
                        setEditingNote(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            ) : note.trim() ? (
              <div className="prose prose-ncdai prose-zinc dark:prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {note}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                {editable ? "Add a description." : "No description."}
              </p>
            )}
          </Section>

          <Section
            icon={ListChecksIcon}
            title="Details"
            action={
              editable && !editingDetails && !isNew ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingDetails(true)}
                >
                  Edit
                </Button>
              ) : null
            }
          >
            {editable && (editingDetails || isNew) ? (
              <div className="flex flex-col gap-3">
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
                <div className="border-border flex items-center gap-3 rounded-lg border px-3 py-2">
                  <label
                    htmlFor="card-progress"
                    className="text-muted-foreground shrink-0 text-sm"
                  >
                    Progress
                  </label>
                  <input
                    id="card-progress"
                    type="range"
                    min={0}
                    max={BOARD_LIMITS.progress}
                    step={5}
                    value={progress ?? 0}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="accent-foreground min-w-0 flex-1"
                  />
                  <span className="w-10 shrink-0 text-right text-sm tabular-nums">
                    {progress === null ? "—" : `${progress}%`}
                  </span>
                  {/* Untracked is a distinct state from 0%, so it needs its
                      own way back. */}
                  <button
                    type="button"
                    onClick={() => setProgress(null)}
                    disabled={progress === null}
                    className="text-muted-foreground hover:text-foreground shrink-0 text-xs underline underline-offset-2 disabled:pointer-events-none disabled:opacity-0"
                  >
                    Clear
                  </button>
                </div>
                {detailsError && (
                  <p className="text-destructive text-xs">{detailsError}</p>
                )}
                {!isNew && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveDetails}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTag(card.tag ?? "");
                        setUrl(card.url ?? "");
                        setProgress(card.progress ?? null);
                        setEditingDetails(false);
                        setDetailsError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {tracked ? (
                  <div className="flex flex-col gap-1.5">
                    <Progress value={card.progress} className="h-1.5" />
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {card.progress}% complete
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Progress isn&apos;t tracked on this card.
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {card?.tag && (
                    <Badge
                      variant="outline"
                      size="sm"
                      radius="full"
                      className="font-mono"
                    >
                      {card.tag}
                    </Badge>
                  )}
                  {resolvedUrl && (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={resolvedUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        <ExternalLinkIcon aria-hidden />
                        Open link
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Section>

          {isNew ? (
            <div className="mt-6 flex justify-end">
              <Button onClick={addCard}>Add card</Button>
            </div>
          ) : (
            editable && (
              <div className="border-border mt-6 border-t pt-4">
                <Button
                  size="sm"
                  variant={confirmingDelete ? "destructive" : "outline"}
                  onClick={() => {
                    if (confirmingDelete) onDelete();
                    else setConfirmingDelete(true);
                  }}
                >
                  <Trash2Icon aria-hidden />
                  {confirmingDelete ? "Really delete?" : "Delete card"}
                </Button>
              </div>
            )
          )}
        </div>

        {/* A card has to exist before it can be discussed. */}
        {!isNew && (
          <aside className="bg-muted/30 border-border min-h-0 overflow-y-auto border-t p-4 md:border-t-0 md:border-l md:p-5">
            <CardComments
              cardId={card.id}
              editKey={editKey}
              onCountChange={onCommentCountChange}
            />
          </aside>
        )}
      </div>
    </>
  );
}
