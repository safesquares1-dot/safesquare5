import type { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal, NumberMark } from "@/components/editorial";
import { PageTransition } from "@/components/motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FaqBackdrop } from "@/components/effects/faq-backdrop";

export const metadata: Metadata = { title: "Enquiries" };

const DATA: Record<string, { q: string; a: string }[]> = {
  "Booking": [
    { q: "How do I book a room?",       a: "Create an account, verify your practitioner profile, then choose a room, date, and time slot. You'll get an instant confirmation." },
    { q: "Can I reschedule?",           a: "Yes — go to your dashboard, open the booking, and pick a new slot. Free up to 24 hours before your session." },
    { q: "What's the minimum booking?", a: "One hour. After that you can book in 30-minute increments." },
  ],
  "Payments": [
    { q: "What payment methods are accepted?", a: "All major cards via Stripe, plus Apple Pay and Google Pay." },
    { q: "Do you offer invoices?",              a: "Yes — invoices are automatically generated and downloadable from your dashboard." },
    { q: "Refunds policy?",                     a: "Free cancellation up to 24 hours before. After that, 50% refund up to 2 hours. No refund within 2 hours of the session." },
  ],
  "Facilities": [
    { q: "Is there parking?",            a: "Yes — free secure parking for both practitioners and clients." },
    { q: "Is Wi-Fi included?",           a: "Fast, secure Wi-Fi is included in every room." },
    { q: "Are refreshments available?",  a: "Tea, coffee, and water are always available in the shared kitchen." },
  ],
  "Verification": [
    { q: "How long does verification take?", a: "Typically one business day. We review your license and credentials." },
    { q: "What documents are required?",     a: "Professional license or registration, ID, and proof of qualifications." },
  ],
  "Policies": [
    { q: "Can clients come to reception?",   a: "Yes — our reception team greets your clients and shows them to the room." },
    { q: "Is the space confidential?",       a: "Sound-insulated rooms, private entrances, and CCTV only in shared areas." },
  ],
};

export default function FAQPage() {
  return (
    <PageTransition>
      <FaqBackdrop />
      <section className="container-wide pt-16 pb-10">
        <div className="flex items-baseline justify-between border-b border-ink pb-3 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Section 06 · Enquiries</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">5 categories</span>
        </div>
        <Reveal>
          <p className="eyebrow">Enquiries</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="h-display text-[48px] sm:text-[80px] md:text-[112px] leading-[0.92] mt-6 text-balance max-w-[14ch]">
            Frequently <span className="h-italic text-oxblood">asked</span> questions.
          </h1>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="lead mt-8 max-w-[60ch]">
            Quick answers to the most common questions. Can't find what you need? <a className="text-oxblood link-underline" href="/contact">Write to us</a>.
          </p>
        </Reveal>
      </section>

      <section className="container-wide pb-24">
        <Tabs defaultValue="Booking">
          <TabsList>
            {Object.keys(DATA).map((k) => <TabsTrigger key={k} value={k}>{k}</TabsTrigger>)}
          </TabsList>
          {Object.entries(DATA).map(([k, list]) => (
            <TabsContent key={k} value={k} className="mt-8">
              <Accordion type="single" collapsible className="w-full">
                {list.map((item, i) => (
                  <AccordionItem key={i} value={`${k}-${i}`}>
                    <AccordionTrigger value={`${k}-${i+1}`}>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </PageTransition>
  );
}
