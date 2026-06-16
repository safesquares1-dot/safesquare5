"use client";
/**
 * DASHBOARD — Bookkeeping ledger. Columns of tiny figures that
 * draw a continuous line, with the cursor acting as a stylus that
 * leaves a faint oxblood trace along the most-recently-hovered row.
 */
import { useEffect, useRef } from "react";

const COLOR_LINE = "rgba(14, 14, 16, 0.20)";
const COLOR_FIG  = "rgba(14, 14, 16, 0.55)";
const COLOR_HOT  = "rgba(110, 16, 35, 0.75)";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function DashboardBackdrop() {
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

    const ROWS = 14;
    const STEP = 28;
    const M_LEFT = 60;
    const M_RIGHT = 60;

    const tick = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      ctx.clearRect(0, 0, cw, ch);

      // gridlines
      ctx.strokeStyle = COLOR_LINE;
      ctx.lineWidth = 1;
      const rowH = (ch - 100) / ROWS;
      for (let i = 0; i <= ROWS; i++) {
        const y = 50 + i * rowH;
        ctx.beginPath();
        ctx.moveTo(M_LEFT, y); ctx.lineTo(cw - M_RIGHT, y);
        ctx.stroke();
      }

      // numeric traces per row
      ctx.font = "10px 'Geist Mono', monospace";
      ctx.fillStyle = COLOR_FIG;
      ctx.textBaseline = "middle";
      for (let i = 0; i < ROWS; i++) {
        const y = 50 + i * rowH + rowH / 2;
        const seed = (i * 73) % 1000;
        for (let j = 0; j < 14; j++) {
          const x = M_LEFT + 30 + j * ((cw - M_LEFT - M_RIGHT - 60) / 14);
          // pseudo-random figure that drifts with mouse X
          const v = ((seed + j * 17) ^ (Math.floor(mouse.x) + i)) & 0xff;
          ctx.fillText(((v * 37) % 9000 + 100).toString().padStart(4, "0").slice(0, 4), x, y);
        }

        // row hover
        if (mouse.y > 0 && Math.abs(mouse.y - y) < rowH * 0.45) {
          ctx.fillStyle = COLOR_HOT;
          ctx.fillRect(M_LEFT - 4, y - rowH * 0.45, 2, rowH * 0.9);
        }
        ctx.fillStyle = COLOR_FIG;
      }

      // cursor ruler
      if (mouse.x > 0) {
        ctx.strokeStyle = "rgba(110, 16, 35, 0.45)";
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(mouse.x, 30); ctx.lineTo(mouse.x, ch - 30);
        ctx.stroke();
        ctx.setLineDash([]);
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
