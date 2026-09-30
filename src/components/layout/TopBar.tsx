import Link from "next/link";
import { profile } from "@/data/profile";
import { SearchBox } from "./SearchBox";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-ink-900/85 px-4 py-3 backdrop-blur-md sm:px-6 lg:bg-ink-900/70">
      <Link href="/" className="shrink-0 rounded-full lg:hidden" aria-label={`${profile.name} — home`}>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-signal font-display text-lg text-ink-950">
          {profile.initials}
        </span>
      </Link>
      <SearchBox />
      <p className="ml-auto hidden items-center gap-2 text-xs text-muted md:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
        {profile.status}
      </p>
    </header>
  );
}
