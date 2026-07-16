"use client";

import Image from "next/image";
import { XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { useHydrated } from "@/hooks/use-hydrated";
import pfpDark from "@/assets/pfp_dark.png";
import pfpLight from "@/assets/pfp_light.png";

const SPRING = { type: "spring", stiffness: 300, damping: 28 } as const;

function AvatarImages({
  sizes,
  preload = false,
}: {
  sizes: string;
  preload?: boolean;
}) {
  return (
    <>
      <Image
        src={pfpLight}
        alt="Suresh Krishna Paulraj"
        fill
        sizes={sizes}
        className="rounded-full object-cover dark:hidden"
        preload={preload}
      />
      <Image
        src={pfpDark}
        alt="Suresh Krishna Paulraj"
        fill
        sizes={sizes}
        className="hidden rounded-full object-cover dark:block"
        preload={preload}
      />
    </>
  );
}

export function AvatarPreview() {
  const [open, setOpen] = useState(false);
  // Portal only after hydration so server and client render the same tree.
  const hydrated = useHydrated();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    // role="dialog" contract: move focus into the dialog on open, keep Tab
    // cycling inside it, and hand focus back to the trigger on close.
    const trigger = triggerRef.current;
    closeButtonRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && dialog.contains(active);

      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        layoutId="avatar-preview"
        transition={SPRING}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        aria-label="View profile photo"
        className="relative size-20 shrink-0 cursor-pointer rounded-full sm:size-[110px]"
      >
        <AvatarImages sizes="110px" preload />
      </motion.button>

      {hydrated &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div
                ref={dialogRef}
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
                <motion.button
                  ref={closeButtonRef}
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                  aria-label="Close photo preview"
                  className="absolute top-4 right-4 z-10 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  <XIcon className="size-5" />
                </motion.button>
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
