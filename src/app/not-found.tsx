import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-start justify-center px-5 sm:px-8">
      <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">This page does not exist</h1>
      <p className="mt-4 max-w-md text-soft">The address may be wrong, or the project was renamed.</p>
      <Link href="/" className="mt-8 bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-cobalt">
        Go to the home page
      </Link>
    </div>
  );
}
