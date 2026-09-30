import type { ReactNode } from "react";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

export function SectionHeading({ id, eyebrow, title, children }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">{eyebrow}</p>
        <h2 id={id} className="mt-1 font-display text-4xl leading-none sm:text-5xl">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
