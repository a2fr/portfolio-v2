import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import { Intro, IntroGate } from "@/components/Intro";
import { profile } from "@/data/profile";
import { LanguageProvider } from "@/i18n/language";
import { Say } from "@/i18n/Say";
import { requestLanguage } from "@/i18n/server";
import { strings } from "@/i18n/strings";
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

export async function generateMetadata(): Promise<Metadata> {
  const lang = await requestLanguage();
  return {
    title: { default: strings[lang].title, template: `%s | ${profile.name}` },
    description: profile.intro,
  };
}

export const viewport: Viewport = {
  themeColor: "#f1f4f2",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Rendered straight away in the visitor's language (their flag choice, else their browser's), so no English
  // shows first.
  const lang = await requestLanguage();
  return (
    <html
      lang={lang}
      className={`${bricolage.variable} ${plex.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <LanguageProvider lang={lang}>
          <IntroGate />
          <Intro />
          <a
            href="#main"
            className="fixed top-3 left-3 z-50 -translate-y-20 bg-ink px-4 py-2 text-sm text-paper focus:translate-y-0"
          >
            <Say k="skipToContent" />
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
                <Say k="footerNote" />
              </p>
            </footer>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
