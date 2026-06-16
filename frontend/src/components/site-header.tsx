"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/",        label: "Index",        n: "01" },
  { href: "/about",   label: "About",        n: "02" },
  { href: "/rooms",   label: "Rooms",        n: "03" },
  { href: "/gallery", label: "Gallery",      n: "04" },
  { href: "/blog",    label: "Journal",      n: "05" },
  { href: "/faq",     label: "Enquiries",    n: "06" },
  { href: "/contact", label: "Contact",      n: "07" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* Top utility bar */}
      <div className="border-b border-ink/15">
        <div className="container-wide flex h-9 items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-ink/70">
          <span>Est. 2024 — San Francisco</span>
          <span className="hidden sm:inline">Volume 04 · Issue 06 · MMXXVI</span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-oxblood animate-pulse" />
            Booking open
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-bone/90 backdrop-blur-md border-b border-ink/15">
        <div className="container-wide flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href="/" className="group flex items-center gap-3">
            <span className="relative grid h-9 w-9 place-items-center border border-ink">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink"><path d="M3 14 Q 7 8, 12 14 T 21 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </span>
            <span className="font-display text-2xl font-light leading-none">
              Safe<span className="h-italic">Square</span>
              <span className="ml-1.5 align-top text-[10px] font-mono uppercase tracking-[0.22em] text-ink/50">®</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative font-mono text-[11px] uppercase tracking-[0.22em] transition-colors",
                    active ? "text-oxblood" : "text-ink/80 hover:text-ink"
                  )}
                >
                  <span className="mr-1.5 text-ink/40">{item.n}</span>
                  {item.label}
                  {active && <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-oxblood" />}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link href="/login" className="btn-ghost">Sign in</Link>
            <Link href="/book" className="btn-primary">Reserve a room <span aria-hidden>→</span></Link>
          </div>

          <button
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid h-10 w-10 place-items-center border border-ink"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="lg:hidden overflow-hidden border-b border-ink bg-bone"
          >
            <div className="container-wide py-6 grid gap-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-baseline justify-between border-b border-ink/10 py-3 font-display text-2xl"
                >
                  <span><span className="font-mono text-xs text-ink/40 mr-3">{item.n}</span>{item.label}</span>
                  <span className="text-ink/40">→</span>
                </Link>
              ))}
              <div className="mt-3 flex gap-2">
                <Link href="/login" className="btn-outline flex-1 justify-center">Sign in</Link>
                <Link href="/book" className="btn-primary flex-1 justify-center">Reserve →</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
