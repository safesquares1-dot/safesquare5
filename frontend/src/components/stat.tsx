"use client";

import { motion } from "framer-motion";

/** Magazine-style count-up that settles on the final number. */
export function Stat({ value, suffix = "+", label }: { value: number; suffix?: string; label: string }) {
  return (
    <div>
      <div className="font-display text-5xl md:text-7xl h-display leading-none">
        <CountUp to={value} />
        <span className="h-italic text-oxblood">{suffix}</span>
      </div>
      <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">{label}</div>
    </div>
  );
}

function CountUp({ to }: { to: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2 }}
    >
      {to.toLocaleString()}
    </motion.span>
  );
}
