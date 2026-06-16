import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn, PageTransition } from "@/components/motion";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <PageTransition>
      <section className="container-narrow py-16">
        <FadeIn>
          <h1 className="h1">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: June 15, 2026</p>
        </FadeIn>
        <FadeIn>
          <article className="prose prose-slate max-w-none mt-8 space-y-6 text-foreground/85 leading-relaxed">
            <p>By using SafeSquare you agree to the following terms. Please read them carefully.</p>
            <h2 className="h3">1. Eligibility</h2>
            <p>You must be 18+ and a verified mental health or wellbeing practitioner to book rooms on behalf of clients.</p>
            <h2 className="h3">2. Bookings &amp; cancellation</h2>
            <p>Bookings are confirmed instantly. Free cancellation up to 24 hours before your session. After that, 50% refund up to 2 hours; no refund within 2 hours.</p>
            <h2 className="h3">3. Code of conduct</h2>
            <p>Treat reception staff, other practitioners, and the space with respect. We may suspend accounts that violate this policy.</p>
            <h2 className="h3">4. Liability</h2>
            <p>SafeSquare provides the space and booking platform only. We are not responsible for the clinical services you provide.</p>
            <h2 className="h3">5. Contact</h2>
            <p>Questions? Email legal@safesquare.app.</p>
          </article>
          <div className="mt-10"><Button asChild variant="secondary"><Link href="/">← Back home</Link></Button></div>
        </FadeIn>
      </section>
    </PageTransition>
  );
}
