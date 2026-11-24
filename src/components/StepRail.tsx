"use client";

import { useEffect, useState } from "react";

interface RailStep {
  id: string;
  name: string;
}

/**
 * The five steps as a rail that follows the reader: it stays in view and
 * marks the step currently being read.
 */
export function StepRail({ steps, label }: { steps: RailStep[]; label: string }) {
  const [active, setActive] = useState(steps[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    for (const step of steps) {
      const el = document.getElementById(step.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [steps]);

  return (
    <nav
      aria-label={label}
      className="sticky top-0 z-10 -mx-5 border-b border-line bg-paper/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-8 lg:mx-0 lg:self-start lg:border-b-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
    >
      <ol className="flex items-center gap-1.5 overflow-x-auto lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-visible">
        {steps.map((step, i) => {
          const isActive = step.id === active;
          return (
            <li key={step.id} className="flex shrink-0 items-center gap-1.5 lg:block">
              {i > 0 && <span aria-hidden className="block h-px w-2 bg-line sm:w-8 lg:ml-[15px] lg:h-7 lg:w-px" />}
              <a
                href={`#${step.id}`}
                aria-current={isActive ? "step" : undefined}
                className="group flex items-center gap-2 lg:gap-3"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 sm:h-8 sm:w-8 items-center justify-center rounded-full border text-sm font-medium transition-colors ${
                    isActive
                      ? "border-cobalt bg-cobalt text-paper"
                      : "border-ink/40 text-ink group-hover:border-cobalt group-hover:text-cobalt"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-sm lg:inline ${
                    isActive ? "inline font-semibold text-ink" : "hidden text-soft group-hover:text-cobalt"
                  }`}
                >
                  {step.name}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
