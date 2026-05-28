"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Heading = {
  id: string;
  text: string;
  level: number;
};

function extractText(el: HTMLElement) {
  return (el.textContent ?? "").replace(/#\s*$/, "").trim() || null;
}

const RING_SIZE = 28;
const RING_STROKE = 2.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

export default function ReadingProgress({
  articleSelector = "article",
}: {
  articleSelector?: string;
}) {
  const [progress, setProgress] = useState(0);
  const [heading, setHeading] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const rafRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(articleSelector);
    if (!article) return;

    const headingEls = Array.from(
      article.querySelectorAll<HTMLElement>("h2, h3"),
    ).filter((el) => el.id);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeadings(
      headingEls.map((el) => ({
        id: el.id,
        text: extractText(el) ?? el.id,
        level: el.tagName === "H2" ? 2 : 3,
      })),
    );

    const computeProgress = () => {
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleEnd = articleTop + article.scrollHeight - window.innerHeight;
      const denom = Math.max(1, articleEnd - articleTop);
      const pct = (window.scrollY - articleTop) / denom;
      setProgress(Math.min(1, Math.max(0, pct)));
      const nextVisible =
        window.scrollY > articleTop + 120 && window.scrollY < articleEnd + 200;
      setVisible(nextVisible);
      if (!nextVisible) setOpen(false);
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        computeProgress();
      });
    };

    computeProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", computeProgress);

    let observer: IntersectionObserver | null = null;
    if (headingEls.length > 0) {
      const active = new Set<HTMLElement>();
      const setActive = (el: HTMLElement | null) => {
        if (!el) {
          setHeading(null);
          setActiveId(null);
          return;
        }
        setHeading(extractText(el));
        setActiveId(el.id);
      };

      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) active.add(e.target as HTMLElement);
            else active.delete(e.target as HTMLElement);
          }
          if (active.size === 0) {
            const above = headingEls.filter(
              (h) => h.getBoundingClientRect().top < window.innerHeight * 0.25,
            );
            setActive(above[above.length - 1] ?? null);
            return;
          }
          const sorted = Array.from(active).sort(
            (a, b) =>
              a.getBoundingClientRect().top - b.getBoundingClientRect().top,
          );
          setActive(sorted[0]);
        },
        { rootMargin: "-15% 0px -70% 0px" },
      );
      headingEls.forEach((h) => observer!.observe(h));
    }

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", computeProgress);
      observer?.disconnect();
    };
  }, [articleSelector]);

  // Close panel on outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const offset = RING_CIRC * (1 - progress);

  const onSelect = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={rootRef}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center px-4"
        >
          <AnimatePresence>
            {open && headings.length > 0 && (
              <motion.div
                key="toc-panel"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="mb-2 w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl shadow-black/30 backdrop-blur-md"
              >
                <p className="px-5 pt-4 pb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Table of contents
                </p>
                <div className="max-h-[60vh] overflow-y-auto px-3 pb-3">
                  <ul className="space-y-0.5">
                    {headings.map((h) => {
                      const isActive = h.id === activeId;
                      return (
                        <li key={h.id}>
                          <button
                            type="button"
                            onClick={() => onSelect(h.id)}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                              isActive
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground",
                              h.level === 3 && "pl-7",
                            )}
                          >
                            <span className="truncate">{h.text}</span>
                            {isActive && (
                              <span className="size-1.5 shrink-0 rounded-full bg-foreground" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() =>
              headings.length > 0 ? setOpen((o) => !o) : undefined
            }
            aria-haspopup={headings.length > 0 ? "menu" : undefined}
            aria-expanded={open}
            aria-label={
              headings.length > 0
                ? open
                  ? "Close table of contents"
                  : "Open table of contents"
                : "Reading progress"
            }
            className={cn(
              "flex h-11 w-[320px] max-w-full items-center gap-3 rounded-full border border-border bg-card/90 px-4 shadow-lg shadow-black/10 backdrop-blur-md transition-colors",
              headings.length > 0 && "hover:bg-muted/40",
            )}
          >
            <span className="size-2 shrink-0 rounded-full bg-foreground" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={heading}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 truncate text-left text-sm text-foreground"
              >
                {heading ?? "Reading"}
              </motion.span>
            </AnimatePresence>
            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              className="shrink-0 -rotate-90 text-foreground"
              aria-hidden="true"
            >
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.15}
                strokeWidth={RING_STROKE}
              />
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRC}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 120ms linear" }}
              />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
