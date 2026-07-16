"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FIELD_CLASS =
  "border-border bg-background placeholder:text-muted-foreground focus:border-foreground/30 w-full rounded-lg border px-3 py-2 text-sm outline-none";

type UnlockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlocked: (key: string) => void;
};

export function UnlockDialog({
  open,
  onOpenChange,
  onUnlocked,
}: UnlockDialogProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async (
    event,
  ) => {
    event.preventDefault();
    if (!key || pending) return;

    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/board/auth", {
        method: "POST",
        headers: { "x-board-key": key },
      });
      if (res.status === 204) {
        onUnlocked(key);
        setKey("");
        return;
      }
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Something went wrong — try again.");
    } catch {
      setError("Network error — try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Unlock editing</DialogTitle>
            <DialogDescription>
              This board is publicly viewable, but only the owner can edit it.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <input
              autoFocus
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Passphrase"
              aria-label="Passphrase"
              autoComplete="current-password"
              className={FIELD_CLASS}
            />
            {error && <p className="text-destructive mt-2 text-xs">{error}</p>}
          </div>
          <DialogFooter className="mt-5">
            <Button type="submit" disabled={!key || pending}>
              {pending ? "Checking…" : "Unlock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
