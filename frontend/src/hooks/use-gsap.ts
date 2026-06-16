"use client";

/**
 * GSAP animation hooks — split text, reveal-on-scroll, counters, parallax.
 * All hooks respect `prefers-reduced-motion`.
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Split a heading into spans per word, then animate them in. */
export function useSplitText(selector: string, deps: any[] = []) {
  useEffect(() => {
    if (reduced()) return;
    const root = document.querySelector(selector);
    if (!root) return;

    const original = root.textContent ?? "";
    const words = original.trim().split(/\s+/);
    root.innerHTML = words
      .map((w) => `<span class="inline-block overflow-hidden align-bottom"><span class="inline-block will-change-transform">${w}&nbsp;</span></span>`)
      .join("");

    const inner = root.querySelectorAll("span span");
    gsap.from(inner, {
      yPercent: 110,
      rotation: 4,
      opacity: 0,
      duration: 0.9,
      ease: "expo.out",
      stagger: 0.06,
      delay: 0.1,
    });
    return () => { root.textContent = original; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Reveal element on scroll. */
export function useReveal<T extends HTMLElement>(opts: { y?: number; delay?: number; duration?: number } = {}) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!ref.current || reduced()) return;
    const el = ref.current;
    gsap.from(el, {
      y: opts.y ?? 28,
      opacity: 0,
      duration: opts.duration ?? 0.9,
      delay: opts.delay ?? 0,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  }, []);
  return ref;
}

/** Stagger child reveals inside a container. */
export function useStaggerReveal<T extends HTMLElement>(childSelector = ":scope > *") {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!ref.current || reduced()) return;
    const el = ref.current;
    const children = el.querySelectorAll(childSelector);
    gsap.from(children, {
      y: 24,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  }, []);
  return ref;
}

/** Counter animation: animate a number from 0 → value. */
export function useCountUp(target: number, duration = 1.6) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current || reduced()) {
      if (ref.current) ref.current.textContent = String(target);
      return;
    }
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: target,
      duration,
      ease: "power2.out",
      onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(obj.val).toLocaleString(); },
      scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
    });
    return () => { tween.kill(); };
  }, [target, duration]);
  return ref;
}

/** Subtle parallax: translates Y based on scroll position. */
export function useParallax(speed = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || reduced()) return;
    const el = ref.current;
    gsap.to(el, {
      yPercent: -30 * speed,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
  }, [speed]);
  return ref;
}

export { gsap, ScrollTrigger };
