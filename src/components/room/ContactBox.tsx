"use client";

import { useState } from "react";
import { useT } from "@/i18n/useT";
import { LETTER_BOX_DARK, LETTER_BOX_GREEN } from "./letterBox";

const PAPER = "#f6f0dc";
const RULE = "#cfc4a3";
const FADED_INK = "#5d5a4c";

type Status = "idle" | "sending" | "sent" | "error";

const FIELD =
  "mt-1 w-full border-0 border-b bg-transparent px-0 py-1.5 text-base text-ink outline-none focus:border-b-2 focus:border-[#236e41]";

/**
 * Inside the letter box: the dark the slot led into, daylight falling through the slot overhead, and a sheet of
 * letter paper to write on. Posting it sends the message to the site's owner.
 */
export function ContactBox({ onLeave }: { onLeave: () => void }) {
  const t = useT();
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!response.ok) throw new Error(`contact: ${response.status}`);
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="absolute inset-0 overflow-y-auto" style={{ background: LETTER_BOX_DARK }}>
      {/* The slot seen from inside, and the light it lets in. */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 h-[70vh]">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 100% at 50% 0%, rgb(246 240 220 / 0.2), transparent 70%)" }}
        />
        <div
          className="absolute top-0 left-1/2 h-2 w-[min(70vw,36rem)] -translate-x-1/2 rounded-b-md"
          style={{ background: PAPER, boxShadow: "0 0 40px 10px rgb(246 240 220 / 0.35)" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-xl items-center px-5 py-20">
        <div
          className="relative w-full px-6 py-8 text-ink shadow-[0_20px_50px_rgba(0,0,0,0.55)] sm:px-10 sm:py-10"
          style={{ background: PAPER, transform: "rotate(-0.6deg)" }}
        >
          {/* Postage stamp. */}
          <svg
            aria-hidden
            viewBox="0 0 48 58"
            className="absolute top-5 right-5 h-[58px] w-12 rotate-3 sm:top-7 sm:right-8"
            fill="none"
          >
            <rect x="1" y="1" width="46" height="56" fill={LETTER_BOX_GREEN} stroke={PAPER} strokeWidth="2" strokeDasharray="3 3" />
            <rect x="6" y="6" width="36" height="46" stroke={PAPER} strokeOpacity="0.6" />
            <rect x="12" y="20" width="24" height="17" stroke={PAPER} strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 21l12 9 12-9" stroke={PAPER} strokeWidth="2" strokeLinejoin="round" />
          </svg>

          <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "#236e41" }}>
            {t.contact}
          </p>
          <h1 className="mt-2 pr-16 font-display text-3xl font-semibold sm:text-4xl">
            {status === "sent" ? t.sentTitle : t.contactTitle}
          </h1>

          {status === "sent" ? (
            <div role="status" className="mt-4">
              <p style={{ color: FADED_INK }}>{t.sentBody}</p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-6 rounded-full border px-4 py-2 text-sm font-medium hover:bg-black/5"
                style={{ borderColor: RULE }}
              >
                {t.writeAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-3">
              <p className="pr-16 text-sm leading-relaxed" style={{ color: FADED_INK }}>
                {t.contactIntro}
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium" style={{ color: FADED_INK }}>
                  {t.yourName}
                  <input name="name" required maxLength={100} autoComplete="name" className={FIELD} style={{ borderColor: RULE }} />
                </label>
                <label className="block text-sm font-medium" style={{ color: FADED_INK }}>
                  {t.yourEmail}
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                    className={FIELD}
                    style={{ borderColor: RULE }}
                  />
                </label>
              </div>
              <label className="mt-5 block text-sm font-medium" style={{ color: FADED_INK }}>
                {t.yourMessage}
                {/* Ruled like letter paper: one line per row of text. */}
                <textarea
                  name="message"
                  required
                  maxLength={5000}
                  rows={6}
                  className="mt-1 block w-full resize-y border-0 bg-transparent px-0 py-0 text-base leading-8 text-ink outline-none focus-visible:outline-none"
                  style={{
                    backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 31px, ${RULE} 31px 32px)`,
                    backgroundAttachment: "local",
                  }}
                />
              </label>
              {/* Left empty by people, filled in by bots. */}
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
                  style={{ background: "#236e41" }}
                >
                  {status === "sending" ? t.sending : t.send}
                </button>
                <p role="alert" className="text-sm font-medium text-[#a3261f]">
                  {status === "error" ? t.sendError : ""}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onLeave}
        className="fixed top-5 left-5 z-10 rounded-full bg-[#14161b]/85 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur hover:bg-[#14161b] focus-visible:outline-white"
      >
        ← {t.backToRoom} <span className="opacity-60 [@media(hover:none)]:hidden">(Esc)</span>
      </button>
    </div>
  );
}
