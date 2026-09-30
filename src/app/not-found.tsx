import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center px-4 sm:px-8">
      <p className="font-mono text-[11px] tracking-[0.18em] text-signal-soft uppercase">Error 404</p>
      <h1 className="mt-2 font-display text-6xl leading-none sm:text-7xl">Track not found</h1>
      <p className="mt-4 max-w-md text-muted">This release isn’t in the discography — yet.</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-signal px-6 py-3 text-sm font-medium text-ink-950 transition-colors hover:bg-signal-soft"
      >
        Back to home
      </Link>
    </div>
  );
}
