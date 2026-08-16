"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { UnlockDialog } from "@/components/sections/chat/unlock-dialog";
import { ThreadList } from "@/components/sections/inbox/thread-list";
import { Button } from "@/components/ui/button";
import type { ChatStatus } from "@/lib/chat";
import type { ThreadSummary } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

const LIST_POLL_MS = 10_000;

type InboxShellProps = {
  children: React.ReactNode;
};

/**
 * The rail plus the gate. Thread data is fetched client-side from the API
 * rather than server-rendered into the page, which keeps authorization to a
 * single enforcement point and means no HTML response ever carries a visitor's
 * email or messages.
 */
export function InboxShell({ children }: InboxShellProps) {
  // The rail lives in the layout, so the open thread's id comes from the
  // segment below it rather than from a prop.
  const activeId = useSelectedLayoutSegment();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<ChatStatus>("open");
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/chat/threads?status=${filter}`);
    if (res.status === 401) {
      setUnlocked(false);
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as { threads: ThreadSummary[] };
    setThreads(data.threads);
    setUnlocked(true);
  }, [filter]);

  useEffect(() => {
    let cancelled = false;
    // No setLoading(true) here — it already starts true, and writing state in
    // an effect body just to restate that would cascade a render.
    // The cookie is the whole session check: a 401 means "show the gate".
    void fetch("/api/chat/auth")
      .then((res) => {
        if (cancelled) return;
        if (res.status !== 204) {
          setUnlocked(false);
          return;
        }
        return load();
      })
      .catch(() => !cancelled && setUnlocked(false))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    if (!unlocked) return;
    let timer: number | undefined;
    const tick = () => {
      timer = window.setTimeout(async () => {
        if (document.visibilityState === "visible") {
          await load().catch(() => {});
        }
        tick();
      }, LIST_POLL_MS);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [unlocked, load]);

  if (unlocked === false) {
    return (
      <UnlockDialog
        open
        onUnlocked={() => {
          setUnlocked(true);
          void load();
        }}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 lg:grid lg:grid-cols-[20rem_1fr]">
      <aside
        className={cn(
          "border-border min-h-0 flex-1 overflow-y-auto lg:flex-none lg:border-r",
          // Opening a thread is a real navigation, so on small screens the rail
          // steps aside instead of a client-side master/detail toggle.
          activeId && "hidden lg:block",
        )}
      >
        <div className="border-border flex items-center gap-1 border-b px-3 py-2">
          {(["open", "archived"] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? "secondary" : "ghost"}
              onClick={() => setFilter(value)}
            >
              {value === "open" ? "Open" : "Archived"}
            </Button>
          ))}
        </div>
        <ThreadList threads={threads} activeId={activeId} loading={loading} />
      </aside>
      <section
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          !activeId && "hidden lg:flex",
        )}
      >
        {children}
      </section>
    </div>
  );
}
