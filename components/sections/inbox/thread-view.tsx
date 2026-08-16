"use client";

import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ArrowLeftIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Composer } from "@/components/sections/chat/composer";
import { Transcript } from "@/components/sections/chat/transcript";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  displayName,
  type ChatMessage,
  type ChatPayload,
  type ChatThread,
} from "@/lib/chat";

const POLL_MS = 10_000;

export function ThreadView({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cursorRef = useRef(0);

  // Deliberately not an `async` function: every state write then sits inside a
  // promise callback, which is what lets an effect call this without writing
  // state synchronously. Same shape as the board's fetchBoard.
  const load = useCallback(
    (full: boolean) => {
      const params = new URLSearchParams({ ack: "1" });
      if (!full && cursorRef.current > 0) {
        params.set("since", String(cursorRef.current));
      }
      return fetch(`/api/chat/threads/${threadId}?${params}`).then(
        async (res) => {
          if (!res.ok) throw new Error(`thread ${res.status}`);
          const data = (await res.json()) as ChatPayload;
          if (data.thread) setThread(data.thread);
          if (data.messages.length) {
            cursorRef.current = Math.max(cursorRef.current, data.cursor);
            setMessages((prev) => {
              const byId = new Map(prev.map((m) => [m.id, m]));
              for (const message of data.messages)
                byId.set(message.id, message);
              return [...byId.values()].sort((a, b) => a.seq - b.seq);
            });
          }
        },
      );
    },
    [threadId],
  );

  // No state reset here on purpose: the page keys this component by thread id,
  // so switching conversations remounts it and the initial state is already
  // empty. Clearing it by hand would mean writing state during an effect.
  useEffect(() => {
    void load(true)
      .catch(() => toast.error("Couldn't load that conversation."))
      .finally(() => setLoading(false));
  }, [load]);

  // Same visibility rule as the widget: a backgrounded tab polls nothing.
  useEffect(() => {
    let timer: number | undefined;
    const tick = () => {
      timer = window.setTimeout(async () => {
        if (document.visibilityState === "visible") {
          await load(false).catch(() => {});
        }
        tick();
      }, POLL_MS);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [load]);

  async function reply(body: string) {
    const res = await fetch(`/api/chat/threads/${threadId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      toast.error("Couldn't send that reply.");
      return;
    }
    const data = (await res.json()) as ChatPayload;
    if (data.thread) setThread(data.thread);
    cursorRef.current = data.cursor;
    setMessages(data.messages);
  }

  async function toggleArchive() {
    if (!thread) return;
    const next = thread.status === "archived" ? "open" : "archived";
    setThread({ ...thread, status: next });
    const res = await fetch(`/api/chat/threads/${threadId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setThread(thread);
      toast.error("Couldn't update that conversation.");
      return;
    }
    toast.success(next === "archived" ? "Archived." : "Moved back to open.");
    router.refresh();
  }

  async function remove() {
    const res = await fetch(`/api/chat/threads/${threadId}`, {
      method: "DELETE",
    });
    setConfirmDelete(false);
    if (res.status !== 204) {
      toast.error("Couldn't delete that conversation.");
      return;
    }
    toast.success("Conversation deleted.");
    router.push("/inbox");
    router.refresh();
  }

  const name = thread ? displayName(thread) : "Conversation";
  const archived = thread?.status === "archived";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-border flex items-center gap-2 border-b px-4 py-3">
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Back to all conversations"
        >
          <Link href="/inbox">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          {thread?.email && (
            <a
              href={`mailto:${thread.email}`}
              className="text-muted-foreground truncate text-xs hover:underline"
            >
              {thread.email}
            </a>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleArchive}
          disabled={!thread}
          aria-label={archived ? "Move back to open" : "Archive conversation"}
        >
          {archived ? <ArchiveRestoreIcon /> : <ArchiveIcon />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setConfirmDelete(true)}
          disabled={!thread}
          aria-label="Delete conversation"
        >
          <Trash2Icon />
        </Button>
      </header>

      {loading && messages.length === 0 ? (
        <div className="flex flex-col gap-3 p-4" aria-hidden>
          {["w-2/3", "w-1/2", "w-3/5"].map((width, i) => (
            <Skeleton
              key={width}
              className={`h-9 rounded-xl ${width} ${i % 2 ? "self-end" : ""}`}
            />
          ))}
        </div>
      ) : (
        <Transcript
          messages={messages}
          // The owner is the reader here, so their replies sit on the right —
          // the mirror image of what the visitor sees in the widget.
          viewerRole="owner"
          counterpartName={name}
          visitorName={thread?.name}
          busy={loading}
        />
      )}

      <Composer onSend={reply} placeholder={`Reply to ${name}…`} />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this conversation?</DialogTitle>
            <DialogDescription>
              Every message in it goes too. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={remove}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
