"use client";

import { useState } from "react";

import { SignInButtons } from "@/components/sections/chat/sign-in-buttons";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Message, MessageContent } from "@/components/ui/message";
import { CHAT_LIMITS, type OAuthProvider } from "@/lib/chat";

/** The field styling the board's unlock dialog and the contact form both use. */
const FIELD_CLASS =
  "border-border bg-background placeholder:text-muted-foreground focus:border-foreground/30 w-full rounded-lg border px-3 py-2 text-sm outline-none";

type IdentityFormProps = {
  onSubmit: (name: string, email: string) => Promise<string | null>;
  providers: OAuthProvider[];
};

/**
 * Shown as a reply to the visitor's first message rather than as a gate in
 * front of it. Asking before anyone has typed anything is the surest way to get
 * no message at all; asking straight after costs nothing, because by then they
 * already want an answer.
 *
 * Sign-in is offered here as the faster way to answer the same question — it
 * fills the name in and makes the conversation portable — but never as the only
 * way. Someone who just wants to leave a message can still type a name and go.
 */
export function IdentityForm({ onSubmit, providers }: IdentityFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async (
    event,
  ) => {
    event.preventDefault();
    if (!name.trim() || pending) return;
    setPending(true);
    setError(null);
    const failure = await onSubmit(name.trim(), email.trim());
    setPending(false);
    if (failure) setError(failure);
  };

  return (
    <Message align="start">
      <MessageContent>
        <Bubble variant="muted" align="start" className="max-w-full">
          <BubbleContent className="w-full">
            <p className="mb-2">Got it. Who should I reply to?</p>
            {providers.length > 0 && (
              <>
                <SignInButtons providers={providers} className="mb-3" />
                {/* Sign-in sits above the fields as the easier option, but the
                    fields stay — typing a name is one step and an OAuth round
                    trip is several, and a portfolio that demands an account
                    before it will take a message gets fewer messages. */}
                <div
                  className="text-muted-foreground mb-3 flex items-center gap-2 text-xs"
                  aria-hidden
                >
                  <span className="bg-border h-px flex-1" />
                  or
                  <span className="bg-border h-px flex-1" />
                </div>
              </>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                aria-label="Your name"
                autoComplete="name"
                maxLength={CHAT_LIMITS.name}
                className={FIELD_CLASS}
              />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email (optional)"
                aria-label="Email, optional"
                autoComplete="email"
                maxLength={CHAT_LIMITS.email}
                className={FIELD_CLASS}
              />
              <p className="text-muted-foreground text-xs">
                I&apos;ll reply right here — the email is only so I can reach
                you if you close the tab.
              </p>
              {error && <p className="text-destructive text-xs">{error}</p>}
              <Button
                type="submit"
                size="sm"
                disabled={!name.trim() || pending}
                className="self-start"
              >
                {pending ? "Saving…" : "Continue"}
              </Button>
            </form>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
