"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

export default function Collapsible({
  icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: ReactNode;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="border-border bg-muted/40 text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-4">
          {icon}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground ml-auto inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors"
        >
          {open ? "Hide" : "Show"}
          <ChevronDown
            className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open && <div className="mt-6 pl-12">{children}</div>}
    </div>
  );
}
