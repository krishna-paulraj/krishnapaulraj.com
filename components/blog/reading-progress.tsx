"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(articleSelector);
    if (!article) return;

    const headings = Array.from(
      article.querySelectorAll<HTMLElement>("h1, h2, h3"),
    );

    const computeProgress = () => {
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleEnd = articleTop + article.scrollHeight - window.innerHeight;
      const denom = Math.max(1, articleEnd - articleTop);
      const pct = (window.scrollY - articleTop) / denom;
      setProgress(Math.min(1, Math.max(0, pct)));
      setVisible(
        window.scrollY > articleTop + 120 && window.scrollY < articleEnd + 200,
      );
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
    if (headings.length > 0) {
      const active = new Set<HTMLElement>();
      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) active.add(e.target as HTMLElement);
            else active.delete(e.target as HTMLElement);
          }
          if (active.size === 0) {
            const above = headings.filter(
              (h) => h.getBoundingClientRect().top < window.innerHeight * 0.25,
            );
            const last = above[above.length - 1];
            setHeading(last ? extractText(last) : null);
            return;
          }
          const sorted = Array.from(active).sort(
            (a, b) =>
              a.getBoundingClientRect().top - b.getBoundingClientRect().top,
          );
          setHeading(extractText(sorted[0]));
        },
        { rootMargin: "-15% 0px -70% 0px" },
      );
      headings.forEach((h) => observer!.observe(h));
    }

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", computeProgress);
      observer?.disconnect();
    };
  }, [articleSelector]);

  const offset = RING_CIRC * (1 - progress);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 px-4"
          aria-hidden="true"
        >
          <div className="flex h-11 w-[320px] items-center gap-3 rounded-full border border-border bg-card/90 px-4 shadow-lg shadow-black/10 backdrop-blur-md">
            <span className="size-2 shrink-0 rounded-full bg-foreground" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={heading}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 truncate text-sm text-foreground"
              >
                {heading ?? "Reading"}
              </motion.span>
            </AnimatePresence>
            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              className="shrink-0 -rotate-90 text-foreground"
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
