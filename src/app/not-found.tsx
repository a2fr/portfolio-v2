import Link from "next/link";
import { Say } from "@/i18n/Say";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-start justify-center px-5 sm:px-8">
      <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl"><Say k="notFoundTitle" /></h1>
      <p className="mt-4 max-w-md text-soft"><Say k="notFoundBody" /></p>
      <Link href="/" className="mt-8 bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-cobalt">
        <Say k="goHome" />
      </Link>
    </div>
  );
}
