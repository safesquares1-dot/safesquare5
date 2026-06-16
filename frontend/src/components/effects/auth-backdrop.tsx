"use client";
/**
 * AUTH (Login / Register) — Single dot that follows the cursor with
 * a long ink-trail, plus three corner crop marks (like a passport
 * photograph) anchored to the viewport.
 */
import { useEffect, useRef } from "react";

const COLOR_TRAIL = "rgba(110, 16, 35, 0.45)";
const COLOR_CROP  = "rgba(14, 14, 16, 0.55)";
const COLOR_DOT   = "rgba(14, 14, 16, 0.85)";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function AuthBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (reduced()) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let cw = 0, ch = 0;
    const mouse = { x: -1, y: -1, tx: -1, ty: -1, px: -1, py: -1 };
    const trail: { x: number; y: number; a: number }[] = [];
    let raf = 0;

    const resize = () => {
      cw = canvas.clientWidth; ch = canvas.clientHeight;
      canvas.width = cw * dpr; canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => { mouse.tx = e.clientX; mouse.ty = e.clientY; };
    const onLeave = () => { mouse.tx = -1; mouse.ty = -1; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);

    const drawCropMarks = () => {
      const m = 28;
      const len = 18;
      ctx.strokeStyle = COLOR_CROP;
      ctx.lineWidth = 1.2;
      const cs = [[m, m, 1, 1], [cw - m, m, -1, 1], [m, ch - m, 1, -1], [cw - m, ch - m, -1, -1]];
      for (const [x, y, sx, sy] of cs) {
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x + sx * len, y);
        ctx.moveTo(x, y); ctx.lineTo(x, y + sy * len);
        ctx.stroke();
      }
    };

    const tick = () => {
      mouse.px = mouse.x; mouse.py = mouse.y;
      mouse.x += (mouse.tx - mouse.x) * 0.18;
      mouse.y += (mouse.ty - mouse.y) * 0.18;
      ctx.clearRect(0, 0, cw, ch);
      drawCropMarks();

      // Trail
      if (mouse.x > 0) {
        trail.push({ x: mouse.x, y: mouse.y, a: 1 });
        if (trail.length > 30) trail.shift();
      }
      for (let i = 0; i < trail.length - 1; i++) {
        const a = trail[i], b = trail[i + 1];
        a.a *= 0.95;
        ctx.strokeStyle = COLOR_TRAIL.replace(/[\d.]+\)$/g, `${a.a.toFixed(3)})`);
        ctx.lineWidth = 1.4 - i * 0.04;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // dot
      if (mouse.x > 0) {
        ctx.fillStyle = COLOR_DOT;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fill();
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
