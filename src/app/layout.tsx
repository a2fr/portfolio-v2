import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  IBM_Plex_Sans,
} from "next/font/google";
import Link from "next/link";
import { Intro, IntroGate } from "@/components/Intro";
import { profile } from "@/data/profile";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: `${profile.name}, ${profile.role.toLowerCase()}`,
    template: `%s | ${profile.name}`,
  },
  description: profile.intro,
};

export const viewport: Viewport = {
  themeColor: "#f1f4f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${plex.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <IntroGate />
        <Intro />
        <a
          href="#main"
          className="fixed top-3 left-3 z-50 -translate-y-20 bg-ink px-4 py-2 text-sm text-paper focus:translate-y-0"
        >
          Skip to content
        </a>
        <div id="site">
          <header className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-5 pt-6 sm:px-8">
            <Link href="/" className="font-display text-lg font-semibold">
              {profile.name}
            </Link>
          </header>
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <footer className="mx-auto mt-24 max-w-6xl border-t border-line px-5 py-8 text-sm text-soft sm:px-8">
            <p>
              Skeleton preview. Dashed blue blocks are placeholders waiting for
              real notes; everything else is confirmed.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
