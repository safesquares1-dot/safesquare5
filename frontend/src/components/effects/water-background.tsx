"use client";

/**
 * Premium interactive water background.
 *  - WebGL fragment shader ripple effect
 *  - Mouse-responsive displacement
 *  - Floating particles
 *  - GPU-optimized (single full-screen quad, no allocations per frame)
 */
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const VERT = /* glsl */ `
  attribute vec2 a_pos;
  varying vec2 v_uv;
  void main() {
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2  u_mouse;     // 0..1
  uniform vec2  u_resolution;
  uniform float u_intensity;

  // Hash + value noise
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }

  void main() {
    vec2 uv = v_uv;
    vec2 m  = u_mouse;

    // Aspect-corrected mouse distance
    float aspect = u_resolution.x / u_resolution.y;
    vec2 d = vec2((uv.x - m.x) * aspect, uv.y - m.y);
    float md = length(d);

    // Mouse ripple
    float ripple = sin(md * 18.0 - u_time * 2.4) * exp(-md * 3.5) * u_intensity;

    // Layered water noise
    vec2 q;
    q.x = uv.x + 0.06 * sin(uv.y * 6.0 + u_time * 0.5);
    q.y = uv.y + 0.06 * cos(uv.x * 6.0 + u_time * 0.5);
    float n = noise(q * 4.0 + u_time * 0.12) * 0.5 + noise(q * 9.0 - u_time * 0.18) * 0.5;
    n = pow(n, 1.2);

    // Distort UVs by noise + ripple
    vec2 dist = uv + (n - 0.5) * 0.045 + d * ripple * 0.12;

    // Brand gradient (deep blue → teal → aqua)
    vec3 deep   = vec3(0.039, 0.239, 0.384);   // #0A3D62
    vec3 teal   = vec3(0.059, 0.725, 0.694);   // #0FB9B1
    vec3 aqua   = vec3(0.498, 0.898, 0.878);   // #7FE5E0
    vec3 mint   = vec3(0.659, 0.902, 0.812);   // #A8E6CF

    float t = clamp(dist.y + n * 0.4, 0.0, 1.0);
    vec3 col = mix(deep, teal, smoothstep(0.0, 0.55, t));
    col = mix(col, aqua, smoothstep(0.55, 0.85, t) * 0.55);
    col = mix(col, mint, smoothstep(0.85, 1.0, t) * 0.35);

    // Caustic-like highlights
    float hl = pow(1.0 - md, 6.0) * 0.6;
    col += vec3(hl) * u_intensity;

    // Subtle vignette
    float vig = smoothstep(1.2, 0.4, length(uv - 0.5));
    col *= mix(0.85, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    // eslint-disable-next-line no-console
    console.error(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function link(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  return p;
}

export function WaterBackground({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, alpha: false });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = link(gl, vs, fs);
    gl.useProgram(prog);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uIntensity = gl.getUniformLocation(prog, "u_intensity");

    let mouse = { x: 0.5, y: 0.5, target: 0.5, intensity: 0 };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.target = (e.clientX - r.left) / r.width;
      mouse.y = 1 - (e.clientY - r.top) / r.height;
      mouse.intensity = Math.min(1, mouse.intensity + 0.06);
    };
    const onLeave = () => { mouse.intensity = Math.max(0, mouse.intensity - 0.02); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const tick = (t: number) => {
      resize();
      mouse.x += (mouse.target - mouse.x) * 0.08;
      gl.uniform1f(uTime, (t - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uIntensity, intensity * (0.5 + mouse.intensity * 0.5));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-mesh-water opacity-60 mix-blend-overlay" />
      <div className="absolute inset-0 mask-fade-b bg-gradient-to-b from-transparent via-transparent to-white" />
    </div>
  );
}

/**
 * Floating particles layer — pure CSS + framer-motion drift.
 * Decorative only; sits above the water canvas, below content.
 */
export function FloatingParticles({ count = 18 }: { count?: number }) {
  const items = Array.from({ length: count });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {items.map((_, i) => {
        const left = (i * 37) % 100;
        const top  = (i * 53) % 100;
        const size = 6 + ((i * 11) % 18);
        const dur  = 8 + ((i * 7) % 10);
        return (
          <span
            key={i}
            className="absolute rounded-full bg-white/40 blur-[1px] animate-float"
            style={{
              left: `${left}%`, top: `${top}%`,
              width: size, height: size,
              animationDuration: `${dur}s`,
              animationDelay: `${(i % 5) * 0.6}s`,
              boxShadow: "0 0 12px rgba(255,255,255,0.6)",
            }}
          />
        );
      })}
    </div>
  );
}
