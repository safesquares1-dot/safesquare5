"use client";
/**
 * PREMIUM MOUSE-FOLLOW BACKGROUND — full-page, sticky.
 *  - A single full-window <canvas> fixed behind everything (z-0)
 *  - Three layers of behaviour:
 *      1) A drifting field of ink dots across the whole viewport
 *      2) Mouse tethers — every dot within 220px sends a thin oxblood
 *         line to the cursor
 *      3) A soft oxblood halo + a thin ring at the cursor itself
 *  - As you scroll the field stays locked to the viewport, not the page
 *  - The particle field is the SAME as the home hero, but extended to
 *    cover the full page rather than just the first section
 *  - Honors prefers-reduced-motion
 */
import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number; r: number };

const COLOR_DOT      = "rgba(14, 14, 16, 0.55)";
const COLOR_DOT_HOT  = "rgba(110, 16, 35, 0.95)";
const COLOR_LINE     = "rgba(14, 14, 16, 0.10)";
const COLOR_LINE_HOT = "rgba(110, 16, 35, 0.30)";
const COLOR_CURSOR   = "rgba(110, 16, 35, 0.55)";

const COUNT       = 110;
const SPEED       = 0.22;
const ATTRACT_R   = 220;
const MAX_LINK_OP = 0.45;

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function PremiumMouseField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    if (reduced()) {
      drawStaticGrid(ctx, canvas);
      const onResize = () => drawStaticGrid(ctx, canvas);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let cw = 0, ch = 0;
    let parts: P[] = [];

    const mouse = {
      x: -9999, y: -9999,
      targetX: -9999, targetY: -9999,
      active: false,
    };

    const init = () => {
      parts = [];
      for (let i = 0; i < COUNT; i++) {
        parts.push({
          x: Math.random() * cw,
          y: Math.random() * ch,
          vx: (Math.random() - 0.5) * SPEED,
          vy: (Math.random() - 0.5) * SPEED,
          r: 0.9 + Math.random() * 1.4,
        });
      }
    };

    const resize = () => {
      cw = window.innerWidth;
      ch = window.innerHeight;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = cw + "px";
      canvas.style.height = ch + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (parts.length === 0) init();
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => { mouse.targetX = -9999; mouse.targetY = -9999; mouse.active = false; };
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onLeave);

    const tick = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.16;
      mouse.y += (mouse.targetY - mouse.y) * 0.16;

      ctx.clearRect(0, 0, cw, ch);

      // Ambient drift + mouse attraction
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < ATTRACT_R * ATTRACT_R && d2 > 4) {
            const d = Math.sqrt(d2);
            const f = (1 - d / ATTRACT_R) * 0.6;
            p.vx += (dx / d) * f * 0.06;
            p.vy += (dy / d) * f * 0.06;
          }
        }

        p.vx *= 0.985;
        p.vy *= 0.985;

        if (Math.abs(p.vx) < SPEED * 0.3) p.vx += (Math.random() - 0.5) * 0.012;
        if (Math.abs(p.vy) < SPEED * 0.3) p.vy += (Math.random() - 0.5) * 0.012;

        if (p.x < -10) p.x = cw + 10;
        if (p.x > cw + 10) p.x = -10;
        if (p.y < -10) p.y = ch + 10;
        if (p.y > ch + 10) p.y = -10;
      }

      // Particle-particle hairlines
      ctx.lineWidth = 1;
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < ATTRACT_R) {
            const op = (1 - d / ATTRACT_R) * MAX_LINK_OP;
            ctx.strokeStyle = COLOR_LINE.replace(/[\d.]+\)$/g, `${op.toFixed(3)})`);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Cursor tethers (oxblood, stronger)
      if (mouse.active) {
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < ATTRACT_R) {
            const op = (1 - d / ATTRACT_R) * 0.6;
            ctx.strokeStyle = COLOR_LINE_HOT.replace(/[\d.]+\)$/g, `${op.toFixed(3)})`);
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Dots
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        let hot = false;
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          if (dx * dx + dy * dy < ATTRACT_R * ATTRACT_R * 0.36) hot = true;
        }
        ctx.fillStyle = hot ? COLOR_DOT_HOT : COLOR_DOT;
        ctx.beginPath();
        ctx.arc(p.x, p.y, hot ? p.r * 1.45 : p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cursor halo + ring
      if (mouse.active) {
        const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 90);
        grd.addColorStop(0, "rgba(110, 16, 35, 0.18)");
        grd.addColorStop(1, "rgba(110, 16, 35, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 90, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = COLOR_CURSOR;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}

function drawStaticGrid(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  const cw = window.innerWidth;
  const ch = window.innerHeight;
  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  const step = 36;
  ctx.fillStyle = "rgba(14, 14, 16, 0.40)";
  for (let x = step / 2; x < cw; x += step) {
    for (let y = step / 2; y < ch; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
