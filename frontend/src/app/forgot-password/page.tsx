"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/motion";
import { Reveal } from "@/components/editorial";
import { ArrowLeft, Mail, Loader2, ArrowUpRight } from "lucide-react";
import { AuthBackdrop } from "@/components/effects/auth-backdrop";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false); setSent(true);
  }

  return (
    <PageTransition>
      <AuthBackdrop />
      <section className="container-narrow py-16">
        <Link href="/login" className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60 inline-flex items-center gap-1.5 hover:text-oxblood">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
        <Reveal>
          <h1 className="h-display text-[48px] sm:text-[72px] md:text-[80px] leading-[0.95] mt-6 text-balance max-w-[16ch]">
            Reset your <span className="h-italic text-oxblood">password</span>.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lead mt-4">We'll email you a secure link to reset it.</p>
        </Reveal>

        <Card className="mt-12 p-6 sm:p-10">
          {sent ? (
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-oxblood flex items-center gap-2">
              <Mail className="h-4 w-4" /> If an account exists, a reset link is on its way.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-6">
              <div>
                <Label>Email</Label>
                <Input type="email" required className="mt-2" />
              </div>
              <Button type="submit" disabled={busy} size="lg">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send reset link <ArrowUpRight className="h-4 w-4" /></>}
              </Button>
            </form>
          )}
        </Card>
      </section>
    </PageTransition>
  );
}
