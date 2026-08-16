"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { TranscriptMessage } from "@/components/sections/chat/transcript";
import { pollDelayMs, type ChatPayload, type ChatThread } from "@/lib/chat";

/**
 * Set once a visitor has actually started a conversation. Without it, every
 * visitor who never opens the widget would still poll — and most never open it.
 * Non-sensitive by design: the thread itself is identified by an HttpOnly
 * cookie, and this flag only says "there is something to check".
 */
const STARTED_KEY = "chat:started";

/** Sorts optimistic rows after every persisted one; see send(). */
const PENDING_SEQ_BASE = Number.MAX_SAFE_INTEGER - 1_000_000;

type Load = "idle" | "loading" | "ready" | "error";

export type ChatState = {
  status: Load;
  thread: ChatThread | null;
  messages: TranscriptMessage[];
  unread: number;
  send: (body: string) => Promise<void>;
  retry: (id: string) => void;
  saveIdentity: (name: string, email: string) => Promise<string | null>;
  reload: () => void;
};

/** Merge a server page into local state, letting the server win on any shared id. */
function merge(
  local: TranscriptMessage[],
  incoming: TranscriptMessage[],
): TranscriptMessage[] {
  if (!incoming.length) return local;
  const byId = new Map(local.map((m) => [m.id, m]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort((a, b) => a.seq - b.seq);
}

export function useChatThread(open: boolean): ChatState {
  const [status, setStatus] = useState<Load>("idle");
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);

  const cursorRef = useRef(0);
  // 0 means "nothing has happened yet", which the poll schedule reads as
  // freshly active. Seeding this with Date.now() would be a clock read during
  // render, and React can render more than once.
  const lastActivityRef = useRef(0);
  const startedRef = useRef(false);

  const apply = useCallback((data: ChatPayload) => {
    if (data.thread) {
      setThread(data.thread);
      startedRef.current = true;
      window.localStorage.setItem(STARTED_KEY, "1");
    }
    if (data.messages.length) {
      lastActivityRef.current = Date.now();
      // A pending row is replaced wholesale by its server twin because both
      // carry the same id — the clientId the optimistic render used.
      setMessages((prev) => merge(prev, data.messages));
      cursorRef.current = Math.max(cursorRef.current, data.cursor);
    }
  }, []);

  const fetchThread = useCallback(
    async (options: { peek?: boolean; full?: boolean } = {}) => {
      const params = new URLSearchParams();
      if (options.peek) params.set("peek", "1");
      else {
        if (!options.full && cursorRef.current > 0) {
          params.set("since", String(cursorRef.current));
        }
        params.set("ack", "1");
      }

      const res = await fetch(`/api/chat?${params}`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`chat ${res.status}`);
      const data = (await res.json()) as ChatPayload;

      if (options.peek) {
        setThread(data.thread);
        return;
      }
      apply(data);
      // An explicit ack means the server just cleared the counter, so mirror
      // that locally instead of waiting a poll cycle for it to come back.
      if (data.thread) setThread({ ...data.thread, unread: 0 });
    },
    [apply],
  );

  // First contact. Visitors with no prior conversation make no request at all.
  useEffect(() => {
    startedRef.current = window.localStorage.getItem(STARTED_KEY) === "1";
    if (!startedRef.current) {
      setStatus("ready");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetchThread({ peek: true })
      .then(() => !cancelled && setStatus("ready"))
      // A 503 here usually means the database isn't configured. The widget
      // stays silent rather than pushing a server problem at the reader.
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [fetchThread]);

  // Load the full transcript the first time the panel opens.
  useEffect(() => {
    if (!open || !startedRef.current || cursorRef.current > 0) return;
    let cancelled = false;
    setStatus("loading");
    fetchThread({ full: true })
      .then(() => !cancelled && setStatus("ready"))
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [open, fetchThread]);

  // Poll, but only while the tab is visible and only as often as the
  // conversation warrants. Hidden tabs stop entirely.
  useEffect(() => {
    let timer: number | undefined;
    let cancelled = false;

    const tick = () => {
      const delay = pollDelayMs({
        open,
        visible: document.visibilityState === "visible",
        msSinceLastMessage: lastActivityRef.current
          ? Date.now() - lastActivityRef.current
          : 0,
      });
      if (delay === null || cancelled) return;
      timer = window.setTimeout(async () => {
        // Checked here, not as an effect guard: a visitor who arrives with no
        // thread and sends their first message flips this mid-effect, and a ref
        // read at setup time would leave them polling never — so they would
        // never see a reply without reloading the page.
        if (startedRef.current) {
          try {
            await fetchThread(open ? {} : { peek: true });
          } catch {
            // Transient failures just wait for the next tick.
          }
        }
        tick();
      }, delay);
    };

    const onVisibility = () => {
      window.clearTimeout(timer);
      if (document.visibilityState === "visible" && startedRef.current) {
        void fetchThread(open ? {} : { peek: true }).catch(() => {});
      }
      tick();
    };

    tick();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [open, fetchThread]);

  const post = useCallback(
    async (id: string, body: string) => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ body, clientId: id }),
        });
        if (!res.ok) throw new Error(`chat ${res.status}`);
        const data = (await res.json()) as ChatPayload;
        apply(data);
        if (data.thread) setThread(data.thread);
        setStatus("ready");
      } catch {
        // Never drop what they typed — mark it and offer a retry instead.
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, pending: "failed" } : m)),
        );
      }
    },
    [apply],
  );

  const send = useCallback(
    async (body: string) => {
      const id = crypto.randomUUID();
      lastActivityRef.current = Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id,
          // Above any seq Postgres will ever hand out, so an unsent message
          // stays pinned to the bottom until the server replaces it with the
          // real row (same id, real seq) and it drops into place.
          seq: PENDING_SEQ_BASE + prev.length,
          role: "visitor",
          body,
          createdAt: new Date().toISOString(),
          pending: "sending",
        },
      ]);
      await post(id, body);
    },
    [post],
  );

  const retry = useCallback(
    (id: string) => {
      const target = messages.find((m) => m.id === id);
      if (!target) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, pending: "sending" } : m)),
      );
      void post(id, target.body);
    },
    [messages, post],
  );

  const saveIdentity = useCallback(async (name: string, email: string) => {
    try {
      const res = await fetch("/api/chat", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = (await res.json().catch(() => null)) as
        (ChatPayload & { error?: string }) | null;
      if (!res.ok) return data?.error ?? "Couldn't save that — try again.";
      if (data?.thread) setThread(data.thread);
      return null;
    } catch {
      return "Network error — try again.";
    }
  }, []);

  const reload = useCallback(() => {
    setStatus("loading");
    fetchThread({ full: true })
      .then(() => setStatus("ready"))
      .catch(() => setStatus("error"));
  }, [fetchThread]);

  return {
    status,
    thread,
    messages,
    unread: thread?.unread ?? 0,
    send,
    retry,
    saveIdentity,
    reload,
  };
}
