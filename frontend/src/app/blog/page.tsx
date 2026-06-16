import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal, NumberMark } from "@/components/editorial";
import { PageTransition } from "@/components/motion";
import { ArrowUpRight, Search } from "lucide-react";
import { BlogBackdrop } from "@/components/effects/blog-backdrop";

export const metadata: Metadata = {
  title: "Journal",
  description: "Insights, research, and stories for mental health and wellbeing practitioners.",
};

const CATEGORIES = [
  { slug: "mental-health",       name: "Mental Health" },
  { slug: "psychology",          name: "Psychology" },
  { slug: "therapy",             name: "Therapy" },
  { slug: "wellness",            name: "Wellness" },
  { slug: "clinical-practice",   name: "Clinical Practice" },
  { slug: "practitioner-growth", name: "Practitioner Growth" },
];

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q, category } = await searchParams;
  const blogs = await api.listBlogs({ q, category });

  return (
    <PageTransition>
      <BlogBackdrop />
      <section className="container-wide pt-16 pb-10">
        <div className="flex items-baseline justify-between border-b border-ink pb-3 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Section 05 · The Journal</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">{blogs.length} essays</span>
        </div>
        <Reveal>
          <p className="eyebrow">The Journal</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="h-display text-[48px] sm:text-[72px] md:text-[112px] leading-[0.92] mt-6 text-balance max-w-[16ch]">
            Insights &amp; stories for <span className="h-italic text-oxblood">practitioners</span>.
          </h1>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="lead mt-8 max-w-[60ch]">
            SEO-optimised essays, research summaries, and practical guides — published slowly,
            read carefully.
          </p>
        </Reveal>
      </section>

      <section className="container-wide pb-6">
        <form className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-0 top-1/2 -translate-y-1/2 text-ink/50" />
            <Input name="q" defaultValue={q ?? ""} placeholder="Search the journal…" className="pl-7" />
          </div>
          {q && <Button type="submit">Search</Button>}
        </form>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/blog" className={`pill ${!category ? "pill-fill" : ""}`}>All</Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/blog?category=${c.slug}`}
              className={`pill ${category === c.slug ? "pill-fill" : "hover:border-ink"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-wide pb-24">
        {blogs.length === 0 ? (
          <p className="font-display h-italic text-3xl text-ink/60 py-20 text-center">No essays match that search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
            {blogs.map((b, i) => (
              <Reveal key={b.id} delay={i * 0.05}>
                <Link href={`/blog/${b.slug}`} className="block bg-bone p-7 h-full group">
                  <div className="flex items-baseline justify-between mb-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">No. {String(i + 1).padStart(2, "0")}</span>
                    <ArrowUpRight className="h-4 w-4 text-ink/30 group-hover:text-oxblood transition-colors" />
                  </div>
                  <div className="aspect-[5/3] bg-bone-2 mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-5 grid-rows-3">
                      {Array.from({ length: 15 }).map((_, k) => <div key={k} className="border-r border-b border-ink/10" />)}
                    </div>
                    <div className="absolute bottom-2 left-3 font-display h-italic text-3xl text-ink/30">¶</div>
                  </div>
                  <Badge className="mb-3">Article</Badge>
                  <h3 className="h-display text-2xl leading-tight group-hover:text-oxblood transition-colors">{b.title}</h3>
                  <p className="mt-3 text-ink/70 text-[14px] leading-relaxed line-clamp-3">{b.excerpt}</p>
                  <div className="mt-6 pt-4 border-t border-ink/15 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50 flex items-center justify-between">
                    <span>5 min read</span>
                    <span>Read →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  );
}
