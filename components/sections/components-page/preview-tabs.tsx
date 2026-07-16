"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

const TABS = ["preview", "code"] as const;
type TabKey = (typeof TABS)[number];

const TAB_LABELS: Record<TabKey, string> = {
  preview: "Preview",
  code: "Code",
};

export function PreviewTabs({
  preview,
  code,
}: {
  preview: ReactNode;
  code: ReactNode;
}) {
  const [tab, setTab] = useState<TabKey>("preview");
  const baseId = useId();
  const tabRefs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});

  const tabId = (key: TabKey) => `${baseId}-tab-${key}`;
  // A single panel element is reused for both tabs, so it has one stable id.
  const panelId = `${baseId}-panel`;

  const selectTab = (key: TabKey) => {
    setTab(key);
    tabRefs.current[key]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = TABS.indexOf(tab);
    let next: TabKey;

    switch (event.key) {
      case "ArrowRight":
        next = TABS[(index + 1) % TABS.length];
        break;
      case "ArrowLeft":
        next = TABS[(index - 1 + TABS.length) % TABS.length];
        break;
      case "Home":
        next = TABS[0];
        break;
      case "End":
        next = TABS[TABS.length - 1];
        break;
      default:
        return;
    }

    event.preventDefault();
    selectTab(next);
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Component view"
        className="border-border flex items-center gap-1 border-b"
      >
        {TABS.map((key) => {
          const active = tab === key;
          return (
            <button
              key={key}
              ref={(el) => {
                tabRefs.current[key] = el;
              }}
              role="tab"
              type="button"
              id={tabId(key)}
              aria-selected={active}
              aria-controls={panelId}
              // Roving tabindex: only the active tab is in the Tab order;
              // Arrow/Home/End keys move between tabs.
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(key)}
              onKeyDown={onKeyDown}
              className={cn(
                "relative -mb-px border-b-2 px-3 py-1.5 text-sm transition-colors",
                active
                  ? "border-foreground text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              {TAB_LABELS[key]}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(tab)}
        tabIndex={0}
        className="mt-4"
      >
        {tab === "preview" ? preview : code}
      </div>
    </div>
  );
}
