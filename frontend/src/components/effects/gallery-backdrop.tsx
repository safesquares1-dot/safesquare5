"use client";
/**
 * GALLERY — Static dot grid + cursor halo.
 *  - An evenly-spaced grid of small ink dots covers the page.
 *  - The cursor is a soft 200px oxblood halo. Dots inside the halo
 *    ripple outward in a brief, decaying wave, and the dots closest
 *    to the cursor brighten to oxblood.
 *  - Calm, mathematical, very still. Reduced motion → halo only,
 *    no ripple.
 */
import { useEffect, useRef } from "react";

const COLOR_DOT   = "rgba(14, 14, 16, 0.55)";
const COLOR_HOT   = "rgba(110, 16, 35, 0.95)";
const COLOR_HALO  = "rgba(110, 16, 35, 0.18)";
const COLOR_RING  = "rgba(110, 16, 35, 0.35)";

const STEP = 32;          // distance between dots
const HALO_R = 200;       // cursor halo radius
const HOT_R = 32;         // dots within this turn hot

type D = {
  bx: number; by: number;     // base position
  ox: number; oy: number;     // ripple offset (decays over time)
  vx: number; vy: number;     // ripple velocity
  age: number;                 // ms since last ripple
};

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function GalleryBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let cw = 0, ch = 0;
    let dots: D[] = [];
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
    let lastTrigger = { x: -9999, y: -9999, t: 0 };
    let raf = 0;
    let prev = 0;

    function build() {
      dots = [];
      // Centre the grid so it feels intentional, not anchored to the corner
      const ox = (cw - Math.floor(cw / STEP) * STEP) / 2;
      const oy = (ch - Math.floor(ch / STEP) * STEP) / 2;
      for (let y = oy; y < ch; y += STEP) {
        for (let x = ox; x < cw; x += STEP) {
          dots.push({ bx: x, by: y, ox: 0, oy: 0, vx: 0, vy: 0, age: Infinity });
        }
      }
    }

    const resize = () => {
      cw = canvas.clientWidth; ch = canvas.clientHeight;
      canvas.width = cw * dpr; canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouse.tx = e.clientX; mouse.ty = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.tx = -9999; mouse.ty = -9999;
      mouse.active = false;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);

    const triggerRipple = (now: number) => {
      if (!mouse.active) return;
      // throttle: at most every 90ms, and only if cursor moved > 18px
      if (now - lastTrigger.t < 90) return;
      if (Math.hypot(mouse.x - lastTrigger.x, mouse.y - lastTrigger.y) < 18) return;
      lastTrigger = { x: mouse.x, y: mouse.y, t: now };
      // give every dot within HALO_R a small radial push
      for (const d of dots) {
        const dx = d.bx - mouse.x;
        const dy = d.by - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < HALO_R * HALO_R) {
          const dist = Math.sqrt(d2) || 1;
          const f = (1 - dist / HALO_R) * 0.9;
          d.vx += (dx / dist) * f;
          d.vy += (dy / dist) * f;
          d.age = 0;
        }
      }
    };

    const tick = (now: number) => {
      const dt = prev ? Math.min(now - prev, 32) : 16;
      prev = now;

      // smooth mouse
      mouse.x += (mouse.tx - mouse.x) * 0.2;
      mouse.y += (mouse.ty - mouse.y) * 0.2;

      triggerRipple(now);

      ctx.clearRect(0, 0, cw, ch);

      // halo (cursor)
      if (mouse.active) {
        const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, HALO_R);
        grd.addColorStop(0, COLOR_HALO);
        grd.addColorStop(1, "rgba(110, 16, 35, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, HALO_R, 0, Math.PI * 2);
        ctx.fill();

        // thin ring on the halo edge
        ctx.strokeStyle = COLOR_RING;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, HALO_R, 0, Math.PI * 2);
        ctx.stroke();
      }

      // dots
      for (const d of dots) {
        // integrate
        d.ox += d.vx;
        d.oy += d.vy;
        // spring back to base
        d.vx += -d.ox * 0.18;
        d.vy += -d.oy * 0.18;
        // damp
        d.vx *= 0.82;
        d.vy *= 0.82;
        d.age += dt;

        const px = d.bx + d.ox;
        const py = d.by + d.oy;

        // hot when near cursor
        let hot = false;
        if (mouse.active) {
          const dx = mouse.x - px;
          const dy = mouse.y - py;
          hot = dx * dx + dy * dy < HOT_R * HOT_R;
        }

        // displacement also nudges size slightly
        const offset = Math.hypot(d.ox, d.oy);
        const size = 1.2 + Math.min(0.8, offset * 0.5);

        ctx.fillStyle = hot ? COLOR_HOT : COLOR_DOT;
        ctx.beginPath();
        ctx.arc(px, py, hot ? size * 1.5 : size, 0, Math.PI * 2);
        ctx.fill();
      }

      // cursor pip
      if (mouse.active) {
        ctx.fillStyle = "rgba(110, 16, 35, 0.85)";
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2);
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
