"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";

const EMAIL = "krishnapaulraj2004@gmail.com";

type Message =
  | { from: "me" | "them"; text: string }
  | { from: "them"; email: string };

const messages: Message[] = [
  { from: "me", text: "ngl your site goes hard 🔥" },
  { from: "me", text: "how do i actually reach you?" },
  { from: "them", text: "haha appreciate it 🙏" },
  {
    from: "them",
    text: "fastest way is to just email me. keep it short tho — don't write me an essay",
  },
  { from: "them", email: EMAIL },
  { from: "me", text: "bet 🫡" },
];

// How long the typing indicator lingers before a "them" message lands.
function typingDuration(message: Message) {
  if ("email" in message) return 900;
  return Math.min(1600, 500 + message.text.length * 16);
}

// Apple-style soft spring — sent bubbles get a touch more bounce.
function bubbleSpring(mine: boolean) {
  return {
    type: "spring" as const,
    visualDuration: mine ? 0.45 : 0.5,
    bounce: mine ? 0.28 : 0.18,
    opacity: { duration: 0.22 },
  };
}

function rowClass(mine: boolean) {
  return cn("flex", mine ? "justify-end" : "justify-start");
}

function MessageBubble({ message }: { message: Message }) {
  const mine = message.from === "me";
  return (
    <div
      className={cn(
        "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-snug",
        mine
          ? "rounded-br-md bg-blue-500 text-white"
          : "rounded-bl-md bg-muted text-foreground",
      )}
    >
      {"email" in message ? (
        <div className="flex flex-col gap-2">
          <span className="font-medium">{message.email}</span>
          <CopyButton
            text={message.email}
            variant="ghost"
            size="sm"
            aria-label="Copy email"
            className="w-full justify-center rounded-xl bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground dark:hover:bg-foreground/10"
          >
            Copy
          </CopyButton>
        </div>
      ) : (
        message.text
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="size-1.5 rounded-full bg-foreground/40"
          animate={{ scale: [1, 1.3, 1], opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot * 0.18,
          }}
        />
      ))}
    </div>
  );
}

export function ContactChat() {
  const ref = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  const [minHeight, setMinHeight] = useState<number>();
  const [reduced, setReduced] = useState(false);
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);

  // Reserve the conversation's full height so nothing below shifts as bubbles
  // arrive. Measured from an invisible full render, kept in sync on resize.
  useEffect(() => {
    const el = ghostRef.current;
    if (!el) return;
    const update = () => setMinHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setReduced(true);
      setShown(messages.length);
      return;
    }

    let cancelled = false;
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    (async () => {
      for (let i = 0; i < messages.length; i++) {
        if (cancelled) return;
        const message = messages[i];

        if (message.from === "them") {
          setTyping(true);
          await sleep(typingDuration(message));
          if (cancelled) return;
          setTyping(false);
        } else {
          await sleep(420);
        }

        if (cancelled) return;
        setShown(i + 1);
        await sleep(message.from === "them" ? 340 : 240);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inView]);

  return (
    <div className="relative">
      {/* Invisible full render used only to reserve a stable height. */}
      <div
        ref={ghostRef}
        aria-hidden
        className="pointer-events-none invisible absolute inset-x-0 top-0 flex flex-col gap-1.5"
      >
        {messages.map((message, i) => (
          <div key={i} className={rowClass(message.from === "me")}>
            <MessageBubble message={message} />
          </div>
        ))}
      </div>

      <div
        ref={ref}
        style={minHeight ? { minHeight } : undefined}
        className="flex flex-col gap-1.5"
      >
        <AnimatePresence mode="popLayout">
          {messages.slice(0, shown).map((message, i) => {
            const mine = message.from === "me";
            return (
              <motion.div
                key={i}
                initial={reduced ? false : { opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={reduced ? { duration: 0 } : bubbleSpring(mine)}
                style={{ transformOrigin: mine ? "bottom right" : "bottom left" }}
                className={rowClass(mine)}
              >
                <MessageBubble message={message} />
              </motion.div>
            );
          })}

          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.18 } }}
              transition={bubbleSpring(false)}
              style={{ transformOrigin: "bottom left" }}
              className="flex justify-start"
            >
              <div className="rounded-2xl rounded-bl-md bg-muted px-3.5 py-3">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
