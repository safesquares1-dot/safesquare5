import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-32 bg-ink text-bone relative">
      <div className="absolute inset-x-0 top-0 h-px bg-ink/40" />
      <div className="container-wide py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/50">Colophon</p>
            <h2 className="h-display text-bone text-[44px] sm:text-[60px] md:text-[80px] mt-4 leading-[0.95]">
              Safe<span className="h-italic">Square</span> — a clinic, <br />rendered as a magazine.
            </h2>
            <p className="mt-6 max-w-md text-bone/70 text-[15px] leading-relaxed">
              We design rooms, not real estate. Each one calibrated for the quiet,
              considered work that happens between practitioner and client.
            </p>
          </div>

          <div className="lg:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/50">Index</p>
            <ul className="mt-4 space-y-2 text-bone/85">
              {[["/about", "About"], ["/rooms", "Rooms"], ["/gallery", "Gallery"], ["/blog", "Journal"]].map(([h, l]) => (
                <li key={h}><Link href={h} className="link-underline hover:text-bone">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/50">Practitioners</p>
            <ul className="mt-4 space-y-2 text-bone/85">
              {[["/register", "Apply"], ["/book", "Reserve"], ["/dashboard", "Studio"], ["/admin", "Editorial"]].map(([h, l]) => (
                <li key={h}><Link href={h} className="link-underline hover:text-bone">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/50">In person</p>
            <ul className="mt-4 space-y-3 text-bone/85 text-sm">
              <li className="flex items-start gap-2.5"><MapPin className="h-4 w-4 mt-0.5 text-chartreuse" /> 128 Wellness Avenue, Suite 4, San Francisco CA 94102</li>
              <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-chartreuse" /> +1 (415) 555-0148</li>
              <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-chartreuse" /> hello@safesquare.app</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-bone/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono uppercase tracking-[0.22em] text-bone/50">
          <p>© {new Date().getFullYear()} SafeSquare Press. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-bone">Privacy</Link>
            <Link href="/terms" className="hover:text-bone">Terms</Link>
            <Link href="/cookies" className="hover:text-bone">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
