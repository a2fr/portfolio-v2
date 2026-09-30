import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export const HomeIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" />
  </svg>
);

export const LibraryIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M5 4v16M9.5 4v16" />
    <path d="m14 4.8 4.6 15" />
  </svg>
);

export const ArtistIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="8.5" r="4" />
    <path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" />
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const PrevIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M6 5v14" />
    <path d="M18.5 5.5v13L9 12z" fill="currentColor" />
  </svg>
);

export const NextIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M18 5v14" />
    <path d="M5.5 5.5v13L15 12z" fill="currentColor" />
  </svg>
);

export const ArrowUpRightIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M7 17 17 7M8.5 7H17v8.5" />
  </svg>
);

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
