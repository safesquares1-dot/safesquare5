"use client";
/**
 * Scroll system for the Tresmares-style experience.
 *  - Pinned "panel" wrapper: a section is pinned while its inner content
 *    scrolls vertically past the viewport (stacked-card effect)
 *  - Horizontal scroll: a section is pinned and its inner track scrolls
 *    horizontally as the user scrolls vertically
 *  - Count-up: numbers animate from 0 → value when they enter the viewport
 *  - Progress bar: a 2px ink bar at the top of the page tracks scroll %
 *  - Section reveal: a hairline grows from 0 → full width as the section
 *    enters the viewport
 *  - Sticky header: the masthead bar sticks and morphs (border + backdrop)
 *    once a threshold is crossed
 */
import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =====================================================================
 * 1. Top progress bar
 * ===================================================================*/
export function ScrollProgress() {
  React.useEffect(() => {
    if (reduced()) return;
    const bar = document.getElementById("ssq-progress");
    if (!bar) return;
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      bar.style.transform = `scaleX(${Math.max(0, Math.min(100, pct)) / 100})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-ink/5 pointer-events-none"
    >
      <div
        id="ssq-progress"
        className="h-full bg-oxblood origin-left will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/* =====================================================================
 * 2. Pinned vertical "deck" — children stack and translate up
 * ===================================================================*/
export function PinnedDeck({
  children,
  className,
  heightVh = 320,
}: {
  children: React.ReactNode;
  className?: string;
  heightVh?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (reduced() || !ref.current) return;
    const el = ref.current;
    const inner = el.querySelector("[data-deck-track]") as HTMLElement | null;
    if (!inner) return;
    const distance = () => inner.scrollHeight - window.innerHeight;
    const tween = gsap.to(inner, {
      y: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{ height: `${heightVh}vh` }}
    >
      <div data-deck-track className="relative w-full h-screen will-change-transform">
        {children}
      </div>
    </div>
  );
}

/* =====================================================================
 * 3. Horizontal scroll section — vertical scroll maps to horizontal
 * ===================================================================*/
export function HorizontalScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (reduced() || !ref.current) return;
    const el = ref.current;
    const track = el.querySelector("[data-h-track]") as HTMLElement | null;
    if (!track) return;
    const distance = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, []);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <div data-h-track className="flex h-screen w-max will-change-transform">
        {children}
      </div>
    </div>
  );
}

/* =====================================================================
 * 4. Count-up: span animates 0 → value when it enters the viewport
 * ===================================================================*/
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    if (reduced()) {
      if (ref.current) ref.current.textContent = `${prefix}${value.toLocaleString(undefined, { maximumFractionDigits: decimals })}${suffix}`;
      return;
    }
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: value,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        if (!ref.current) return;
        ref.current.textContent = `${prefix}${obj.v.toLocaleString(undefined, { maximumFractionDigits: decimals })}${suffix}`;
      },
      scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [value, prefix, suffix, decimals]);
  return <span ref={ref} className={className}>0</span>;
}

/* =====================================================================
 * 5. Section reveal — a hairline grows from 0 → 100% as section enters
 * ===================================================================*/
export function SectionReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (reduced() || !ref.current) return;
    const el = ref.current;
    gsap.from(el, {
      y: 36,
      opacity: 0,
      duration: 1.1,
      delay,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  }, [delay]);
  return <div ref={ref} className={className}>{children}</div>;
}

/* =====================================================================
 * 6. Parallax background — yPercent shifts as section scrolls past
 * ===================================================================*/
export function Parallax({
  children,
  className,
  speed = -20,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (reduced() || !ref.current) return;
    const el = ref.current;
    gsap.to(el, {
      yPercent: speed,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
  }, [speed]);
  return <div ref={ref} className={className}>{children}</div>;
}

/* =====================================================================
 * 7. Word-by-word reveal — splits a paragraph and staggers each word
 * ===================================================================*/
export function WordReveal({
  text,
  className,
  stagger = 0.04,
}: {
  text: string;
  className?: string;
  stagger?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (reduced() || !ref.current) return;
    const el = ref.current;
    const words = el.querySelectorAll("[data-word]");
    gsap.from(words, {
      yPercent: 110,
      opacity: 0,
      duration: 0.8,
      ease: "expo.out",
      stagger,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  }, [stagger]);
  return (
    <div ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.3em]">
          <span data-word className="inline-block will-change-transform">{w}</span>
        </span>
      ))}
    </div>
  );
}

/* =====================================================================
 * 8. Sticky section header that morphs on scroll
 * ===================================================================*/
export function StickySectionLabel({ label, n }: { label: string; n: string }) {
  return (
    <div className="sticky top-[var(--header-h)] z-20 -mx-6 px-6 py-3 bg-bone/85 backdrop-blur border-b border-ink/15 flex items-baseline gap-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-oxblood">{n}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em]">{label}</span>
    </div>
  );
}

/* =====================================================================
 * 9. PinScrollText — pinned headline, scroll swaps in new lines
 * ===================================================================*/
export function PinnedLines({
  lines,
  className,
}: {
  lines: string[];
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (reduced() || !ref.current) return;
    const el = ref.current;
    const items = Array.from(el.querySelectorAll("[data-line]")) as HTMLElement[];
    if (!items.length) return;
    items.forEach((it, i) => {
      gsap.fromTo(
        it,
        { opacity: 0, y: 30, clipPath: "inset(0 0 100% 0)" },
        {
          opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)",
          duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: el, start: `top+=${i * 80} top`, end: `top+=${(i + 1) * 80} top`, scrub: 0.5 },
        }
      );
      // fade out as next arrives
      gsap.to(it, {
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: el, start: `top+=${(i + 1) * 80} top`, end: `top+=${(i + 2) * 80} top`, scrub: 0.5 },
      });
    });
  }, [lines]);
  return (
    <div ref={ref} className={cn("space-y-6", className)}>
      {lines.map((l, i) => (
        <div key={i} data-line className="will-change-transform">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40 mr-4">0{i + 1}</span>
          <span className="h-display text-4xl md:text-6xl leading-[1.05]">{l}</span>
        </div>
      ))}
    </div>
  );
}
