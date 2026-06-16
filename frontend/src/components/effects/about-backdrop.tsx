"use client";
/**
 * ABOUT — Slow drifting grid + ink rings emanating from cursor.
 * Editorial / architectural feel: a fine graphite grid that bends gently
 * under the cursor, with three concentric ink rings pulsing outward.
 */
import { useEffect, useRef } from "react";

const COLOR_GRID = "rgba(14, 14, 16, 0.08)";
const COLOR_BEND = "rgba(14, 14, 16, 0.22)";
const COLOR_RING = "rgba(110, 16, 35, 0.45)";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function AboutBackdrop() {
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
    const rings: { x: number; y: number; r: number; a: number }[] = [];

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

    let lastRing = 0;
    let raf = 0;
    const tick = (t: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;

      ctx.clearRect(0, 0, cw, ch);

      // grid
      const step = 48;
      ctx.lineWidth = 1;
      for (let x = 0; x < cw; x += step) {
        ctx.beginPath();
        for (let y = 0; y < ch; y += 1) {
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const d2 = dx * dx + dy * dy;
          const f = d2 < 22000 ? Math.max(0, 1 - Math.sqrt(d2) / 150) : 0;
          const offset = f * 8;
          if (y === 0) ctx.moveTo(x + offset, y);
          else ctx.lineTo(x + offset, y);
        }
        ctx.strokeStyle = COLOR_GRID;
        ctx.stroke();
      }
      for (let y = 0; y < ch; y += step) {
        ctx.beginPath();
        for (let x = 0; x < cw; x += 1) {
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const d2 = dx * dx + dy * dy;
          const f = d2 < 22000 ? Math.max(0, 1 - Math.sqrt(d2) / 150) : 0;
          const offset = f * 8;
          if (x === 0) ctx.moveTo(x, y + offset);
          else ctx.lineTo(x, y + offset);
        }
        ctx.strokeStyle = COLOR_GRID;
        ctx.stroke();
      }

      // accent rings from cursor
      if (t - lastRing > 1500 && mouse.x > 0) {
        rings.push({ x: mouse.x, y: mouse.y, r: 8, a: 1 });
        lastRing = t;
        if (rings.length > 6) rings.shift();
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.r += 1.4;
        r.a -= 0.008;
        if (r.a <= 0) { rings.splice(i, 1); continue; }
        ctx.strokeStyle = COLOR_RING.replace(/[\d.]+\)$/g, `${r.a.toFixed(3)})`);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // cursor ink mark
      if (mouse.x > 0) {
        ctx.fillStyle = "rgba(14, 14, 16, 0.6)";
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(110, 16, 35, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 14, 0, Math.PI * 2);
        ctx.stroke();
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
