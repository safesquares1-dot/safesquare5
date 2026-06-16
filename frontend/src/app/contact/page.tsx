"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Reveal, NumberMark } from "@/components/editorial";
import { PageTransition } from "@/components/motion";
import { MapPin, Phone, Mail, Clock4, Send, Check, ArrowUpRight } from "lucide-react";
import { ContactBackdrop } from "@/components/effects/contact-backdrop";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    await api.submitContact({
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      subject: form.get("subject"),
      message: form.get("message"),
    });
    setStatus("sent");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <PageTransition>
      <ContactBackdrop />
      <section className="container-wide pt-16 pb-10">
        <div className="flex items-baseline justify-between border-b border-ink pb-3 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Section 07 · Letters</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Replies in 1 business day</span>
        </div>
        <Reveal>
          <p className="eyebrow">Contact us</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="h-display text-[48px] sm:text-[72px] md:text-[112px] leading-[0.92] mt-6 text-balance max-w-[16ch]">
            We'd love to <span className="h-italic text-oxblood">hear</span> from you.
          </h1>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="lead mt-8 max-w-[60ch]">
            Questions about rooms, pricing, or becoming a practitioner?
            Drop us a line; we respond within one business day.
          </p>
        </Reveal>
      </section>

      <section className="container-wide pb-24">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-7">
            <NumberMark n="01" label="The form" />
            <div className="mt-6 border-t border-ink pt-8">
              {status === "sent" ? (
                <div className="py-12 text-center">
                  <div className="inline-grid h-14 w-14 place-items-center border border-ink text-oxblood"><Check className="h-6 w-6" /></div>
                  <h3 className="h-display text-3xl mt-6">Letter received.</h3>
                  <p className="mt-3 text-ink/70">We'll be in touch within one business day.</p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
                  <div><Label>Name</Label><Input name="name" required className="mt-2" /></div>
                  <div><Label>Email</Label><Input name="email" type="email" required className="mt-2" /></div>
                  <div><Label>Phone</Label><Input name="phone" className="mt-2" /></div>
                  <div><Label>Subject</Label><Input name="subject" className="mt-2" /></div>
                  <div className="sm:col-span-2"><Label>Message</Label><Textarea name="message" required className="mt-2" /></div>
                  <div className="sm:col-span-2 mt-2">
                    <Button size="lg" type="submit" disabled={status === "sending"}>
                      {status === "sending" ? "Sending…" : <>Send letter <Send className="h-4 w-4" /></>}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <aside className="col-span-12 md:col-span-5 md:border-l md:border-ink/15 md:pl-8">
            <NumberMark n="02" label="In person" />
            <div className="mt-6 border-t border-ink pt-8 space-y-6">
              {[
                { icon: MapPin, title: "Address",   body: "128 Wellness Avenue, Suite 4\nSan Francisco, CA 94102" },
                { icon: Phone,  title: "Telephone", body: "+1 (415) 555-0148\nMon–Sat, 8am–8pm" },
                { icon: Mail,   title: "Letters",   body: "hello@safesquare.app\nReplies in 1 business day." },
                { icon: Clock4, title: "Hours",     body: "Mon–Sat 8:00 — 20:00\nSun — closed" },
              ].map((c) => (
                <div key={c.title} className="flex items-start gap-4 pb-6 border-b border-ink/10 last:border-0">
                  <span className="grid h-10 w-10 place-items-center border border-ink shrink-0">
                    <c.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">{c.title}</div>
                    <div className="mt-1 text-ink/80 whitespace-pre-line leading-relaxed">{c.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 aspect-[4/3] border border-ink grid place-items-center text-center text-ink/50 font-mono text-[10px] uppercase tracking-[0.22em] bg-bone-2">
              <div>
                <MapPin className="h-5 w-5 mx-auto mb-2 text-oxblood" />
                <span>Map — 128 Wellness Ave</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
}
