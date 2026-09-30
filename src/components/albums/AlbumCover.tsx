import Image from "next/image";
import type { ReactNode } from "react";
import { albumKindLabel } from "@/data/albums";
import type { Album, CoverArt } from "@/types/album";

interface AlbumCoverProps {
  album: Album;
  className?: string;
  /** Hide cover typography (for small thumbnails). */
  bare?: boolean;
  sizes?: string;
}

/**
 * Temporary generative cover. Everything is drawn in a 100×100 viewBox so it
 * scales cleanly from a sidebar thumbnail to a full hero. Set `cover.image`
 * in the data to swap in final artwork.
 */
export function AlbumCover({ album, className = "", bare = false, sizes = "320px" }: AlbumCoverProps) {
  const { cover } = album;

  return (
    <div
      className={`relative aspect-square overflow-hidden ${className}`}
      style={{ background: cover.background }}
      aria-hidden="true"
    >
      {cover.image ? (
        <Image src={cover.image} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" role="presentation">
          <Artwork cover={cover} />
          {!bare && <CoverType album={album} />}
        </svg>
      )}
    </div>
  );
}

function CoverType({ album }: { album: Album }) {
  const { ink } = album.cover;
  const lines = breakTitle(album.title);
  const size = lines.length === 1 ? 13 : lines.length === 2 ? 11 : 9.5;
  const baseline = 92;

  return (
    <g fill={ink}>
      <text x="7" y="10" fontSize="3.6" letterSpacing="0.4" style={{ fontFamily: "var(--font-mono)" }}>
        {album.catalog}
      </text>
      <text
        x="93"
        y="10"
        fontSize="3.6"
        letterSpacing="0.4"
        textAnchor="end"
        style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
      >
        {albumKindLabel[album.kind]}
      </text>
      {lines.map((line, i) => (
        <text
          key={line}
          x="6.5"
          y={baseline - (lines.length - 1 - i) * size * 0.92}
          fontSize={size}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function breakTitle(title: string, max = 13): string[] {
  const words = title.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function Artwork({ cover }: { cover: CoverArt }): ReactNode {
  const { ink, accent } = cover;

  switch (cover.variant) {
    // Piloteat — a plate seen from above; concentric service rings.
    case "plate":
      return (
        <g fill="none" stroke={ink}>
          <circle cx="62" cy="44" r="30" strokeWidth="0.6" opacity="0.9" />
          <circle cx="62" cy="44" r="23" strokeWidth="0.35" opacity="0.6" />
          <circle cx="62" cy="44" r="15" fill={accent} fillOpacity="0.35" strokeWidth="0.35" />
          <circle cx="62" cy="44" r="4" fill={ink} stroke="none" />
          <path d="M 62 14 A 30 30 0 0 1 92 44" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="20" y1="20" x2="20" y2="62" strokeWidth="0.5" opacity="0.7" />
          <line x1="16" y1="20" x2="16" y2="34" strokeWidth="0.5" opacity="0.7" />
          <line x1="24" y1="20" x2="24" y2="34" strokeWidth="0.5" opacity="0.7" />
        </g>
      );

    // Alten Labs — a VR horizon: perspective floor + rising orb.
    case "horizon":
      return (
        <g stroke={ink} fill="none">
          <circle cx="50" cy="44" r="15" fill={accent} fillOpacity="0.9" stroke="none" />
          <circle cx="50" cy="44" r="21" strokeWidth="0.3" opacity="0.5" />
          <line x1="0" y1="58" x2="100" y2="58" strokeWidth="0.5" />
          {[-60, -30, -10, 10, 30, 50, 70, 90, 110, 130, 160].map((x) => (
            <line key={x} x1="50" y1="58" x2={x} y2="100" strokeWidth="0.3" opacity="0.55" />
          ))}
          {[61, 65.5, 72, 81, 94].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} strokeWidth="0.3" opacity="0.55" />
          ))}
        </g>
      );

    // N7 / EDF — test signals: a waveform and a DTMF keypad.
    case "signal": {
      const bars = Array.from({ length: 30 }, (_, i) => {
        const h = 6 + Math.abs(Math.sin(i * 0.7) * 16 + Math.sin(i * 1.9) * 8);
        return { x: 8 + i * 2.8, h };
      });
      return (
        <g>
          {bars.map(({ x, h }, i) => (
            <rect
              key={x}
              x={x}
              y={50 - h / 2}
              width="1.3"
              height={h}
              rx="0.6"
              fill={i === 17 ? accent : ink}
              opacity={i === 17 ? 1 : 0.85}
            />
          ))}
          <line x1="6" y1="50" x2="94" y2="50" stroke={ink} strokeWidth="0.2" opacity="0.5" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle
              key={i}
              cx={72 + (i % 3) * 5.5}
              cy={16 + Math.floor(i / 3) * 5.5}
              r="1.3"
              fill={i === 4 ? accent : "none"}
              stroke={ink}
              strokeWidth="0.35"
            />
          ))}
        </g>
      );
    }

    // FD Assurances — desktop windows and panes.
    case "panes":
      return (
        <g fill="none" stroke={ink} strokeWidth="0.5">
          <rect x="22" y="16" width="64" height="44" rx="1.5" fill={accent} fillOpacity="0.12" />
          <line x1="22" y1="21" x2="86" y2="21" />
          {[25, 28, 31].map((cx) => (
            <circle key={cx} cx={cx} cy="18.5" r="0.8" fill={ink} stroke="none" />
          ))}
          <rect x="26" y="25" width="16" height="31" fill={accent} fillOpacity="0.5" stroke="none" />
          <rect x="46" y="25" width="36" height="8" />
          <rect x="46" y="36" width="36" height="8" />
          <rect x="46" y="47" width="17" height="9" fill={ink} stroke="none" />
          <rect x="10" y="30" width="30" height="20" rx="1.2" fill="#e6e0d2" />
          <line x1="10" y1="34" x2="40" y2="34" />
          <path d="M 70 52 l 0 8 l 2.2 -2 l 1.6 3.2 l 1.4 -0.7 l -1.6 -3.1 l 3 -0.2 z" fill={ink} stroke="none" />
        </g>
      );

    // VR crane — the truss of a construction crane.
    case "lattice": {
      const jib = Array.from({ length: 15 }, (_, i) => 6 + i * 6);
      const tower = Array.from({ length: 12 }, (_, i) => 30 + i * 6);
      return (
        <g stroke={ink} fill="none" strokeWidth="0.6">
          <line x1="6" y1="24" x2="96" y2="24" />
          <line x1="6" y1="30" x2="96" y2="30" />
          {jib.map((x, i) => (
            <line key={x} x1={x} y1={i % 2 ? 24 : 30} x2={x + 6} y2={i % 2 ? 30 : 24} />
          ))}
          <line x1="74" y1="30" x2="74" y2="100" />
          <line x1="82" y1="30" x2="82" y2="100" />
          {tower.map((y, i) => (
            <line key={y} x1={i % 2 ? 74 : 82} y1={y} x2={i % 2 ? 82 : 74} y2={y + 6} />
          ))}
          <path d="M 74 24 L 78 10 L 82 24" />
          <line x1="78" y1="10" x2="10" y2="24" strokeWidth="0.3" />
          <line x1="78" y1="10" x2="96" y2="24" strokeWidth="0.3" />
          <line x1="34" y1="30" x2="34" y2="54" strokeWidth="0.35" />
          <rect x="30" y="54" width="8" height="6" fill={accent} stroke="none" />
        </g>
      );
    }

    // Computer vision — a halftone field with a detection box.
    case "pixels": {
      const dots: { x: number; y: number; r: number }[] = [];
      // Rows kept clear of the catalogue line and the title block.
      for (let row = 2; row < 10; row++) {
        for (let col = 0; col < 14; col++) {
          const x = 8 + col * 6.5;
          const y = 8 + row * 6.5;
          const d = Math.hypot(x - 58, y - 44);
          dots.push({ x, y, r: Math.max(0.35, 2.6 - d / 14) });
        }
      }
      return (
        <g>
          {dots.map(({ x, y, r }) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={cover.ink} opacity="0.8" />
          ))}
          <g stroke={accent} strokeWidth="0.8" fill="none">
            <rect x="40" y="26" width="36" height="36" strokeWidth="0.35" />
            <path d="M 40 32 V 26 H 46 M 70 26 H 76 V 32 M 76 56 V 62 H 70 M 46 62 H 40 V 56" />
          </g>
          <rect x="40" y="21" width="13" height="4.4" fill={accent} />
          <text x="41.2" y="24.3" fontSize="3" fill="#0c0e0f" style={{ fontFamily: "var(--font-mono)" }}>
            detect
          </text>
        </g>
      );
    }

    // Android — modular UI blocks inside a device frame.
    case "modules":
      return (
        <g>
          <rect x="52" y="12" width="36" height="66" rx="6" fill="none" stroke={ink} strokeWidth="0.7" />
          <rect x="66" y="15" width="8" height="1.6" rx="0.8" fill={ink} />
          <rect x="56" y="21" width="28" height="16" rx="3" fill={accent} />
          <rect x="56" y="40" width="13" height="13" rx="3" fill={ink} opacity="0.85" />
          <rect x="71" y="40" width="13" height="13" rx="3" fill="none" stroke={ink} strokeWidth="0.5" />
          <rect x="56" y="56" width="28" height="5" rx="2.5" fill={ink} opacity="0.35" />
          <rect x="56" y="64" width="20" height="5" rx="2.5" fill={ink} opacity="0.35" />
          <rect x="14" y="22" width="26" height="26" rx="7" fill="none" stroke={ink} strokeWidth="0.5" opacity="0.6" />
          <rect x="20" y="28" width="26" height="26" rx="7" fill={accent} opacity="0.55" />
        </g>
      );
  }
}
