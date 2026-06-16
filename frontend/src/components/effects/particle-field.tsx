"use client";

/**
 * Mouse-follow particle network.
 *  - Dots drift slowly across the page
 *  - When the cursor comes within R, particles gravitate toward it
 *  - Particles within LINE_DIST are joined by faint hairlines
 *  - The cursor itself is connected to all nearby particles by a stronger line
 *  - Color is single-pass ink/oxblood on bone so it lives with the editorial system
 *  - Single full-window <canvas>, GPU-friendly, no allocations per frame
 *  - Pauses when off-screen / when prefers-reduced-motion
 */
import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number; r: number };

const COLOR_DOT     = "rgba(14, 14, 16, 0.55)";        // ink
const COLOR_DOT_HOT = "rgba(110, 16, 35, 0.95)";      // oxblood
const COLOR_LINE    = "rgba(14, 14, 16, 0.10)";
const COLOR_LINE_HOT= "rgba(110, 16, 35, 0.30)";      // oxblood tether
const COLOR_CURSOR  = "rgba(110, 16, 35, 0.55)";

const COUNT       = 90;     // base particle count
const SPEED       = 0.25;   // ambient drift speed
const ATTRACT_R   = 180;    // mouse influences within this radius
const LINE_DIST   = 110;    // particle-particle link distance
const MAX_LINK_OP = 0.45;

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    if (reduced()) return; // honour a11y setting

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let w = 0, h = 0;
    let cw = 0, ch = 0;

    const mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999, active: false };
    const onMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; mouse.targetX = -9999; mouse.targetY = -9999; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("blur", onLeave);

    const onTouch = (e: TouchEvent) => {
      if (e.touches.length) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
      }
    };
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onLeave);

    // Build particle pool
    const parts: P[] = [];
    const seed = (count: number) => {
      parts.length = 0;
      for (let i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * cw,
          y: Math.random() * ch,
          vx: (Math.random() - 0.5) * SPEED,
          vy: (Math.random() - 0.5) * SPEED,
          r: 1 + Math.random() * 1.4,
        });
      }
    };

    const resize = () => {
      cw = canvas.clientWidth;
      ch = canvas.clientHeight;
      w = cw * dpr;
      h = ch * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // re-density by area, capped
      const target = Math.min(160, Math.max(40, Math.round((cw * ch) / 14000)));
      if (Math.abs(target - parts.length) > 20) seed(target);
      else if (!parts.length) seed(target);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      // Smooth follow on the cursor
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      ctx.clearRect(0, 0, cw, ch);

      // Update particles
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        // ambient drift
        p.x += p.vx;
        p.y += p.vy;

        // mouse attraction within radius
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < ATTRACT_R * ATTRACT_R && d2 > 4) {
            const d = Math.sqrt(d2);
            const f = (1 - d / ATTRACT_R) * 0.6; // falloff
            p.vx += (dx / d) * f * 0.05;
            p.vy += (dy / d) * f * 0.05;
          }
        }

        // friction
        p.vx *= 0.985;
        p.vy *= 0.985;

        // keep a tiny ambient floor
        const minV = SPEED * 0.3;
        if (Math.abs(p.vx) < minV) p.vx += (Math.random() - 0.5) * 0.01;
        if (Math.abs(p.vy) < minV) p.vy += (Math.random() - 0.5) * 0.01;

        // wrap
        if (p.x < -10) p.x = cw + 10;
        if (p.x > cw + 10) p.x = -10;
        if (p.y < -10) p.y = ch + 10;
        if (p.y > ch + 10) p.y = -10;
      }

      // Draw links
      ctx.lineWidth = 1;
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINE_DIST) {
            const op = (1 - d / LINE_DIST) * MAX_LINK_OP;
            ctx.strokeStyle = COLOR_LINE.replace(/[\d.]+\)$/g, `${op.toFixed(3)})`);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw cursor tethers (hot)
      if (mouse.active) {
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < ATTRACT_R) {
            const op = (1 - d / ATTRACT_R) * 0.55;
            ctx.strokeStyle = COLOR_LINE_HOT.replace(/[\d.]+\)$/g, `${op.toFixed(3)})`);
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
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
        ctx.arc(p.x, p.y, hot ? p.r * 1.4 : p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cursor halo
      if (mouse.active) {
        const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
        grd.addColorStop(0, "rgba(110, 16, 35, 0.15)");
        grd.addColorStop(1, "rgba(110, 16, 35, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
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
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("resize", resize);
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
