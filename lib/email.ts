/**
 * Outbound email through Resend. Two callers share this: the contact form and
 * the chat's new-thread notification.
 *
 * Note the sender is Resend's sandbox domain, which can only deliver to the
 * account owner's own address. That is fine for both callers — every message
 * here is addressed to the site owner — but it is also the reason the chat does
 * not email visitors when the owner replies. Doing that needs a verified domain
 * first.
 */

import { SITE_AUTHOR, SITE_AUTHOR_EMAIL } from "@/lib/constants";

export type SendEmailResult =
  { ok: true } | { ok: false; reason: "unconfigured" | "failed" };

export async function sendEmail(options: {
  subject: string;
  text: string;
  /** Where a reply should go. Omit when replying by email wouldn't reach anyone. */
  replyTo?: string;
  /** Prefixes error logs so a failure is traceable to its caller. */
  scope: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`${options.scope}: RESEND_API_KEY is not set.`);
    return { ok: false, reason: "unconfigured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${SITE_AUTHOR} <onboarding@resend.dev>`,
      to: [SITE_AUTHOR_EMAIL],
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
      subject: options.subject,
      text: options.text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`${options.scope}: Resend error`, res.status, detail);
    return { ok: false, reason: "failed" };
  }

  return { ok: true };
}
