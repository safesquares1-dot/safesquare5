"use client";
/**
 * ROOMS — Slow horizontal "tide" with vertical ink hairlines.
 * Two sine waves of dots that the mouse perturbs. Feels like a
 * floor plan viewed from above — calm, architectural.
 */
import { useEffect, useRef } from "react";

const COLOR_LINE = "rgba(14, 14, 16, 0.20)";
const COLOR_DOT  = "rgba(14, 14, 16, 0.55)";
const COLOR_HOT  = "rgba(110, 16, 35, 0.85)";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function RoomsBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (reduced()) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let cw = 0, ch = 0;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    let t0 = performance.now();
    let raf = 0;

    const resize = () => {
      cw = canvas.clientWidth; ch = canvas.clientHeight;
      canvas.width = cw * dpr; canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => { mouse.tx = e.clientX; mouse.ty = e.clientY; };
    const onLeave = () => { mouse.tx = -9999; mouse.ty = -9999; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);

    const tick = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      const t = (now - t0) / 1000;

      ctx.clearRect(0, 0, cw, ch);

      // Floor-plan verticals
      const cols = Math.max(8, Math.floor(cw / 110));
      ctx.lineWidth = 1;
      ctx.strokeStyle = COLOR_LINE;
      for (let i = 0; i <= cols; i++) {
        const x = (i / cols) * cw;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ch);
        ctx.stroke();
      }

      // Two sine waves of dots
      const waves = [
        { amp: 28, freq: 0.004, y: 0.30, speed: 0.6, count: 70, color: COLOR_DOT },
        { amp: 38, freq: 0.003, y: 0.66, speed: -0.45, count: 90, color: COLOR_DOT },
        { amp: 18, freq: 0.007, y: 0.86, speed: 0.9, count: 110, color: COLOR_DOT },
      ];

      for (const w of waves) {
        const baseY = w.y * ch;
        for (let i = 0; i < w.count; i++) {
          const x = (i / w.count) * cw;
          const phase = (x * w.freq) + t * w.speed;
          let y = baseY + Math.sin(phase) * w.amp;

          // mouse pushes a ripple through
          if (mouse.x > 0) {
            const dx = mouse.x - x;
            const influence = Math.exp(-(dx * dx) / 32000) * 22;
            y -= influence;
          }

          // hover highlight
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const hot = dx * dx + dy * dy < 60 * 60;

          ctx.fillStyle = hot ? COLOR_HOT : w.color;
          ctx.beginPath();
          ctx.arc(x, y, hot ? 2.6 : 1.6, 0, Math.PI * 2);
          ctx.fill();
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
