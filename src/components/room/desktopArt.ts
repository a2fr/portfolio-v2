/**
 * Artwork of the laptop's desktop, as SVG markup. The same drawing is used as the wallpaper of the
 * full-page desktop and as the texture on the 3D laptop display, so the zoom lands on what it showed.
 */

export const BAR_COLOR = "#131313";
export const DOCK_COLOR = "rgba(24, 12, 28, 0.55)";

/** Top bar height, dock width, bar text size and bar side padding of the full-page desktop, in CSS pixels. */
export const BAR_PX = 28;
export const DOCK_PX = 64;
/** Dock launcher icons: size, gap above the first one, and space between them, in CSS pixels. */
export const DOCK_ICON_PX = 44;
export const DOCK_ICON_TOP_PX = 10;
export const DOCK_ICON_GAP_PX = 16;

/** Apps pinned to the dock, top to bottom. Their icons are drawn on the 3D display too. */
export const DOCK_APPS = [
  { id: "alten", name: "Alten Labs", icon: "/apps/alten.png" },
  { id: "edf", name: "EDF", icon: "/apps/edf.png" },
  { id: "groupe-fd", name: "Groupe FD", icon: "/apps/groupe-fd.png" },
  { id: "piloteat", name: "Piloteat", icon: "/apps/piloteat.png" },
] as const;
export type DockAppId = (typeof DOCK_APPS)[number]["id"];

/** Index of the first dock app after the separator line (the experiences above it, the personal project below). */
export const DOCK_SEPARATOR_BEFORE = DOCK_APPS.length - 1;
/** Extra space the separator adds between its two icons, and the separator line's width and thickness, in CSS pixels. */
const DOCK_SEPARATOR_EXTRA_PX = 12;
const DOCK_SEPARATOR_WIDTH_PX = 28;
const DOCK_SEPARATOR_THICKNESS_PX = 1;
export const DOCK_SEPARATOR_COLOR = "rgba(255, 255, 255, 0.22)";

/** Box of the dock icon at `index`, in CSS pixels of the full-page desktop. */
export function dockIconBox(index: number) {
  const x = (DOCK_PX - DOCK_ICON_PX) / 2;
  const extra = index >= DOCK_SEPARATOR_BEFORE ? DOCK_SEPARATOR_EXTRA_PX : 0;
  const y = BAR_PX + DOCK_ICON_TOP_PX + index * (DOCK_ICON_PX + DOCK_ICON_GAP_PX) + extra;
  return { x, y, size: DOCK_ICON_PX };
}

/** Box of the thin line separating the dock's two groups, in CSS pixels of the full-page desktop. */
export function dockSeparatorBox() {
  const above = dockIconBox(DOCK_SEPARATOR_BEFORE - 1);
  const below = dockIconBox(DOCK_SEPARATOR_BEFORE);
  const middle = (above.y + above.size + below.y) / 2;
  return {
    x: (DOCK_PX - DOCK_SEPARATOR_WIDTH_PX) / 2,
    y: middle - DOCK_SEPARATOR_THICKNESS_PX / 2,
    width: DOCK_SEPARATOR_WIDTH_PX,
    height: DOCK_SEPARATOR_THICKNESS_PX,
  };
}
const BAR_TEXT_PX = 13;
const BAR_PAD_PX = 12;

// Light to dark; the mark is lit from the upper left, like the jellyfish it stands in for.
const SHADES = ["#e9b0dc", "#d48cc9", "#bd6cb6", "#a352a3", "#883c8f", "#6d2a78", "#541d62"];

type Point = [number, number];
type Facet = [Point, Point, Point, number]; // three corners and a shade

/** Support emblem (gem, two wings, blade) on a 1000 x 1000 grid, cut into low-poly facets. */
function emblemFacets(): Facet[] {
  // Gem
  const [a, b, c, d, e, f]: Point[] = [[420, 155], [590, 155], [627, 222], [505, 340], [385, 222], [500, 218]];
  const gem: Facet[] = [
    [a, b, f, 0],
    [b, c, f, 2],
    [c, d, f, 4],
    [d, e, f, 3],
    [e, a, f, 1],
  ];

  // Blade
  const [p1, p2, p3, p4, p5, q1, q2]: Point[] = [[465, 455], [535, 455], [615, 730], [500, 845], [385, 730], [497, 590], [503, 735]];
  const blade: Facet[] = [
    [p1, p2, q1, 1],
    [p2, p3, q1, 3],
    [p1, q1, p5, 0],
    [q1, p3, q2, 4],
    [q1, q2, p5, 2],
    [p5, q2, p4, 4],
    [q2, p3, p4, 6],
  ];

  // Left wing; the right one is its mirror image, a shade darker.
  const [w1, m, w2, w3, w4, w5, w6, w7, w8]: Point[] = [
    [75, 305], [215, 305], [340, 305], [420, 375], [420, 408], [340, 570], [270, 465], [305, 420], [222, 420],
  ];
  const wing: Facet[] = [
    [w1, m, w8, 1],
    [m, w2, w8, 0],
    [w2, w7, w8, 2],
    [w2, w3, w7, 1],
    [w3, w4, w7, 3],
    [w7, w4, w5, 4],
    [w7, w5, w6, 5],
  ];
  const mirror = ([x, y]: Point): Point => [1000 - x, y];
  const rightWing: Facet[] = wing.map(([x, y, z, shade]) => [mirror(x), mirror(y), mirror(z), Math.min(SHADES.length - 1, shade + 1)]);

  return [...gem, ...blade, ...wing, ...rightWing];
}

