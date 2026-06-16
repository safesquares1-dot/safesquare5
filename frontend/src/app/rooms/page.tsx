import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal, NumberMark, ColumnRule } from "@/components/editorial";
import { PageTransition } from "@/components/motion";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, Users } from "lucide-react";
import { RoomsBackdrop } from "@/components/effects/rooms-backdrop";

export const metadata: Metadata = {
  title: "Rooms & Facilities",
  description: "Browse our therapy, consultation, and meeting rooms. Real-time availability, transparent hourly rates.",
};

const AMENITY_GLYPH: Record<string, string> = {
  "Wi-Fi": "◆", "Whiteboard": "◐", "Desk": "▭", "Projector": "▲",
  "Sound insulation": "≈", "Air purifier": "◌", "Adjustable lighting": "◑",
  "Warm lighting": "◓", "Private entrance": "↳", "Natural light": "✺",
  "Video conferencing": "▶", "Conference table": "▭", "Two chairs": "◯",
  "Comfortable seating": "◯", "White noise": "≈",
};

export default async function RoomsPage({ searchParams }: { searchParams: Promise<{ type?: string; cap?: string; max?: string }> }) {
  const params = await searchParams;
  const rooms = await api.listRooms({
    room_type: params.type,
    min_capacity: params.cap ? Number(params.cap) : undefined,
    max_price: params.max ? Number(params.max) : undefined,
  });

  return (
    <PageTransition>
      <RoomsBackdrop />
      <section className="container-wide pt-16 pb-10">
        <div className="flex items-baseline justify-between border-b border-ink pb-3 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Section 03 · The Catalogue</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">{rooms.length} rooms</span>
        </div>
        <Reveal>
          <p className="eyebrow">Rooms &amp; Facilities</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="h-display text-[48px] sm:text-[72px] md:text-[96px] lg:text-[120px] leading-[0.92] mt-6 text-balance max-w-[16ch]">
            A space for every <span className="h-italic text-oxblood">kind</span> of session.
          </h1>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="lead mt-8 max-w-[60ch]">
            From quiet one-on-one therapy to bright consultation suites and spacious group rooms.
            Real-time availability, transparent hourly rates.
          </p>
        </Reveal>
      </section>

      <section className="container-wide pb-10">
        <form className="grid gap-px sm:grid-cols-4 bg-ink/15 border border-ink/15">
          <select name="type" defaultValue={params.type ?? ""} className="bg-bone px-4 py-4 text-sm font-mono uppercase tracking-[0.15em] border-r border-ink/15">
            <option value="">All types</option>
            <option value="therapy">Therapy</option>
            <option value="consultation">Consultation</option>
            <option value="meeting">Meeting</option>
          </select>
          <select name="cap" defaultValue={params.cap ?? ""} className="bg-bone px-4 py-4 text-sm font-mono uppercase tracking-[0.15em] border-r border-ink/15">
            <option value="">Any capacity</option>
            <option value="1">1+ people</option>
            <option value="2">2+ people</option>
            <option value="4">4+ people</option>
            <option value="6">6+ people</option>
          </select>
          <select name="max" defaultValue={params.max ?? ""} className="bg-bone px-4 py-4 text-sm font-mono uppercase tracking-[0.15em] border-r border-ink/15">
            <option value="">Any hourly rate</option>
            <option value="30">Up to $30</option>
            <option value="40">Up to $40</option>
            <option value="50">Up to $50</option>
            <option value="70">Up to $70</option>
          </select>
          <Button type="submit" variant="primary" className="rounded-none">Apply filters</Button>
        </form>
      </section>

      <section className="container-wide pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
          {rooms.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.05}>
              <article className="bg-bone p-7 h-full flex flex-col group">
                <div className="flex items-baseline justify-between mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">No. {String(i + 1).padStart(2, "0")}</span>
                  <ArrowUpRight className="h-4 w-4 text-ink/30 group-hover:text-oxblood transition-colors" />
                </div>

                <div className="aspect-[4/3] bg-bone-2 mb-6 grid place-items-center relative overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
                    {Array.from({ length: 24 }).map((_, k) => (
                      <div key={k} className="border-r border-b border-ink/10 last:border-r-0" />
                    ))}
                  </div>
                  <div className="relative font-display h-italic text-7xl text-ink/15">{r.room_type[0].toUpperCase()}</div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge>{r.room_type}</Badge>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60 flex items-center gap-1">
                    <Users className="h-3 w-3" /> {r.capacity}
                  </span>
                </div>
                <h3 className="h-display text-2xl">{r.name}</h3>
                <p className="mt-2 text-sm text-ink/70 leading-relaxed line-clamp-2">{r.description}</p>

                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/60">
                  {(r.amenities || []).slice(0, 4).map((a) => (
                    <span key={a} className="flex items-center gap-1.5 font-mono uppercase tracking-[0.1em]">
                      <span className="text-oxblood">{AMENITY_GLYPH[a] || "·"}</span>{a}
                    </span>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-ink/15 flex items-end justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50">Per hour</div>
                    <div className="h-display text-3xl mt-1">{formatCurrency(r.hourly_rate)}</div>
                  </div>
                  <Button asChild size="sm"><Link href={`/book?room=${r.slug}`}>Reserve →</Link></Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
