"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightIcon,
  CompassIcon,
  FileTextIcon,
  FolderIcon,
  SearchIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import type { SearchItem, SearchKind } from "@/lib/search";

type SearchContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
};

const SearchCtx = createContext<SearchContextValue | null>(null);

function useSearch() {
  const ctx = useContext(SearchCtx);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}

const KIND_ICON: Record<SearchKind, React.ElementType> = {
  page: CompassIcon,
  post: FileTextIcon,
  project: FolderIcon,
};

const KIND_LABEL: Record<SearchKind, string> = {
  page: "Pages",
  post: "Writing",
  project: "Projects",
};

const KIND_ORDER: SearchKind[] = ["page", "post", "project"];

export function SearchProvider({
  items,
  children,
}: {
  items: SearchItem[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SearchCtx.Provider value={{ open, setOpen }}>
      {children}
      <SearchDialog items={items} />
    </SearchCtx.Provider>
  );
}

export function SearchTrigger() {
  const { setOpen } = useSearch();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Open search"
      className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <SearchIcon className="size-3.5" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden rounded border border-border bg-muted px-1 py-px font-mono text-[10px] sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}

function SearchDialog({ items }: { items: SearchItem[] }) {
  const { open, setOpen } = useSearch();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Portal target only exists in the browser; flipping mounted prevents
    // the createPortal call from running during SSR/hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close on path change
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      setOpen(false);
      lastPath.current = pathname;
    }
  }, [pathname, setOpen]);

  // Reset state when closed; focus input + lock scroll when opened
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        document.body.style.overflow = prev;
        window.clearTimeout(timer);
      };
    }
    // Reset on close so reopening starts fresh.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    setActiveIdx(0);
  }, [open]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [item.title, item.description ?? "", ...(item.keywords ?? [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIdx(0);
  }, [query]);

  const groups = useMemo(() => {
    const buckets: Record<SearchKind, SearchItem[]> = {
      page: [],
      post: [],
      project: [],
    };
    for (const r of results) buckets[r.kind].push(r);
    return KIND_ORDER.filter((k) => buckets[k].length > 0).map((k) => ({
      kind: k,
      items: buckets[k],
    }));
  }, [results]);

  // Map from flat index to item to support keyboard nav across groups
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-idx="${activeIdx}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  const go = (item: SearchItem) => {
    setOpen(false);
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[activeIdx];
      if (item) go(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="fixed inset-0 z-[100]"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-[15%] w-[92vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl shadow-black/30"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search pages, writing, projects…"
                spellCheck={false}
                autoComplete="off"
                aria-label="Search query"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
              {flat.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
              ) : (
                groups.map((g) => (
                  <div key={g.kind} className="mb-3 last:mb-0">
                    <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
                      {KIND_LABEL[g.kind]}
                    </p>
                    <ul>
                      {g.items.map((item) => {
                        const idx = flat.indexOf(item);
                        const Icon = KIND_ICON[item.kind];
                        const isActive = idx === activeIdx;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              data-idx={idx}
                              onClick={() => go(item)}
                              onMouseEnter={() => setActiveIdx(idx)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                                isActive ? "bg-muted" : "hover:bg-muted/60",
                              )}
                            >
                              <Icon className="size-4 shrink-0 text-muted-foreground" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {item.title}
                                </p>
                                {item.description && (
                                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {isActive && (
                                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>

            <div className="hidden items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground sm:flex">
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-px font-mono">
                  ↑↓
                </kbd>
                navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-px font-mono">
                  ↵
                </kbd>
                open
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-px font-mono">
                  esc
                </kbd>
                close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
