"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { TECH, type ProjectTech, type TechKey } from "@/lib/projects";

const SPRING = { type: "spring", stiffness: 400, damping: 40 } as const;

function TechPill({
  icon: Icon,
  label,
  color,
  isHovered,
}: ProjectTech & { isHovered: boolean }) {
  return (
    <motion.div
      animate={{ width: isHovered ? "auto" : 28 }}
      transition={SPRING}
      className="flex h-7 cursor-default items-center overflow-hidden rounded-full border border-border bg-muted"
    >
      <span className="flex size-7 shrink-0 items-center justify-center">
        <Icon className="size-3.5" style={{ color }} />
      </span>
      <AnimatePresence>
        {isHovered && (
          <motion.span
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="whitespace-nowrap pr-2.5 text-xs font-medium text-foreground"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TechStack({ tech }: { tech: TechKey[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex items-center">
      {tech.map((key, i) => {
        const t = TECH[key];
        return (
          <div
            key={key}
            style={{
              marginLeft: i === 0 ? 0 : -8,
              zIndex: hoveredIndex === i ? 20 : i + 1,
              position: "relative",
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <TechPill {...t} isHovered={hoveredIndex === i} />
          </div>
        );
      })}
    </div>
  );
}
