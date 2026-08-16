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
  onUnlocked: () => void;
};

/**
 * The inbox gate. Shaped like the board's unlock dialog, with one deliberate
 * difference: nothing is kept client-side. The passphrase is exchanged for an
 * HttpOnly cookie and forgotten, so there is no localStorage revalidation dance
 * on mount — the browser simply sends the cookie or it doesn't.
 */
export function UnlockDialog({ open, onUnlocked }: UnlockDialogProps) {
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
      const res = await fetch("/api/chat/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ passphrase: key }),
      });
      if (res.status === 204) {
        setKey("");
        onUnlocked();
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
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Inbox</DialogTitle>
            <DialogDescription>
              These are private conversations. Enter the passphrase to read
              them.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <input
              autoFocus
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
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
