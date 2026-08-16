"use client";

import { formatDistanceToNow } from "date-fns";

import {
  OwnerAvatar,
  VisitorAvatar,
} from "@/components/sections/chat/message-avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Marker, MarkerContent } from "@/components/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { useHydrated } from "@/hooks/use-hydrated";
import { groupMessages, type ChatMessage, type ChatRole } from "@/lib/chat";
import { cn } from "@/lib/utils";

/** A message that hasn't reached the server yet, or failed on the way. */
export type PendingState = "sending" | "failed";

export type TranscriptMessage = ChatMessage & { pending?: PendingState };

type TranscriptProps = {
  messages: TranscriptMessage[];
  /**
   * Whose side of the conversation this view belongs to. It decides alignment,
   * and it is the reason this component is shared rather than duplicated: in
   * the widget the visitor's messages sit on the right, in the inbox the
   * owner's do. Hardcoding either role here would look almost right in one
   * surface and be wrong in the other.
   */
  viewerRole: ChatRole;
  /** Name shown above incoming messages and used for the visitor's initials. */
  counterpartName: string;
  visitorName?: string | null;
  onRetry?: (id: string) => void;
  className?: string;
  busy?: boolean;
  children?: React.ReactNode;
};

const dayLabel = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

export function Transcript({
  messages,
  viewerRole,
  counterpartName,
  visitorName,
  onRetry,
  className,
  busy = false,
  children,
}: TranscriptProps) {
  const rows = groupMessages(messages);

  return (
    <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
      <MessageScroller className={cn("min-h-0 flex-1", className)}>
        <MessageScrollerViewport
          aria-label={`Conversation with ${counterpartName}`}
          className="px-4 py-4"
        >
          <MessageScrollerContent
            aria-live="polite"
            aria-busy={busy}
            className="gap-3"
          >
            {children}
            {rows.map(
              ({ message, startsRun, endsRun, scrollAnchor, dayBreak }) => {
                const mine = message.role === viewerRole;
                const pending = message.pending;

                return (
                  <MessageScrollerItem
                    // Required, not optional: the scroller ignores rows without
                    // a messageId, which silently disables anchoring and
                    // visibility tracking rather than erroring.
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={scrollAnchor}
                    className="flex flex-col gap-3"
                  >
                    {dayBreak && (
                      <Marker variant="separator">
                        <MarkerContent>
                          {dayLabel.format(new Date(message.createdAt))}
                        </MarkerContent>
                      </Marker>
                    )}
                    <Message align={mine ? "end" : "start"}>
                      {/*
                        Only the other person gets an avatar — you already know
                        which messages are yours, and your own face next to them
                        is noise. It sits on the last message of a run, since
                        MessageAvatar anchors to the bottom of the row.
                      */}
                      {!mine && (
                        <MessageAvatar className="bg-transparent">
                          {endsRun &&
                            (message.role === "owner" ? (
                              <OwnerAvatar />
                            ) : (
                              <VisitorAvatar name={visitorName ?? null} />
                            ))}
                        </MessageAvatar>
                      )}
                      <MessageContent>
                        {startsRun && !mine && (
                          <MessageHeader>{counterpartName}</MessageHeader>
                        )}
                        <Bubble
                          variant={
                            pending === "failed"
                              ? "destructive"
                              : mine
                                ? "default"
                                : "muted"
                          }
                          align={mine ? "end" : "start"}
                          className={cn(
                            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1",
                            // The palette is achromatic, so no stock variant
                            // can distinguish your own messages by colour. The
                            // accent is applied here rather than as a new
                            // Bubble variant, so components/ui stays exactly as
                            // the registry ships it.
                            mine &&
                              pending !== "failed" &&
                              "*:data-[slot=bubble-content]:bg-(--chat-accent) *:data-[slot=bubble-content]:text-white",
                            pending === "sending" && "opacity-70",
                          )}
                        >
                          <BubbleContent className="whitespace-pre-wrap">
                            {message.body}
                          </BubbleContent>
                        </Bubble>
                        {endsRun && (
                          <MessageFooter>
                            {pending === "failed" ? (
                              <>
                                <span className="text-destructive">
                                  Didn&apos;t send
                                </span>
                                {onRetry && (
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    className="ms-1"
                                    onClick={() => onRetry(message.id)}
                                  >
                                    Retry
                                  </Button>
                                )}
                              </>
                            ) : pending === "sending" ? (
                              <span>Sending…</span>
                            ) : (
                              <RelativeTime iso={message.createdAt} />
                            )}
                          </MessageFooter>
                        )}
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                );
              },
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}

/**
 * "3 minutes ago" depends on the reader's clock, so it can only be computed
 * after hydration — rendering it during SSR guarantees a mismatch.
 */
function RelativeTime({ iso }: { iso: string }) {
  const hydrated = useHydrated();
  if (!hydrated) return <span className="opacity-0">·</span>;
  return (
    <time dateTime={iso}>
      {formatDistanceToNow(new Date(iso), { addSuffix: true })}
    </time>
  );
}
