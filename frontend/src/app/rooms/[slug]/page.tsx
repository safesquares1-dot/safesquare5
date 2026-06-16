import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal, NumberMark, ColumnRule } from "@/components/editorial";
import { PageTransition } from "@/components/motion";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, Check } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const room = await api.getRoom(slug);
  if (!room) return { title: "Room not found" };
  return { title: room.name, description: room.description ?? "" };
}

export default async function RoomDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await api.getRoom(slug);
  if (!room) return notFound();

  return (
    <PageTransition>
      <section className="container-wide pt-12 pb-10">
        <Link href="/rooms" className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60 hover:text-oxblood">← Catalogue</Link>
      </section>

      <section className="container-wide pb-12">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-7">
            <Badge>{room.room_type}</Badge>
            <Reveal>
              <h1 className="h-display text-[48px] sm:text-[72px] md:text-[96px] leading-[0.92] mt-6 text-balance">
                {room.name.split(" ").slice(0, -1).join(" ")} <span className="h-italic text-oxblood">{room.name.split(" ").slice(-1)}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lead mt-8 max-w-[60ch]">{room.description}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-baseline gap-6">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Hourly rate</div>
                  <div className="h-display text-5xl mt-1">{formatCurrency(room.hourly_rate)}<span className="h-italic text-ink/40 text-3xl"> /hr</span></div>
                </div>
                <div className="border-l border-ink/20 pl-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Capacity</div>
                  <div className="h-display text-3xl mt-1">Up to {room.capacity}</div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-10 flex gap-3">
                <Button asChild size="lg"><Link href={`/book?room=${room.slug}`}>Reserve this room <ArrowUpRight className="h-4 w-4" /></Link></Button>
                <Button asChild size="lg" variant="outline"><Link href="/contact">Ask a question</Link></Button>
              </div>
            </Reveal>
          </div>

          <aside className="col-span-12 md:col-span-5">
            <div className="aspect-[4/5] bg-ink text-bone relative overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-10">
                {Array.from({ length: 80 }).map((_, k) => <div key={k} className="border-r border-b border-bone/10" />)}
              </div>
              <div className="absolute inset-0 grid place-items-center">
                <div className="font-display h-italic text-[180px] leading-none text-bone/20">{room.room_type[0].toUpperCase()}</div>
              </div>
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-bone/60">
                <span>Live</span><span>●</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/60 flex items-center justify-between">
                <span>{room.room_type}</span>
                <span>Realtime availability</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-bone-2 border-y border-ink/15 py-16">
        <div className="container-wide">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
              <NumberMark n="01" label="Inventory" />
              <h3 className="h3 mt-3">Amenities</h3>
            </div>
            <div className="col-span-12 md:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
              {(room.amenities || []).map((a) => (
                <div key={a} className="bg-bone p-5 flex items-center gap-3">
                  <Check className="h-4 w-4 text-oxblood" />
                  <span className="text-sm">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-wide py-16">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-3">
            <NumberMark n="02" label="House rules" />
          </div>
          <div className="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
            {[
              { h: "Cancellation", b: "Free up to 24 hours before your session. After that, 50% refund up to 2 hours." },
              { h: "Capacity",     b: `Up to ${room.capacity} ${room.capacity === 1 ? "person" : "people"}. Larger groups: contact us.` },
              { h: "Confidentiality", b: "Sound-insulated, with private entrance on selected rooms. CCTV in shared areas only." },
            ].map((b) => (
              <div key={b.h} className="bg-bone p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">{b.h}</div>
                <p className="mt-2 text-ink/80 leading-relaxed text-[15px]">{b.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
