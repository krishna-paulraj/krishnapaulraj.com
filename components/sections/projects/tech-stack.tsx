"use client";

import { TECH, type ProjectTech, type TechKey } from "@/lib/projects";

/**
 * The label reveal is pure CSS so it works for every input method:
 * - `group-hover/pill`: hovering an individual pill expands it (mouse).
 * - `group-focus-visible`: focusing the surrounding row link (keyboard)
 *   expands every pill in the row, since the pills themselves live inside
 *   a link and must not be separately focusable.
 */
const REVEAL =
  "group-hover/pill:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]";
const REVEAL_OPACITY =
  "group-hover/pill:opacity-100 group-focus-visible:opacity-100";

function TechPill({ icon: Icon, label, color }: ProjectTech) {
  return (
    <div className="group/pill border-border bg-muted flex h-7 cursor-default items-center overflow-hidden rounded-full border">
      <span className="flex size-7 shrink-0 items-center justify-center">
        <Icon className="size-3.5" style={{ color }} />
      </span>
      <span
        className={`grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out ${REVEAL}`}
      >
        <span className="overflow-hidden">
          <span
            className={`text-foreground pr-2.5 text-xs font-medium whitespace-nowrap opacity-0 transition-opacity duration-150 ${REVEAL_OPACITY}`}
          >
            {label}
          </span>
        </span>
      </span>
    </div>
  );
}

export default function TechStack({ tech }: { tech: TechKey[] }) {
  return (
    <div className="flex items-center">
      {tech.map((key) => {
        const t = TECH[key];
        return (
          // Positioned siblings with z-index:auto paint in DOM order, so
          // later pills overlap earlier ones exactly like the old ascending
          // inline z-index did; hover:z-20 lifts the hovered pill above all.
          <div key={key} className="relative -ml-2 first:ml-0 hover:z-20">
            <TechPill {...t} />
          </div>
        );
      })}
    </div>
  );
}
