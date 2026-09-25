import { isEmail } from "@/lib/chat";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/redis";

const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 5000;

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

  if (!process.env.RESEND_API_KEY) {
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

  const sent = await sendEmail({
    scope: "Contact form",
    subject: `Portfolio message from ${cleanName}`,
    text: `Name: ${cleanName}\nEmail: ${email}\n\n${message}`,
    replyTo: email,
  });

  if (!sent.ok) {
    return Response.json(
      { error: "Something went wrong sending your message." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
