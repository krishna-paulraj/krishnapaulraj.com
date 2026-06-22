"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PreviewTabs({
  preview,
  code,
}: {
  preview: ReactNode;
  code: ReactNode;
}) {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Component view"
        className="flex items-center gap-1 border-b border-border"
      >
        <TabButton active={tab === "preview"} onClick={() => setTab("preview")}>
          Preview
        </TabButton>
        <TabButton active={tab === "code"} onClick={() => setTab("code")}>
          Code
        </TabButton>
      </div>
      <div className="mt-4">{tab === "preview" ? preview : code}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      type="button"
      onClick={onClick}
      className={cn(
        "relative -mb-px border-b-2 px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-foreground font-medium text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
