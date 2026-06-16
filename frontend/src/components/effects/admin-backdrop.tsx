"use client";
/**
 * ADMIN — Small-multiples grid. Twelve mini sparklines in a 4×3
 * layout, each its own little chart, growing with mouse hover.
 * Plus a slow-scanning oxblood vertical line — the "editor's eye".
 */
import { useEffect, useRef } from "react";

const COLOR = "rgba(14, 14, 16, 0.45)";
const COLOR_HOT = "rgba(110, 16, 35, 0.95)";
const COLOR_SCAN = "rgba(110, 16, 35, 0.35)";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function AdminBackdrop() {
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

    const cells = Array.from({ length: 12 }, (_, i) => ({
      values: Array.from({ length: 12 }, (_, j) =>
        0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + j * 0.9))
      ),
    }));

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

    const COLS = 4, ROWS = 3;
    const PAD = 40;

    const tick = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, cw, ch);

      const cellW = (cw - PAD * 2) / COLS;
      const cellH = (ch - PAD * 2) / ROWS;

      for (let i = 0; i < cells.length; i++) {
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        const x = PAD + c * cellW;
        const y = PAD + r * cellH;
        const w = cellW - 16;
        const h = cellH - 28;

        // cell border
        ctx.strokeStyle = "rgba(14, 14, 16, 0.15)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 8, y + 14, w, h);

        // mini sparkline
        const v = cells[i].values;
        const stepX = w / (v.length - 1);
        const dx = mouse.x - (x + 8 + w / 2);
        const dy = mouse.y - (y + 14 + h / 2);
        const hot = dx * dx + dy * dy < 4000;

        ctx.beginPath();
        for (let j = 0; j < v.length; j++) {
          const px = x + 8 + j * stepX;
          const py = y + 14 + h - v[j] * h;
          if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = hot ? COLOR_HOT : COLOR;
        ctx.lineWidth = hot ? 1.6 : 1.2;
        ctx.stroke();

        // cell label
        ctx.fillStyle = "rgba(14, 14, 16, 0.5)";
        ctx.font = "9px 'Geist Mono', monospace";
        ctx.textBaseline = "top";
        ctx.fillText(`M.${String(i + 1).padStart(2, "0")}`, x + 8, y + 2);
      }

      // editor's scan line
      const scanX = ((t * 60) % (cw + 200)) - 100;
      const grd = ctx.createLinearGradient(scanX - 50, 0, scanX + 50, 0);
      grd.addColorStop(0, "rgba(110, 16, 35, 0)");
      grd.addColorStop(0.5, COLOR_SCAN);
      grd.addColorStop(1, "rgba(110, 16, 35, 0)");
      ctx.fillStyle = grd;
      ctx.fillRect(scanX - 50, 0, 100, ch);

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
