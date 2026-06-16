"use client";
/**
 * CONTACT — Radar pulse. A single thin ring scans outward from the
 * cursor, with cardinal crosshairs and a stationary origin.
 * Plus a faint postal-ticket border running around the page.
 */
import { useEffect, useRef } from "react";

const COLOR_RING = "rgba(110, 16, 35, 0.50)";
const COLOR_AXIS = "rgba(14, 14, 16, 0.25)";
const COLOR_FRAME = "rgba(14, 14, 16, 0.18)";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ContactBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (reduced()) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let cw = 0, ch = 0;
    const mouse = { x: -1, y: -1, tx: -1, ty: -1 };
    let ringR = 0;
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

    const tick = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      ctx.clearRect(0, 0, cw, ch);

      // postal-ticket frame
      ctx.strokeStyle = COLOR_FRAME;
      ctx.lineWidth = 1;
      const m = 40;
      ctx.strokeRect(m, m, cw - m * 2, ch - m * 2);
      // perforation marks
      ctx.setLineDash([2, 6]);
      ctx.strokeRect(m + 6, m + 6, cw - (m + 6) * 2, ch - (m + 6) * 2);
      ctx.setLineDash([]);

      // crosshair
      if (mouse.x > 0) {
        ctx.strokeStyle = COLOR_AXIS;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, mouse.y); ctx.lineTo(cw, mouse.y);
        ctx.moveTo(mouse.x, 0); ctx.lineTo(mouse.x, ch);
        ctx.stroke();

        // expanding ring
        ringR += 0.6;
        if (ringR > 360) ringR = 0;
        for (let i = 0; i < 3; i++) {
          const r = ringR - i * 90;
          if (r <= 0 || r > 360) continue;
          const a = Math.max(0, 1 - r / 360);
          ctx.strokeStyle = COLOR_RING.replace(/[\d.]+\)$/g, `${(a * 0.6).toFixed(3)})`);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = "rgba(110, 16, 35, 0.85)";
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
