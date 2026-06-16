"use client";
/**
 * BLOG — Typewriter lines. Soft horizontal hairlines fade in
 * from left to right at staggered intervals, like text being typed.
 * Mouse position accelerates the typing at that row.
 */
import { useEffect, useRef } from "react";

const COLOR = "rgba(14, 14, 16, 0.10)";
const COLOR_HEAD = "rgba(110, 16, 35, 0.55)";
const COLOR_CARET = "rgba(110, 16, 35, 0.85)";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function BlogBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (reduced()) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let cw = 0, ch = 0;
    const mouse = { y: -1, ty: -1 };
    let t0 = performance.now();
    let raf = 0;

    const resize = () => {
      cw = canvas.clientWidth; ch = canvas.clientHeight;
      canvas.width = cw * dpr; canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => { mouse.ty = e.clientY; };
    const onLeave = () => { mouse.ty = -1; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);

    const ROW_H = 36;
    const MARGIN = 80;

    const tick = (now: number) => {
      mouse.y += (mouse.ty - mouse.y) * 0.15;
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, cw, ch);

      const rows = Math.ceil(ch / ROW_H) + 1;
      for (let i = 0; i < rows; i++) {
        const y = i * ROW_H + ROW_H / 2;
        const widthSeed = ((i * 37) % 60) / 100;     // 0.00 – 0.60
        const phase = (i * 0.27) % 1;                // 0 – 1
        const cycle = 6 + ((i * 13) % 8);            // 6 – 14s loop

        // local speed boost near cursor
        const dy = mouse.y - y;
        const boost = mouse.y > 0 ? Math.max(0, 1 - Math.abs(dy) / 200) : 0;
        const speed = 1 + boost * 2.4;
        const localT = (t * speed + phase) % cycle;
        const progress = localT / cycle;             // 0 → 1
        const w = MARGIN + (cw - 2 * MARGIN) * (0.25 + widthSeed * 0.6) * progress;

        const isHead = i % 5 === 0;
        ctx.strokeStyle = isHead ? COLOR_HEAD : COLOR;
        ctx.lineWidth = isHead ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(MARGIN, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        // caret at the end
        if (progress > 0.05 && progress < 0.95) {
          ctx.fillStyle = COLOR_CARET;
          ctx.fillRect(w + 2, y - 6, 2, 12);
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
