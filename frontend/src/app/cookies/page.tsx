import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn, PageTransition } from "@/components/motion";

export const metadata = { title: "Cookies" };

export default function CookiesPage() {
  return (
    <PageTransition>
      <section className="container-narrow py-16">
        <FadeIn>
          <h1 className="h1">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: June 15, 2026</p>
        </FadeIn>
        <FadeIn>
          <article className="prose prose-slate max-w-none mt-8 space-y-6 text-foreground/85 leading-relaxed">
            <p>We use a minimal set of cookies to keep you signed in, remember your preferences, and measure aggregate usage.</p>
            <h2 className="h3">What we use</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><b>Essential</b> — session, CSRF, auth tokens</li>
              <li><b>Preferences</b> — language, theme</li>
              <li><b>Analytics</b> — anonymized usage data</li>
            </ul>
            <h2 className="h3">Your choices</h2>
            <p>You can block non-essential cookies in your browser. Some features (sign-in) require essential cookies.</p>
          </article>
          <div className="mt-10"><Button asChild variant="secondary"><Link href="/">← Back home</Link></Button></div>
        </FadeIn>
      </section>
    </PageTransition>
  );
}
