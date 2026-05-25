"use client";

import {
  ArrowRightIcon,
  CommandIcon,
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

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  scoreItem,
  type SearchItem,
  type SearchKind,
} from "@/lib/search-score";

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
    const isTypingTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        el.isContentEditable
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isTypingTarget(e.target)
      ) {
        e.preventDefault();
        setOpen(true);
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
      aria-label="Open search (⌘K)"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:py-1 sm:pl-3 sm:pr-1"
    >
      <SearchIcon className="size-3.5" />
      <span className="hidden items-center gap-0.5 sm:inline-flex">
        <kbd className="inline-flex size-5 items-center justify-center rounded-md bg-muted text-foreground">
          <CommandIcon className="size-3" />
        </kbd>
        <kbd className="inline-flex size-5 items-center justify-center rounded-md bg-muted font-mono text-[11px] text-foreground">
          K
        </kbd>
      </span>
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

  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      setOpen(false);
      lastPath.current = pathname;
    }
  }, [pathname, setOpen]);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIdx(0);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items
      .map((item) => ({ item, score: scoreItem(item, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="top-[15%] left-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
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
      </DialogContent>
    </Dialog>
  );
}
