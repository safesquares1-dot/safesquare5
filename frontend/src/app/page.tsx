import Link from "next/link";
import { PremiumMouseField } from "@/components/effects/premium-mouse-field";
import { Button } from "@/components/ui/button";
import { Reveal, NumberMark, PullQuote, Hairline, Marquee } from "@/components/editorial";
import { Stat } from "@/components/stat";
import { ArrowUpRight } from "lucide-react";
import { PageTransition } from "@/components/motion";
import { CountUp, SectionReveal, StickySectionLabel, WordReveal } from "@/components/scroll";
import { HorizontalTrack } from "@/components/horizontal-track";

const FEATURES = [
  { n: "01", title: "Hourly by design",        body: "No leases, no commitments. Book by the hour, day, or recurring slot — pay only for the time you use." },
  { n: "02", title: "Furnished, then some",    body: "Calming, well-equipped therapy and consultation suites. Sound-insulated, with adjustable light and air." },
  { n: "03", title: "A safe perimeter",        body: "Private entrances, CCTV only in shared areas, 24/7 access. Confidentiality by construction." },
  { n: "04", title: "Reception, with grace",   body: "Our team greets your clients by name, manages arrivals, and protects the rhythm of your day." },
  { n: "05", title: "Address matters",         body: "Central San Francisco, with parking and BART within a block. The kind of address a practice deserves." },
  { n: "06", title: "Booked in seconds",       body: "Real-time availability, instant confirmation, automated reminders. The boring parts, handled." },
];

const FACILITIES = [
  { n: "I.",   name: "Therapy Rooms",       blurb: "Quiet, private, and sound-insulated. For the work that depends on silence." },
  { n: "II.",  name: "Consultation Rooms",  blurb: "Bright, professional, dual seating. A room that knows how to host a conversation." },
  { n: "III.", name: "Waiting Area",        blurb: "Comfortable, soft-lit, never crowded. A room that knows how to wait." },
  { n: "IV.",  name: "Reception",           blurb: "A first impression that says: you're in good hands." },
  { n: "V.",   name: "Meeting Rooms",       blurb: "Group sessions, supervision, training. Eight chairs, one excellent table." },
];

const STEPS = [
  { n: "01", title: "Create account",   body: "Two minutes. Just your email, your discipline, and a working calendar." },
  { n: "02", title: "Verify profile",   body: "Upload your license. Admin approval is fast — usually within a business day." },
  { n: "03", title: "Browse rooms",     body: "Real-time availability and hourly rates for every room in the building." },
  { n: "04", title: "Choose a slot",    body: "Pick a date, a time, and a duration. Hold it for ten minutes while you decide." },
  { n: "05", title: "Pay and confirm",  body: "Card, Apple Pay, or invoice. Confirmation lands in your inbox immediately." },
  { n: "06", title: "Arrive and work",  body: "Reception will have your name on a card. The room will be exactly as you left it." },
];

const QUOTES = [
  { quote: "SafeSquare is a clinic that reads like a magazine. My clients notice the difference the moment they walk in.", who: "Dr. Aisha Rahman",    role: "Clinical Psychologist" },
  { quote: "It is, simply, the best-run space I have practised in.",                                                  who: "Marcus Chen, LCSW",   role: "Therapist" },
  { quote: "I expanded from one day a week to four — all without a lease. The flexibility is structural.",            who: "Priya Natarajan",     role: "Wellness Coach" },
];

const ROOMS_PREVIEW = [
  { slug: "serenity-therapy",   name: "Serenity Therapy",    tone: "bg-ink text-bone",        rate: 35, type: "Therapy" },
  { slug: "aurora-consultation",name: "Aurora Consultation", tone: "bg-bone-2 text-ink border border-ink/20", rate: 45, type: "Consultation" },
  { slug: "lumina-meeting",     name: "Lumina Meeting",      tone: "bg-oxblood text-bone",    rate: 60, type: "Meeting" },
  { slug: "cove-therapy",       name: "Cove Therapy",        tone: "bg-chartreuse text-ink",  rate: 32, type: "Therapy" },
  { slug: "haven-consultation", name: "Haven Consultation",  tone: "bg-blue-black text-bone", rate: 50, type: "Consultation" },
];

