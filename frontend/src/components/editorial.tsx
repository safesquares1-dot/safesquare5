"use client";

/**
 * Editorial motion primitives. Magazine-style reveals, scroll-based fades.
 * No bounce. No spring. Smooth editorial pacing.
 */
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ColumnRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">{label}</span>
      <span className="flex-1 h-px bg-ink/20" />
    </div>
  );
}

export function NumberMark({ n, label }: { n: string; label?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50">{n}</span>
      {label && <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink">{label}</span>}
    </div>
  );
}

export function PullQuote({ children, attribution }: { children: React.ReactNode; attribution?: string }) {
  return (
    <figure className="my-12 border-l-2 border-oxblood pl-6">
      <blockquote className="font-display text-2xl md:text-3xl h-italic leading-snug text-ink">
        {children}
      </blockquote>
      {attribution && <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">— {attribution}</figcaption>}
    </figure>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <div className={cn("h-px bg-ink/15", className)} />;
}

export function Marquee({ items }: { items: string[] }) {
  const all = [...items, ...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {all.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}
