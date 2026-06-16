import type { Metadata } from "next";
import { Reveal, NumberMark } from "@/components/editorial";
import { PageTransition } from "@/components/motion";
import { GalleryBackdrop } from "@/components/effects/gallery-backdrop";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A photographic study of the rooms, the reception, and the spaces designed for your practice.",
};

const PLATES = [
  { id: 1, kind: "Reception",  caption: "Reception — main floor, morning light", tone: "bg-ink text-bone" },
  { id: 2, kind: "Therapy",    caption: "Serenity — adjustable lighting, south-facing", tone: "bg-bone-2 text-ink border border-ink/20" },
  { id: 3, kind: "Waiting",    caption: "Waiting — soft seating, nooks, books", tone: "bg-oxblood text-bone" },
  { id: 4, kind: "Therapy",    caption: "Cove — wood tones, private entrance", tone: "bg-chartreuse text-ink" },
  { id: 5, kind: "Meeting",    caption: "Lumina — eight chairs, one excellent table", tone: "bg-blue-black text-bone" },
  { id: 6, kind: "Consult",    caption: "Aurora — dual seating, natural light", tone: "bg-bone border border-ink/20" },
  { id: 7, kind: "Detail",     caption: "Hardware — brass, leather, oak", tone: "bg-ink text-bone" },
  { id: 8, kind: "Kitchen",    caption: "Kitchen — espresso, tea, water, silence", tone: "bg-bone-2 text-ink border border-ink/20" },
  { id: 9, kind: "Therapy",    caption: "Serenity — at dusk", tone: "bg-oxblood text-bone" },
  { id: 10, kind: "Reception", caption: "Reception — late afternoon", tone: "bg-chartreuse text-ink" },
  { id: 11, kind: "Hallway",  caption: "Hallway — stone, oak, light", tone: "bg-ink text-bone" },
  { id: 12, kind: "Library",  caption: "Library — clinical handbooks, monographs", tone: "bg-bone-2 text-ink border border-ink/20" },
];

export default function GalleryPage() {
  return (
    <PageTransition>
      <GalleryBackdrop />
      <section className="container-wide pt-16 pb-10">
        <div className="flex items-baseline justify-between border-b border-ink pb-3 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Section 04 · Plates</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">12 photographs</span>
        </div>
        <Reveal>
          <p className="eyebrow">Gallery</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="h-display text-[48px] sm:text-[72px] md:text-[96px] leading-[0.92] mt-6 text-balance max-w-[16ch]">
            A peek <span className="h-italic text-oxblood">inside</span> the house.
          </h1>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="lead mt-8 max-w-[60ch]">
            Twelve plates from the rooms, the reception, and the shared spaces.
            Placeholders, while we wait for the photographer.
          </p>
        </Reveal>
      </section>

      <section className="container-wide pb-24">
        <div className="grid grid-cols-12 gap-4">
          {PLATES.map((p, i) => (
            <Reveal key={p.id} delay={(i % 6) * 0.04} className={
              i % 5 === 0 ? "col-span-12 md:col-span-7" :
              i % 4 === 0 ? "col-span-12 md:col-span-5" :
              "col-span-12 sm:col-span-6 md:col-span-4"
            }>
              <figure className={`${p.tone} aspect-[4/3] relative overflow-hidden group`}>
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-6">
                  {Array.from({ length: 48 }).map((_, k) => <div key={k} className="border-r border-b border-current opacity-10" />)}
                </div>
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] opacity-70">
                  <span>Plate {String(p.id).padStart(2, "0")}</span>
                  <span>{p.kind}</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 font-display h-italic text-base opacity-90">
                  {p.caption}
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
