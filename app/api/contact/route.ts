import { SITE_AUTHOR, SITE_AUTHOR_EMAIL } from "@/lib/constants";
import { rateLimit } from "@/lib/redis";

const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 5000;

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, message, company } = (body ?? {}) as Record<
    string,
    unknown
  >;

  // Honeypot: a hidden field humans never see. If it's filled, it's a bot —
  // pretend everything went fine and drop the message silently.
  if (typeof company === "string" && company.trim() !== "") {
    return Response.json({ ok: true });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return Response.json(
      { error: "Please fill in every field." },
      { status: 400 },
    );
  }

  if (
    !isEmail(email) ||
    name.length > MAX_NAME ||
    email.length > MAX_EMAIL ||
    message.length > MAX_MESSAGE
  ) {
    return Response.json(
      { error: "Please check your details and try again." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Contact form: RESEND_API_KEY is not set.");
    return Response.json(
      { error: "Messaging isn't set up yet — please email me directly." },
      { status: 500 },
    );
  }

  const { ok: underLimit } = await rateLimit("contact", 5, 60 * 60);
  if (!underLimit) {
    return Response.json(
      { error: "Too many messages. Please try again in a little while." },
      { status: 429 },
    );
  }

  // Collapse control characters so a crafted name can't smuggle header-like
  // content into the subject line. (The email is regex-validated above and
  // can't contain whitespace.)
  const cleanName = name.replace(/[\r\n\t]+/g, " ").trim();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${SITE_AUTHOR} <onboarding@resend.dev>`,
      to: [SITE_AUTHOR_EMAIL],
      reply_to: email,
      subject: `Portfolio message from ${cleanName}`,
      text: `Name: ${cleanName}\nEmail: ${email}\n\n${message}`,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Contact form: Resend error", res.status, detail);
    return Response.json(
      { error: "Something went wrong sending your message." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
