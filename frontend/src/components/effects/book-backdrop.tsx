"use client";
/**
 * BOOK — Timeline of 6 ticks. Mouse hovers near a tick and that
 * tick grows + glows oxblood. A horizontal line runs through them.
 */
import { useEffect, useRef } from "react";

const COLOR_LINE = "rgba(14, 14, 16, 0.30)";
const COLOR_TICK = "rgba(14, 14, 16, 0.85)";
const COLOR_HOT  = "rgba(110, 16, 35, 1)";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function BookBackdrop() {
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
    const onLeave = () => { mouse.tx = -1; mouse.ty = -1; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);

    const STEPS = 6;

    const tick = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, cw, ch);

      // Background rule lines
      ctx.strokeStyle = "rgba(14, 14, 16, 0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const y = (i + 1) * (ch / 13);
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(cw, y);
        ctx.stroke();
      }

      // Timeline at vertical center
      const ty = ch * 0.5;
      ctx.strokeStyle = COLOR_LINE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, ty); ctx.lineTo(cw - 80, ty);
      ctx.stroke();

      for (let i = 0; i < STEPS; i++) {
        const x = 80 + (i + 0.5) * ((cw - 160) / STEPS);
        // gentle vertical bob
        const y = ty + Math.sin(t * 0.7 + i * 0.6) * 4;

        const dx = mouse.x - x;
        const dy = mouse.y - y;
        const d2 = dx * dx + dy * dy;
        const hot = d2 < 60 * 60;
        const r = hot ? 12 : 5;

        ctx.fillStyle = hot ? COLOR_HOT : COLOR_TICK;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // number above
        ctx.fillStyle = hot ? COLOR_HOT : "rgba(14,14,16,0.65)";
        ctx.font = "10px 'Geist Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(i + 1).padStart(2, "0"), x, y - 22);

        if (hot) {
          // tether to cursor
          ctx.strokeStyle = "rgba(110, 16, 35, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
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
