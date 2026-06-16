import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal, NumberMark, PullQuote } from "@/components/editorial";
import { PageTransition } from "@/components/motion";
import { Calendar, Twitter, Linkedin, ArrowUpRight } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await api.getBlog(slug);
  if (!blog) return { title: "Essay not found" };
  return {
    title: blog.meta_title || blog.title,
    description: blog.meta_description || blog.excerpt || "",
    openGraph: { title: blog.title, description: blog.excerpt ?? "", type: "article" },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await api.getBlog(slug);
  if (!blog) return notFound();

  return (
    <PageTransition>
      <article>
        <section className="container-wide pt-12 pb-10">
          <Link href="/blog" className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60 hover:text-oxblood">← Journal</Link>
        </section>

        <section className="container-narrow pb-12">
          <Badge className="mb-6">Essay</Badge>
          <Reveal>
            <h1 className="h-display text-[36px] sm:text-[56px] md:text-[80px] leading-[0.95] text-balance">
              {blog.title}
            </h1>
          </Reveal>
          {blog.excerpt && (
            <Reveal delay={0.1}>
              <p className="lead mt-8 text-pretty">{blog.excerpt}</p>
            </Reveal>
          )}
          <Reveal delay={0.2}>
            <div className="mt-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60 border-t border-b border-ink/15 py-4">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(blog.published_at || blog.created_at || Date.now()).toDateString()}</span>
              <span className="ml-auto flex items-center gap-3">
                <span>Share</span>
                <a href="#" className="hover:text-oxblood"><Twitter className="h-4 w-4" /></a>
                <a href="#" className="hover:text-oxblood"><Linkedin className="h-4 w-4" /></a>
              </span>
            </div>
          </Reveal>
        </section>

        <section className="container-narrow pb-12">
          <div className="aspect-[3/2] bg-ink text-bone relative overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6">
              {Array.from({ length: 72 }).map((_, k) => <div key={k} className="border-r border-b border-bone/10" />)}
            </div>
            <div className="absolute inset-0 grid place-items-center font-display h-italic text-[200px] text-bone/20">¶</div>
          </div>
        </section>

        <section className="container-narrow pb-24">
          <Reveal>
            <article className="prose prose-slate max-w-none">
              {blog.content.split("\n").map((line, i) => {
                if (line.startsWith("# "))  return <h2 key={i} className="h-display text-4xl md:text-5xl mt-12 mb-4 leading-tight">{line.slice(2)}</h2>;
                if (line.startsWith("## ")) return <h3 key={i} className="h-display text-2xl md:text-3xl mt-10 mb-3 leading-tight">{line.slice(3)}</h3>;
                if (!line.trim()) return null;
                return <p key={i} className="mt-5 text-ink/85 leading-relaxed text-[17px]">{line}</p>;
              })}
            </article>
          </Reveal>

          <Reveal>
            <PullQuote attribution="Editor's note">
              "Reading a great essay in a beautiful room is its own kind of practice."
            </PullQuote>
          </Reveal>

          <div className="mt-12 border-t border-ink/15 pt-8 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
            <span>Filed under · Practice</span>
            <Link href="/blog" className="hover:text-oxblood inline-flex items-center gap-1">All essays <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
        </section>
      </article>
    </PageTransition>
  );
}
