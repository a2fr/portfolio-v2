import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileNowPlaying } from "@/components/layout/MobileNowPlaying";
import { NowPlayingPanel } from "@/components/layout/NowPlayingPanel";
import { NowPlayingProvider } from "@/components/layout/NowPlayingProvider";
import { ScrollReset } from "@/components/layout/ScrollReset";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { profile } from "@/data/profile";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: `${profile.name} — ${profile.title}, ${profile.specialty}`,
    template: `%s — ${profile.name}`,
  },
  description: `${profile.name} is a software engineer focused on backend and full-stack development. Explore the discography: products, professional eras and side projects.`,
};

export const viewport: Viewport = {
  themeColor: "#0b0a09",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body>
        <a
          href="#main"
          className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-full bg-paper px-4 py-2 text-sm text-ink-950 focus:translate-y-0"
        >
          Skip to content
        </a>
        <MotionProvider>
          <NowPlayingProvider>
            <div className="lg:grid lg:h-dvh lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-2 lg:p-2 xl:grid-cols-[272px_minmax(0,1fr)_320px] 2xl:grid-cols-[300px_minmax(0,1fr)_360px]">
              <Sidebar />
              <div
                id="scroll-root"
                className="scrollbar-thin min-h-dvh bg-ink-900 lg:min-h-0 lg:overflow-y-auto lg:rounded-2xl"
              >
                <TopBar />
                <main id="main" tabIndex={-1} className="pb-40 outline-none lg:pb-24 xl:pb-10">
                  {children}
                </main>
              </div>
              <NowPlayingPanel />
            </div>
            <ScrollReset />
            <MobileNowPlaying />
            <MobileNav />
          </NowPlayingProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
