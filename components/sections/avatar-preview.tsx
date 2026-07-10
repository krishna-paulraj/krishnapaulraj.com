"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import pfpDark from "@/assets/pfp_dark.png";
import pfpLight from "@/assets/pfp_light.png";

const SPRING = { type: "spring", stiffness: 300, damping: 28 } as const;

function AvatarImages({
  sizes,
  priority = false,
}: {
  sizes: string;
  priority?: boolean;
}) {
  return (
    <>
      <Image
        src={pfpLight}
        alt="Suresh Krishna Paulraj"
        fill
        sizes={sizes}
        className="rounded-full object-cover dark:hidden"
        priority={priority}
      />
      <Image
        src={pfpDark}
        alt="Suresh Krishna Paulraj"
        fill
        sizes={sizes}
        className="hidden rounded-full object-cover dark:block"
        priority={priority}
      />
    </>
  );
}

export function AvatarPreview() {
  const [open, setOpen] = useState(false);
  // Portal only after mount so server and client render the same tree.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <motion.button
        type="button"
        layoutId="avatar-preview"
        transition={SPRING}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        aria-label="View profile photo"
        className="relative size-20 shrink-0 cursor-pointer rounded-full sm:size-[110px]"
      >
        <AvatarImages sizes="110px" priority />
      </motion.button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Profile photo"
                className="fixed inset-0 z-60 flex items-center justify-center"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                  className="absolute inset-0 bg-black/60 supports-backdrop-filter:backdrop-blur-sm"
                />
                <motion.div
                  layoutId="avatar-preview"
                  transition={SPRING}
                  onClick={() => setOpen(false)}
                  className="relative size-64 cursor-pointer rounded-full shadow-2xl ring-1 ring-white/20 sm:size-80"
                >
                  <AvatarImages sizes="(min-width: 640px) 320px, 256px" />
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
