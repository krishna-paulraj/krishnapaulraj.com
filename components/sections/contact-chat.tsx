"use client";

import { useState } from "react";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

const EMAIL = "krishnapaulraj2004@gmail.com";
const X_URL = "https://x.com/thedevkrish";
const LINKEDIN_URL = "https://linkedin.com/in/suresh-krishna-paulraj";
// "visitor" = the person browsing (right, blue). "owner" = me/Krishna (left, gray).
type Side = "visitor" | "owner";

type Action = { label: string; href: string; icon: React.ReactNode };

type Message =
  | { from: Side; kind: "text"; text: string }
  | { from: "owner"; kind: "email"; email: string }
  | { from: "owner"; kind: "form" }
  | { from: "owner"; kind: "actions"; actions: Action[] };

const messages: Message[] = [
  { from: "visitor", kind: "text", text: "Hey, can I reach out?" },
  { from: "owner", kind: "text", text: "Of course." },
  { from: "visitor", kind: "text", text: "Even if it's just to say hi?" },
  { from: "owner", kind: "text", text: "Especially if it's just to say hi." },
  { from: "visitor", kind: "text", text: "Nice. What's the best way?" },
  { from: "owner", kind: "text", text: "Email is usually the easiest." },
  { from: "owner", kind: "email", email: EMAIL },
  { from: "visitor", kind: "text", text: "What should I write?" },
  {
    from: "owner",
    kind: "text",
    text: "Whatever's on your mind, a project, an idea, a question, or just a quick introduction.",
  },
  {
    from: "visitor",
    kind: "text",
    text: "And if I don't feel like writing an email?",
  },
  {
    from: "owner",
    kind: "text",
    text: "That's completely fine. The contact form below goes to the same place.",
  },
  { from: "owner", kind: "form" },
  { from: "visitor", kind: "text", text: "Where else can I find you?" },
  {
    from: "owner",
    kind: "text",
    text: "I spend most of my time building things, but I occasionally share updates and thoughts online.",
  },
  {
    from: "owner",
    kind: "actions",
    actions: [
      {
        label: "X (Twitter)",
        href: X_URL,
        icon: <FaXTwitter className="size-3.5" />,
      },
      {
        label: "LinkedIn",
        href: LINKEDIN_URL,
        icon: <FaLinkedinIn className="size-3.5" />,
      },
    ],
  },
  { from: "visitor", kind: "text", text: "Sounds good." },
  {
    from: "owner",
    kind: "text",
    text: "Looking forward to hearing from you. Whether it's a big idea or a simple hello, my inbox is always open.",
  },
  {
    from: "owner",
    kind: "text",
    text: "peace ;)",
  },
];

// The one splash of color on an otherwise monochrome site: the visitor's
// sent bubbles and the Send button use the classic iMessage blue.
const IMESSAGE_BLUE = "bg-(--chat-accent)";

function rowClass(mine: boolean) {
  return cn("flex", mine ? "justify-end" : "justify-start");
}

function bubbleClass(mine: boolean, extra?: string) {
  return cn(
    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-snug",
    mine
      ? cn("rounded-br-md text-white", IMESSAGE_BLUE)
      : "rounded-bl-md bg-muted text-foreground",
    extra,
  );
}

function TextBubble({ mine, text }: { mine: boolean; text: string }) {
  return <div className={bubbleClass(mine)}>{text}</div>;
}

function EmailBubble({ email }: { email: string }) {
  return (
    <div className={bubbleClass(false, "flex flex-col gap-2")}>
      <span className="font-medium">{email}</span>
      <CopyButton
        text={email}
        variant="ghost"
        size="sm"
        aria-label="Copy email"
        className="bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground dark:hover:bg-foreground/10 w-full justify-center rounded-xl"
      >
        Copy
      </CopyButton>
    </div>
  );
}

type FormStatus = "idle" | "sending" | "success" | "error";

function ContactForm() {
  const field =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30";
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          message: String(data.get("message") ?? ""),
          company: String(data.get("company") ?? ""),
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Something went wrong.");
      }

      form.reset();
      setStatus("success");
      toast.success("Message sent — thanks for reaching out!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={bubbleClass(false, "flex flex-col gap-1")}>
        <span className="font-medium">Got it — thanks for reaching out.</span>
        <span className="text-muted-foreground">
          Your message is on its way to my inbox. I&apos;ll get back to you
          soon.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={bubbleClass(false, "flex w-full max-w-[75%] flex-col gap-2")}
    >
      <input
        type="text"
        name="name"
        placeholder="John Doe"
        className={field}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="john@doe.com"
        className={field}
        required
      />
      <textarea
        name="message"
        rows={3}
        placeholder="Enter your message"
        className={cn(field, "resize-none")}
        required
      />
      {/* Honeypot: hidden from people, tempting to bots. Submissions that fill
          it are dropped server-side. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        aria-busy={status === "sending"}
        className={cn(
          "relative overflow-hidden rounded-lg px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-100",
          IMESSAGE_BLUE,
        )}
      >
        {status === "sending" && (
          <span
            aria-hidden="true"
            className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
        )}
        <span className="relative">Send</span>
      </button>
    </form>
  );
}

function ActionsBubble({ actions }: { actions: Action[] }) {
  return (
    <div className={bubbleClass(false, "flex flex-col gap-2")}>
      {actions.map((action) => (
        <a
          key={action.href}
          href={action.href}
          target={action.href.startsWith("mailto") ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="bg-foreground/5 text-foreground hover:bg-foreground/10 flex items-center justify-center gap-2 rounded-xl px-3 py-2 font-medium transition-colors"
        >
          {action.icon}
          {action.label}
        </a>
      ))}
    </div>
  );
}

export function ContactChat() {
  return (
    <div className="flex flex-col gap-1.5">
      {messages.map((message, i) => {
        const mine = message.from === "visitor";
        return (
          <div key={i} className={rowClass(mine)}>
            {message.kind === "text" ? (
              <TextBubble mine={mine} text={message.text} />
            ) : message.kind === "email" ? (
              <EmailBubble email={message.email} />
            ) : message.kind === "form" ? (
              <ContactForm />
            ) : (
              <ActionsBubble actions={message.actions} />
            )}
          </div>
        );
      })}
    </div>
  );
}
