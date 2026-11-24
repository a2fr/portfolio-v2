"use client";

import type { Strings } from "@/i18n/strings";
import { RESUME_PDF } from "./ResumePaper";

export type GuideKey = keyof Strings["guide"];

/** Where each key point of the room sits on screen, in CSS pixels, seen from the room's resting camera. */
export type GuideLayout = {
  width: number;
  height: number;
  /** Left edge of the room on screen: the labels stay in the empty dusk to its left. */
  roomLeft: number;
  anchors: Record<GuideKey, { x: number; y: number }>;
  /** The top of the USB key, seen from the camera's pose over the CV. */
  usb: { x: number; y: number };
};

// Top to bottom, as they sit in the room.
const ORDER: GuideKey[] = ["mailbox", "flags", "diplomas", "screen", "paper"];
// These leave their object diagonally, up and to the left, before running left to their label.
const RISING: Partial<Record<GuideKey, number>> = { mailbox: 70, flags: 60 };

const LABEL_WIDTH = 132;
const LABEL_HEIGHT = 32; // one short title
const GAP = 10;
const MARGIN = 24; // between the labels and the room, and the labels and the window's edge
const MIN_COLUMN = 110; // below this the room fills the width: no room for the guide

/** Whether the empty space left of the room is wide enough for the labels (not on phones and tablets). */
export function guideFits(layout: GuideLayout | null): boolean {
  return !!layout && Math.min(LABEL_WIDTH, layout.roomLeft - 2 * MARGIN) >= MIN_COLUMN;
}

/**
 * A quiet first-visit guide: thin gold leaders from each thing you can click in the room to a small label in
 * the empty space on the left, saying what it opens.
 */
export function RoomGuide({ layout, t, visible }: { layout: GuideLayout | null; t: Strings; visible: boolean }) {
  if (!layout || !guideFits(layout)) return null;
  const right = layout.roomLeft - MARGIN;
  const width = Math.min(LABEL_WIDTH, right - MARGIN);
  const left = right - width;

  // Each label wants the height of its object (higher for the rising ones), then they are pushed apart.
  const slots = ORDER.map((key) => {
    const a = layout.anchors[key];
    return { key, a, y: a.y - (RISING[key] ?? 0) };
  }).sort((p, q) => p.y - q.y);
  const step = LABEL_HEIGHT + GAP;
  const top = MARGIN + LABEL_HEIGHT / 2;
  const bottom = layout.height - MARGIN - LABEL_HEIGHT / 2;
  for (let i = 0; i < slots.length; i++) slots[i].y = Math.max(slots[i].y, i ? slots[i - 1].y + step : top);
  for (let i = slots.length - 1; i >= 0; i--)
    slots[i].y = Math.min(slots[i].y, i < slots.length - 1 ? slots[i + 1].y - step : bottom);

  return (
    <div
      aria-hidden
      className={`room-guide pointer-events-none absolute inset-0 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <svg className="absolute inset-0 h-full w-full overflow-visible" width={layout.width} height={layout.height}>
        {slots.map(({ key, a, y }) => {
          // Diagonal at 45° until level with the label, then straight to it.
          const rise = Math.abs(a.y - y);
          const bendX = Math.max(right + 16, a.x - rise);
          return (
            <g key={key}>
              {/* A soft dark halo keeps the thin gold line readable where it crosses the pale walls. */}
              <polyline
                points={`${a.x},${a.y} ${bendX},${y} ${right},${y}`}
                fill="none"
                stroke="rgb(20 16 10 / 0.28)"
                strokeWidth={3}
                strokeLinejoin="round"
              />
              <polyline
                points={`${a.x},${a.y} ${bendX},${y} ${right},${y}`}
                fill="none"
                stroke="var(--guide-gold)"
                strokeOpacity={0.9}
                strokeWidth={1.25}
                strokeLinejoin="round"
              />
              <circle cx={a.x} cy={a.y} r={6} fill="none" stroke="var(--guide-gold)" strokeOpacity={0.5} className="room-guide-pulse" />
              <circle cx={a.x} cy={a.y} r={2.5} fill="var(--guide-gold)" />
              <circle cx={right} cy={y} r={1.5} fill="var(--guide-gold)" />
            </g>
          );
        })}
      </svg>
      {slots.map(({ key, y }) => (
        <div
          key={key}
          className="room-guide-label absolute flex items-center rounded-lg px-3.5"
          style={{ left, top: y - LABEL_HEIGHT / 2, width, height: LABEL_HEIGHT }}
        >
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--guide-gold)" }}>
            {t.guide[key]}
          </span>
        </div>
      ))}
    </div>
  );
}

// The USB key's label stands straight above the key, on the empty desk beside the sheet.
const USB_RISE = 64;
const USB_LABEL_HALF = 110; // half the room kept for the longest translation

/** Whether the label fits above the USB key without running off the window. */
export function usbGuideFits(layout: GuideLayout | null): boolean {
  if (!layout) return false;
  const { x, y } = layout.usb;
  return x + USB_LABEL_HALF + MARGIN <= layout.width && y - USB_RISE - LABEL_HEIGHT - MARGIN >= 0;
}

/** Over the CV: a gold leader from the USB key to a label that downloads the CV, like clicking the key. */
export function UsbGuide({ layout, label, visible }: { layout: GuideLayout | null; label: string; visible: boolean }) {
  if (!layout || !usbGuideFits(layout)) return null;
  const { x, y } = layout.usb;
  const start = y - 4; // on the tip of the key's plug
  const end = start - USB_RISE;
  const points = `${x},${start} ${x},${end}`;
  return (
    <div className={`room-guide absolute inset-0 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
      <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible" width={layout.width} height={layout.height}>
        <polyline points={points} fill="none" stroke="rgb(20 16 10 / 0.28)" strokeWidth={3} />
        <polyline points={points} fill="none" stroke="var(--guide-gold)" strokeOpacity={0.9} strokeWidth={1.25} />
        <circle cx={x} cy={start} r={6} fill="none" stroke="var(--guide-gold)" strokeOpacity={0.5} className="room-guide-pulse" />
        <circle cx={x} cy={start} r={2.5} fill="var(--guide-gold)" />
      </svg>
      <a
        href={RESUME_PDF.href}
        download={RESUME_PDF.fileName}
        tabIndex={visible ? 0 : -1}
        className={`room-guide-label absolute flex -translate-x-1/2 items-center rounded-lg px-3.5 whitespace-nowrap transition-colors hover:bg-black/70 focus-visible:outline-1 focus-visible:outline-[var(--guide-gold)] ${
          visible ? "pointer-events-auto" : ""
        }`}
        style={{ left: x, top: end - LABEL_HEIGHT, height: LABEL_HEIGHT }}
      >
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--guide-gold)" }}>
          {label}
        </span>
      </a>
    </div>
  );
}
