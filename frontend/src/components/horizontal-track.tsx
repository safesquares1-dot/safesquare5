"use client";
/**
 * All-purpose scroll-triggered horizontal scroller for use inside pages.
 * Wraps any content (cards, plates, text blocks) into a horizontally-
 * scrolling track driven by vertical scroll. Respects reduced motion.
 */
import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function HorizontalTrack({
  children,
  className,
  height = "100vh",
  itemWidth = "min(80vw, 600px)",
}: {
  children: React.ReactNode;
  className?: string;
  height?: string | number;
  itemWidth?: string | number;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const fillRef = React.useRef<HTMLDivElement>(null);
  const numRef = React.useRef<HTMLSpanElement>(null);
  const count = React.Children.count(children);

  React.useEffect(() => {
    if (reduced() || !wrapRef.current || !trackRef.current) return;
    const wrap = wrapRef.current;
    const track = trackRef.current;
    const distance = () => track.scrollWidth - wrap.clientWidth;
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (fillRef.current) fillRef.current.style.transform = `scaleX(${self.progress})`;
          if (numRef.current) {
            const idx = Math.min(count, Math.max(1, Math.ceil(self.progress * count)));
            numRef.current.textContent = String(idx).padStart(2, "0") + " / " + String(count).padStart(2, "0");
          }
        },
      },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [count]);

  return (
    <div ref={wrapRef} className={cn("relative overflow-hidden bg-bone", className)} style={{ height }}>
      <div ref={trackRef} className="flex h-full w-max will-change-transform">
        {React.Children.map(children, (child, i) => (
          <div
            key={i}
            className="h-full px-6 md:px-10 flex items-center"
            style={{ width: itemWidth, minWidth: itemWidth }}
          >
            {child}
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-ink/10">
        <div ref={fillRef} className="h-full bg-oxblood origin-left will-change-transform" style={{ transform: "scaleX(0)" }} />
      </div>
      <div className="absolute top-4 right-6 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
        <span ref={numRef}>01 / {String(count).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
