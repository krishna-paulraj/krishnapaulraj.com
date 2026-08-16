"use client";

import { XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

import { Composer } from "@/components/sections/chat/composer";
import {
  ChatEmpty,
  ChatError,
  ChatSkeleton,
} from "@/components/sections/chat/chat-states";
import { IdentityForm } from "@/components/sections/chat/identity-form";
import { Transcript } from "@/components/sections/chat/transcript";
import { Button } from "@/components/ui/button";
import { CHAT_HOST } from "@/components/sections/chat/constants";
import type { ChatState } from "@/hooks/use-chat-thread";

// Matches components/motion/reveal.tsx, so the panel enters like the rest of
// the site. MotionProvider sets reducedMotion="user", so this is skipped
// automatically for anyone who asked for less motion.
const EASE = [0.22, 1, 0.36, 1] as const;

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
  chat: ChatState;
  isMobile: boolean;
};

export function ChatPanel({ open, onClose, chat, isMobile }: ChatPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // A Dialog would give us Escape and focus handling, but it would also make
  // the panel modal — trapping focus and locking page scroll — and a chat you
  // can't read the page behind is the wrong shape for a corner widget. So the
  // two behaviours worth keeping are wired up by hand instead.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // Opening a chat means wanting to type in it, not to read its header.
    panelRef.current?.querySelector("textarea")?.focus();
  }, [open]);

  // A full-screen panel would otherwise scroll the page behind it on mobile.
  useEffect(() => {
    if (!open || !isMobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, isMobile]);

  const needsIdentity = Boolean(chat.thread && !chat.thread.name);
  const started = chat.messages.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-label={`Chat with ${CHAT_HOST}`}
          // Only the full-screen mobile panel is modal. On desktop the page
          // behind stays readable and must not be hidden from assistive tech.
          aria-modal={isMobile}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="bg-popover text-popover-foreground border-border fixed inset-0 z-50 flex flex-col overflow-hidden border shadow-lg sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[min(36rem,calc(100dvh-9rem))] sm:w-96 sm:rounded-xl"
        >
          <header className="border-border flex items-start gap-2 border-b p-4">
            <div className="min-w-0 flex-1">
              <p className="font-heading text-foreground text-base font-medium">
                Chat with {CHAT_HOST}
              </p>
              <p className="text-muted-foreground text-sm">
                Usually a reply within a day. This stays here — come back any
                time.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Close chat"
            >
              <XIcon />
            </Button>
          </header>

          {chat.status === "loading" && !started ? (
            <ChatSkeleton />
          ) : chat.status === "error" ? (
            <ChatError onRetry={chat.reload} />
          ) : (
            <Transcript
              messages={chat.messages}
              viewerRole="visitor"
              counterpartName={CHAT_HOST}
              visitorName={chat.thread?.name}
              onRetry={chat.retry}
              busy={chat.status === "loading"}
            >
              {!started && <ChatEmpty name={chat.thread?.name} />}
            </Transcript>
          )}

          {needsIdentity && (
            <div className="border-border border-t px-3 py-3">
              <IdentityForm onSubmit={chat.saveIdentity} />
            </div>
          )}

          <Composer
            onSend={chat.send}
            disabled={needsIdentity}
            disabledHint="Add your name above to keep going"
            placeholder={started ? "Write a message…" : "What's on your mind?"}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
