import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn, PageTransition } from "@/components/motion";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <PageTransition>
      <section className="container-narrow py-16">
        <FadeIn>
          <h1 className="h1">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: June 15, 2026</p>
        </FadeIn>
        <FadeIn>
          <article className="prose prose-slate max-w-none mt-8 space-y-6 text-foreground/85 leading-relaxed">
            <p>SafeSquare ("we", "us") respects your privacy. This policy describes what data we collect, how we use it, and the choices you have.</p>
            <h2 className="h3">1. Data we collect</h2>
            <p>Account info (name, email, phone), practitioner credentials, booking history, payment metadata (we never store full card numbers), and basic device/usage data.</p>
            <h2 className="h3">2. How we use it</h2>
            <p>To operate the platform, verify credentials, process bookings and payments, send transactional emails, and improve our services. We never sell your data.</p>
            <h2 className="h3">3. Storage &amp; security</h2>
            <p>Data is stored on Supabase (PostgreSQL) with row-level security, encryption at rest, and TLS in transit. Access is role-based and audited.</p>
            <h2 className="h3">4. Your rights</h2>
            <p>You can request access, correction, or deletion of your data at any time by emailing privacy@safesquare.app.</p>
            <h2 className="h3">5. Contact</h2>
            <p>Questions? Email privacy@safesquare.app.</p>
          </article>
          <div className="mt-10"><Button asChild variant="secondary"><Link href="/">← Back home</Link></Button></div>
        </FadeIn>
      </section>
    </PageTransition>
  );
}
