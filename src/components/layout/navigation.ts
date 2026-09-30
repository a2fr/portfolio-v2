import { ArtistIcon, HomeIcon, LibraryIcon } from "./icons";

export const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/albums", label: "Library", icon: LibraryIcon },
  { href: "/about", label: "Artist", icon: ArtistIcon },
] as const;
