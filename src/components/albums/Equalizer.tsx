/** Small animated "playing" bars. Purely decorative; stills under reduced motion. */
export function Equalizer({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex h-3 items-end gap-[2px] ${className}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom rounded-full bg-current motion-safe:animate-eq"
          style={{ height: "100%", animationDelay: `${i * -0.35}s`, transform: `scaleY(${0.45 + i * 0.2})` }}
        />
      ))}
    </span>
  );
}