export default function HomePage() {
  return (
    <PageTransition>
      {/* ================== PREMIUM MOUSE-FOLLOW BACKGROUND ================== */}
      <PremiumMouseField />

      {/* ================== MASTHEAD ================== */}
      <section className="relative">
        <div className="container-wide relative pt-12 pb-24 md:pb-36">
          <Reveal>
            <p className="eyebrow">A clinic, rendered as a magazine</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="h-display text-[60px] sm:text-[96px] md:text-[140px] lg:text-[176px] leading-[0.92] mt-6 text-balance max-w-[16ch]">
              Rooms for the work
              <br />that happens <span className="h-italic text-oxblood">in&nbsp;silence.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="lead mt-8 max-w-[60ch]">
              SafeSquare is a multi-speciality clinic in San Francisco that rents its
              rooms, by the hour, to mental-health and wellbeing practitioners. We
              design the space so you can do the work.
            </p>
          </Reveal>
          <Reveal delay={0.28}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg"><Link href="/book">Reserve a room <ArrowUpRight className="h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="#features">Browse the rooms</Link></Button>
            </div>
          </Reveal>
          <Reveal delay={0.45}>
            <div className="mt-20 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
              <span className="block w-12 h-px bg-ink/30" />
              Scroll to begin
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================== HORIZONTAL — ROOMS PREVIEW ================== */}
      <HorizontalTrack itemWidth="min(80vw, 720px)">
        {ROOMS_PREVIEW.map((r) => (
          <article key={r.slug} className={`${r.tone} p-10 md:p-14 w-full h-[80vh] flex flex-col justify-between`}>
            <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
              <span>{r.type}</span>
              <span>→ drag</span>
            </div>
            <div>
              <div className="font-display text-7xl md:text-9xl h-display leading-none">{r.rate}<span className="h-italic opacity-60 text-3xl"> /hr</span></div>
              <h3 className="h-display text-3xl md:text-5xl mt-6 leading-tight">{r.name}</h3>
              <p className="mt-4 max-w-md opacity-80 leading-relaxed">
                A real room, with the right light, the right chair, and a door that closes.
                The kind of space a practice can be run from, not just visited.
              </p>
              <div className="mt-8">
                <Button asChild variant="outline" className="rounded-none">
                  <Link href={`/book?room=${r.slug}`}>Reserve {r.name.split(" ")[0]} →</Link>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </HorizontalTrack>

      {/* ================== STATS ================== */}
      <SectionReveal className="container-wide py-24 md:py-32">
        <StickySectionLabel n="01" label="By the numbers" />
        <div className="grid grid-cols-12 gap-8 mt-10">
          <div className="col-span-12 md:col-span-3">
            <h2 className="h3">A quiet operation,<br/>by design.</h2>
          </div>
          <div className="col-span-12 md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            <div>
              <div className="h-display text-6xl md:text-8xl leading-none">
                <CountUp value={500} suffix="+" />
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Practitioners served</div>
            </div>
            <div>
              <div className="h-display text-6xl md:text-8xl leading-none">
                <CountUp value={12000} suffix="+" />
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Sessions hosted</div>
            </div>
            <div>
              <div className="h-display text-6xl md:text-8xl leading-none">
                <CountUp value={98} suffix="%" />
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Client satisfaction</div>
            </div>
            <div>
              <div className="h-display text-6xl md:text-8xl leading-none">
                <CountUp value={24} />
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Hour support</div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ================== FEATURES ================== */}
      <SectionReveal className="container-wide py-24 md:py-32" id="features">
        <StickySectionLabel n="02" label="The case for hourly" />
        <div className="grid grid-cols-12 gap-8 mt-10 mb-14">
          <div className="col-span-12 md:col-span-8">
            <h2 className="h2 text-balance">Why choose Safe<span className="h-italic text-oxblood">Square</span></h2>
            <p className="lead mt-4 max-w-[60ch]">
              We are not a coworking space. We are a clinic that happens to be
              rented by the hour — with all the seriousness that implies.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
          {FEATURES.map((f) => (
            <div key={f.n} className="bg-bone p-8 lg:p-10 group hover:bg-bone-2 transition-colors">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">{f.n}</span>
                <ArrowUpRight className="h-4 w-4 text-ink/30 group-hover:text-oxblood transition-colors" />
              </div>
              <h3 className="h-display text-3xl mt-6 leading-tight">{f.title}</h3>
              <p className="mt-3 text-ink/70 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </SectionReveal>

      {/* ================== WORD REVEAL ================== */}
      <SectionReveal className="bg-bone-2 border-y border-ink/15 py-24 md:py-36">
        <div className="container-narrow">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60 mb-6">02 · A small philosophy</p>
          <WordReveal
            text="A clinic is a sentence. We are trying to write a very good one — short, considered, and free of adjectives it does not need."
            className="h-display text-3xl md:text-6xl leading-[1.05]"
          />
        </div>
      </SectionReveal>

      {/* ================== HOW IT WORKS ================== */}
      <SectionReveal className="container-wide py-24 md:py-32">
        <StickySectionLabel n="04" label="How it works" />
        <div className="grid grid-cols-12 gap-8 mt-10 mb-14">
          <div className="col-span-12 md:col-span-8">
            <h2 className="h2 text-balance">From sign-up to <span className="h-italic text-oxblood">first session.</span></h2>
          </div>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
          {STEPS.map((s) => (
            <li key={s.n} className="bg-bone p-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">Step {s.n}</div>
              <h3 className="h-display text-2xl mt-3 leading-tight">{s.title}</h3>
              <p className="mt-3 text-ink/70 text-[15px] leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </SectionReveal>

      {/* ================== TESTIMONIALS ================== */}
      <SectionReveal className="bg-ink text-bone py-24 md:py-32 relative overflow-hidden">
        <div className="container-wide">
          <div className="grid grid-cols-12 gap-8 mb-14">
            <div className="col-span-12 md:col-span-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/50">05 · Voices</p>
            </div>
            <div className="col-span-12 md:col-span-8">
              <h2 className="h2 text-bone text-balance">What our <span className="h-italic text-chartreuse">practitioners</span> say.</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {QUOTES.map((q, i) => (
              <Reveal key={q.who} delay={i * 0.08}>
                <div className="border-t border-bone/20 pt-6">
                  <p className="font-display text-xl h-italic leading-snug">"{q.quote}"</p>
                  <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/60">
                    {q.who} · {q.role}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ================== FINAL CTA ================== */}
      <SectionReveal className="container-wide py-28 md:py-40">
        <div className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 md:col-span-8">
            <p className="eyebrow">06 · Subscription</p>
            <h2 className="h1 mt-6 text-balance">
              Ready to grow <br /><span className="h-italic text-oxblood">your practice?</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4 flex flex-wrap gap-3 md:justify-end">
            <Button asChild size="lg"><Link href="/register">Apply to join →</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/contact">Speak to the editor</Link></Button>
          </div>
        </div>
      </SectionReveal>
    </PageTransition>
  );
}
