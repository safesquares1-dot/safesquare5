"use client";
/**
 * FAQ — Three orbiting rings of dots, with the cursor acting as a
 * gravitational centre. Different speeds and radii per ring.
 */
import { useEffect, useRef } from "react";

const COLOR = "rgba(14, 14, 16, 0.45)";
const COLOR_HOT = "rgba(110, 16, 35, 0.85)";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function FaqBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (reduced()) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let cw = 0, ch = 0;
    const cx = () => cw / 2, cy = () => ch / 2;
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

    const rings = [
      { r: 0.18, dots: 8,  speed: 0.25,  size: 2.0 },
      { r: 0.30, dots: 14, speed: -0.18, size: 1.6 },
      { r: 0.42, dots: 22, speed: 0.12,  size: 1.3 },
      { r: 0.55, dots: 30, speed: -0.08, size: 1.1 },
    ];

    const tick = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, cw, ch);

      // centre reticle (where rings orbit)
      ctx.strokeStyle = "rgba(14, 14, 16, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx(), cy(), 6, 0, Math.PI * 2);
      ctx.stroke();

      const base = Math.min(cw, ch);

      for (const ring of rings) {
        const radius = ring.r * base;
        for (let i = 0; i < ring.dots; i++) {
          const a = (i / ring.dots) * Math.PI * 2 + t * ring.speed;
          let x = cx() + Math.cos(a) * radius;
          let y = cy() + Math.sin(a) * radius * 0.6; // squash a bit, looks less mechanical

          // cursor pull
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 160 * 160 && d2 > 1) {
            const f = (1 - Math.sqrt(d2) / 160) * 6;
            x += (dx / Math.sqrt(d2)) * f;
            y += (dy / Math.sqrt(d2)) * f;
          }
          const hot = d2 < 50 * 50;
          ctx.fillStyle = hot ? COLOR_HOT : COLOR;
          ctx.beginPath();
          ctx.arc(x, y, hot ? ring.size * 1.4 : ring.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // cursor
      if (mouse.x > 0) {
        ctx.strokeStyle = "rgba(110, 16, 35, 0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
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