/** Wallpaper drawn on a 1600 x 1000 canvas: aubergine-to-orange planes and the faceted emblem. */
function wallpaperMarkup() {
  const facets = emblemFacets()
    .map(([x, y, z, shade]) => {
      const fill = SHADES[shade];
      // A hairline stroke in the facet's own colour closes the seams between neighbours.
      return `<polygon points="${x.join(",")} ${y.join(",")} ${z.join(",")}" fill="${fill}" stroke="${fill}" stroke-width="1.2" stroke-linejoin="round"/>`;
    })
    .join("");

  return `
<defs>
  <linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1600" y2="1000">
    <stop offset="0" stop-color="#2b0a36"/>
    <stop offset="0.34" stop-color="#5f1352"/>
    <stop offset="0.6" stop-color="#8d1d5b"/>
    <stop offset="0.84" stop-color="#c43a41"/>
    <stop offset="1" stop-color="#e4592b"/>
  </linearGradient>
</defs>
<rect x="-1600" y="-1000" width="4800" height="3000" fill="url(#bg)"/>
<polygon points="0,0 760,0 0,640" fill="#12001c" opacity="0.26"/>
<polygon points="760,0 1600,0 1600,430" fill="#ff5fa8" opacity="0.07"/>
<polygon points="1180,0 1600,0 1600,210" fill="#ffffff" opacity="0.05"/>
<polygon points="1600,430 1600,1000 1010,1000" fill="#ff7a2e" opacity="0.24"/>
<polygon points="1600,700 1600,1000 1330,1000" fill="#ffb347" opacity="0.14"/>
<polygon points="0,640 500,1000 0,1000" fill="#e95420" opacity="0.2"/>
<polygon points="760,0 1600,430 1010,1000 500,1000 0,640" fill="#a2257a" opacity="0.1"/>
<g transform="translate(510 200) scale(0.58)">${facets}</g>`;
}

function svgDocument(width: number, height: number, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

/** Wallpaper alone, as a CSS `url(...)` value. Meant to be shown with `background-size: cover`. */
export function wallpaperCssUrl() {
  return `url("data:image/svg+xml,${encodeURIComponent(svgDocument(1600, 1000, wallpaperMarkup()))}")`;
}

/** Part of the display picture that fills the page once the camera is inside the screen. */
export type DesktopView = { x: number; y: number; width: number; height: number; /** picture pixels per CSS pixel */ scale: number };

/** One status indicator of the top bar, placed in CSS pixels as the page lays it out. */
export type BarItem = { x: number; y: number; width: number; height: number } & (
  | { svg: string } // inner markup of a 24 x 24 icon
  | { text: string; weight: string }
);

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/**
 * Whole desktop (wallpaper, top bar, dock) as an image source, for the 3D laptop display.
 * Everything is laid out inside `view` exactly as the full-page desktop lays it out in the page,
 * and bleeds past it to the display's edges, so the end of the zoom and the page coincide.
 * The clock is centred, unless `clockRight` (CSS pixels, the compact bar of a narrow page) gives where it ends.
 */
export function desktopImageSrc(
  width: number,
  height: number,
  view: DesktopView,
  name: string,
  clock: string,
  items: BarItem[] = [],
  clockRight?: number,
) {
  const barBottom = view.y + BAR_PX * view.scale;
  const barMiddle = view.y + (BAR_PX * view.scale) / 2;
  const dockRight = view.x + DOCK_PX * view.scale;
  const separator = dockSeparatorBox();
  const font = `font-family="Ubuntu, system-ui, sans-serif" font-size="${BAR_TEXT_PX * view.scale}" fill="#fff" dominant-baseline="central"`;
  const text = `${font} font-weight="600"`;
  const status = items
    .map((item) => {
      const x = view.x + item.x * view.scale;
      const y = view.y + item.y * view.scale;
      const w = item.width * view.scale;
      const h = item.height * view.scale;
      return "svg" in item
        ? `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 24 24" fill="#fff" color="#fff">${item.svg}</svg>`
        : `<text x="${x}" y="${y + h / 2}" ${font} font-weight="${item.weight}">${escapeXml(item.text)}</text>`;
    })
    .join("");
  const body = `
<svg x="${view.x}" y="${view.y}" width="${view.width}" height="${view.height}" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" overflow="visible">${wallpaperMarkup()}</svg>
<rect y="${barBottom}" width="${dockRight}" height="${height - barBottom}" fill="${DOCK_COLOR}"/>
<rect x="${view.x + separator.x * view.scale}" y="${view.y + separator.y * view.scale}" width="${separator.width * view.scale}" height="${separator.height * view.scale}" rx="${(separator.height * view.scale) / 2}" fill="${DOCK_SEPARATOR_COLOR}"/>
<rect width="${width}" height="${barBottom}" fill="${BAR_COLOR}"/>
<text x="${view.x + BAR_PAD_PX * view.scale}" y="${barMiddle}" ${text}>${escapeXml(name)}</text>
<text x="${clockRight === undefined ? view.x + view.width / 2 : view.x + clockRight * view.scale}" y="${barMiddle}" text-anchor="${clockRight === undefined ? "middle" : "end"}" xml:space="preserve" ${text}>${clock}</text>
${status}`;
  return `data:image/svg+xml,${encodeURIComponent(svgDocument(width, height, body))}`;
}
