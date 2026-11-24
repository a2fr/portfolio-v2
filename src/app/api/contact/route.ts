/**
 * Receives the letter box's form and emails it to the site's owner through Resend (https://resend.com).
 *
 * Environment:
 * - RESEND_API_KEY: the Resend API key.
 * - CONTACT_TO: the address the letters go to. It stays on the server and is never sent to the browser.
 * - CONTACT_FROM (optional): the sender, on a domain verified in Resend. Resend's shared test sender is the
 *   default; it only delivers to the address of the Resend account itself.
 *
 * Without the first two, letters cannot be delivered: in development they are printed in the server's console
 * so the form can be tried out; in production the form reports a failure.
 */

const LIMITS = { name: 100, email: 200, message: 5000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A handful of letters per address every ten minutes. Kept in memory: a brake on a runaway script, not a wall.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function tooMany(who: string) {
  const now = Date.now();
  const times = (recent.get(who) ?? []).filter((time) => now - time < WINDOW_MS);
  if (times.length >= MAX_PER_WINDOW) return true;
  times.push(now);
  recent.set(who, times);
  if (recent.size > 5000) recent.clear();
  return false;
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  if (!body || typeof body !== "object") return Response.json({ error: "invalid" }, { status: 400 });

  // The hidden field only bots fill in: answered as if it had worked, and dropped.
  if (text(body.website)) return Response.json({ ok: true });

  const name = text(body.name).replace(/[\r\n]+/g, " ");
  const email = text(body.email);
  const message = text(body.message);
  if (
    !name ||
    !message ||
    !EMAIL.test(email) ||
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    message.length > LIMITS.message
  ) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const who = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (tooMany(who)) return Response.json({ error: "too-many" }, { status: 429 });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[contact] not configured, letter printed instead\nFrom: ${name} <${email}>\n\n${message}`);
      return Response.json({ ok: true });
    }
    console.error("[contact] RESEND_API_KEY and CONTACT_TO are not set: the letter was not sent");
    return Response.json({ error: "unconfigured" }, { status: 503 });
  }

  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>",
      to,
      reply_to: email,
      subject: `Portfolio: letter from ${name}`,
      text: `${message}\n\n${name} <${email}>`,
    }),
  }).catch(() => null);
  if (!sent?.ok) {
    console.error(`[contact] Resend refused the letter: ${sent ? sent.status : "network error"}`);
    return Response.json({ error: "undelivered" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
