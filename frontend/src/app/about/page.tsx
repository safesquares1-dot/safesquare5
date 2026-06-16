import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Reveal, ColumnRule, NumberMark, PullQuote, Hairline } from "@/components/editorial";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/motion";
import { AboutBackdrop } from "@/components/effects/about-backdrop";

export const metadata: Metadata = {
  title: "About",
  description: "Our mission is to give every mental health practitioner a beautiful, flexible, and secure space to do their best work.",
};

const VALUES = [
  { n: "01", title: "Compassion",  body: "We design for wellbeing — both practitioners and clients.",   tone: "bg-ink text-bone" },
  { n: "02", title: "Integrity",   body: "Transparent pricing, honest communication, respect for privacy.", tone: "bg-bone border border-ink/20" },
  { n: "03", title: "Excellence",  body: "Premium facilities, meticulous maintenance, thoughtful service.",   tone: "bg-oxblood text-bone" },
  { n: "04", title: "Impact",      body: "We measure success by the practices we help grow.",                tone: "bg-chartreuse text-ink" },
];

const TEAM = [
  { name: "Lina Okafor",    role: "Founder & CEO",         bio: "Clinical psychologist. Twelve years running group practices.",         initials: "LO" },
  { name: "Daniel Park",    role: "Head of Operations",    bio: "Hospitality veteran obsessed with calm, beautiful spaces.",            initials: "DP" },
  { name: "Sophia Almeida", role: "Lead Designer",         bio: "Interior designer specialising in therapeutic environments.",         initials: "SA" },
  { name: "Marcus Adeyemi", role: "Head of Engineering",   bio: "Builds the booking platform that just works.",                       initials: "MA" },
];

export default function AboutPage() {
  return (
    <PageTransition>
      <AboutBackdrop />
      <section className="container-wide pt-16 pb-12">
        <div className="flex items-baseline justify-between border-b border-ink pb-3 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Section 02 · The House</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">4 minute read</span>
        </div>
        <Reveal>
          <p className="eyebrow">About us</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="h-display text-[48px] sm:text-[80px] md:text-[112px] lg:text-[144px] leading-[0.92] mt-6 text-balance max-w-[18ch]">
            Built by clinicians, <span className="h-italic text-oxblood">for clinicians.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="lead mt-10 max-w-[60ch]">
            SafeSquare was founded to solve a simple problem: practitioners deserve beautiful,
            flexible workspaces without taking on long leases or heavy overheads. So we built one.
          </p>
        </Reveal>
      </section>

      {/* Mission / Vision / Values */}
      <section className="container-wide py-20 md:py-28 border-t border-ink/15">
        <div className="grid grid-cols-12 gap-8 mb-12">
          <div className="col-span-12 md:col-span-4">
            <NumberMark n="01" label="Foundations" />
            <h2 className="h3 mt-4">Mission, vision, and the small set of rules that govern us.</h2>
          </div>
          <div className="col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
            {[
              { n: "i.",   title: "Mission", body: "Give every mental-health practitioner a premium, flexible, and secure space to do their best work." },
              { n: "ii.",  title: "Vision",  body: "A world where booking a great therapy room is as easy as booking a coworking desk." },
              { n: "iii.", title: "Values",  body: "Compassion, integrity, excellence, and lasting impact — every decision we make." },
            ].map((b) => (
              <div key={b.title} className="bg-bone p-7">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">{b.n}</div>
                <h3 className="h-display text-3xl mt-3">{b.title}</h3>
                <p className="mt-3 text-ink/70 text-[15px] leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-bone-2 border-y border-ink/15 py-20 md:py-28">
        <div className="container-wide">
          <div className="grid grid-cols-12 gap-8 mb-12">
            <div className="col-span-12 md:col-span-4">
              <NumberMark n="02" label="What we stand for" />
            </div>
            <div className="col-span-12 md:col-span-8">
              <h2 className="h2 text-balance">Our <span className="h-italic text-oxblood">values</span></h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v) => (
              <div key={v.title} className={`p-8 min-h-[240px] flex flex-col justify-between ${v.tone}`}>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-60">{v.n}</div>
                <div>
                  <h3 className="h-display text-3xl leading-tight">{v.title}</h3>
                  <p className="mt-3 text-sm opacity-80 leading-relaxed">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-wide py-20 md:py-28">
        <PullQuote attribution="Lina Okafor, in a 2025 interview">
          "We were not trying to build a coworking space. We were trying to build a clinic
          that would not feel like a clinic — and that would let practitioners do their
          best work."
        </PullQuote>
      </section>

      {/* Team */}
      <section className="container-wide py-20 md:py-28 border-t border-ink/15">
        <div className="grid grid-cols-12 gap-8 mb-12">
          <div className="col-span-12 md:col-span-4">
            <NumberMark n="03" label="The masthead" />
            <h2 className="h2 mt-4 text-balance">People behind <span className="h-italic text-oxblood">SafeSquare</span></h2>
          </div>
          <div className="col-span-12 md:col-span-8">
            <p className="lead max-w-[60ch]">
              A small team of clinicians, designers, and engineers who would rather
              over-engineer a chair than under-design a room.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-ink/15 border border-ink/15">
          {TEAM.map((m) => (
            <div key={m.name} className="bg-bone p-7 flex flex-col">
              <div className="aspect-square bg-ink text-bone grid place-items-center font-display text-6xl h-italic mb-6">
                {m.initials}
              </div>
              <h3 className="h-display text-2xl">{m.name}</h3>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-oxblood mt-1">{m.role}</div>
              <p className="mt-3 text-ink/70 text-[14px] leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-wide py-20 md:py-28">
        <div className="border border-ink p-10 md:p-16 text-center">
          <h2 className="h2 text-balance max-w-2xl mx-auto">See our facilities.</h2>
          <p className="lead mt-4 max-w-xl mx-auto">A short tour of the rooms, the reception, and the spaces designed for your practice.</p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Button asChild><Link href="/rooms">Browse the rooms <ArrowUpRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="outline"><Link href="/gallery">View the gallery</Link></Button>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
