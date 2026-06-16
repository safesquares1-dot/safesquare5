"use client";

/**
 * Editorial "audiogram" mark — concentric rings + a pulse line.
 * Replaces the WebGL water background with a still, printed feel.
 */
import { cn } from "@/lib/utils";

export function EditorialBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      <svg className="absolute -right-[20%] top-[10%] w-[1200px] h-[1200px] opacity-30 animate-spin-slow" viewBox="0 0 800 800">
        <g fill="none" stroke="currentColor" strokeWidth="0.5" className="text-ink">
          {Array.from({ length: 24 }).map((_, i) => (
            <circle key={i} cx="400" cy="400" r={50 + i * 15} />
          ))}
        </g>
        <circle cx="400" cy="400" r="6" fill="currentColor" className="text-oxblood" />
        <circle cx="400" cy="400" r="2" fill="currentColor" className="text-bone" />
      </svg>

      <div className="absolute left-0 right-0 top-[55%]">
        <div className="pulse-line" />
      </div>
    </div>
  );
}
