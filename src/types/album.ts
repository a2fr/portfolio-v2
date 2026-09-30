/**
 * Release formats of the discography.
 * - main-release: the flagship product
 * - era: a professional experience
 * - ep: a professional / business project
 * - b-side: a side project or experiment
 */
export type AlbumKind = "main-release" | "era" | "ep" | "b-side";

/** Generative placeholder cover styles. Replace with real artwork later via `cover.image`. */
export type CoverVariant =
  | "plate"
  | "horizon"
  | "signal"
  | "panes"
  | "lattice"
  | "pixels"
  | "modules";

export interface CoverArt {
  variant: CoverVariant;
  /** CSS background (usually a gradient) for the cover surface. */
  background: string;
  /** Main line / typography color drawn on the cover. */
  ink: string;
  /** Secondary highlight color. */
  accent: string;
  /** Optional final artwork. When set, it replaces the generative cover. */
  image?: string;
}

export interface Track {
  title: string;
  notes: string;
}

export interface AlbumLink {
  label: string;
  href: string;
  description?: string;
}

export interface Album {
  slug: string;
  /** Catalogue number, used as a label-style identifier. */
  catalog: string;
  title: string;
  subtitle: string;
  kind: AlbumKind;
  role?: string;
  /** Full period, e.g. "Sep 2025 – Mar 2026". Omitted when not confirmed. */
  period?: string;
  /** Short year label shown on cards. Omitted when not confirmed. */
  year?: string;
  summary: string;
  /** Technologies — the "instruments" of the release. */
  stack: string[];
  /** Themes — the "genres" of the release. */
  tags: string[];
  tracks: Track[];
  links: AlbumLink[];
  cover: CoverArt;
}
