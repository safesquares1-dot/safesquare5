"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion";
import { Reveal, NumberMark } from "@/components/editorial";
import { CheckCircle2, FileText, Upload, User as UserIcon, ArrowUpRight } from "lucide-react";
import { AuthBackdrop } from "@/components/effects/auth-backdrop";

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(7),
  profession: z.string().min(2),
  qualifications: z.string().min(2),
  license_number: z.string().min(2),
  bio: z.string().min(20).max(800),
  password: z.string().min(8),
});
type FormData = z.infer<typeof schema>;

const STEPS = [
  { n: "01", label: "Account" },
  { n: "02", label: "Credentials" },
  { n: "03", label: "Profile" },
  { n: "04", label: "Review" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  async function onSubmit(data: FormData) {
    await api.register({ ...data, role: "practitioner" });
    setSubmitted(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (submitted) {
    return (
      <PageTransition>
        <section className="container-narrow py-24 text-center">
          <Reveal>
            <div className="mx-auto grid h-16 w-16 place-items-center border border-ink">
              <CheckCircle2 className="h-7 w-7 text-oxblood" />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] mt-8 text-ink/60">06 · Filed</p>
            <h1 className="h-display text-5xl md:text-6xl mt-3">Application received.</h1>
            <p className="lead mt-4 max-w-md mx-auto">An editor will review your profile within one business day. We'll be in touch.</p>
            <div className="mt-8"><Button asChild><Link href="/">Back to the index <ArrowUpRight className="h-4 w-4" /></Link></Button></div>
          </Reveal>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <AuthBackdrop />
      <section className="container-narrow py-16">
        <div className="flex items-baseline justify-between border-b border-ink pb-3 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Apply</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">4 steps</span>
        </div>
        <Reveal>
          <p className="eyebrow">Practitioner registration</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="h-display text-[44px] sm:text-[64px] md:text-[80px] leading-[0.95] mt-6 text-balance max-w-[16ch]">
            Join the <span className="h-italic text-oxblood">masthead</span>.
          </h1>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="lead mt-6 max-w-[60ch]">Verified credentialing, fast approval, and a beautiful workspace waiting for you.</p>
        </Reveal>

        <Card className="mt-12 p-6 sm:p-10">
          <ol className="flex flex-wrap items-center gap-3 mb-10 border-b border-ink/15 pb-6">
            {STEPS.map((s, i) => (
              <li key={s.n} className="flex items-center gap-3">
                <span className={`font-mono text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 border ${i <= step ? "bg-ink text-bone border-ink" : "border-ink/20 text-ink/50"}`}>
                  {s.n} · {s.label}
                </span>
                {i < STEPS.length - 1 && <span className="text-ink/30">→</span>}
              </li>
            ))}
          </ol>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
            {step === 0 && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div><Label>Full name</Label><Input {...register("full_name")} className="mt-2" />{errors.full_name && <p className="text-xs text-oxblood mt-1">{errors.full_name.message}</p>}</div>
                <div><Label>Email</Label><Input type="email" {...register("email")} className="mt-2" />{errors.email && <p className="text-xs text-oxblood mt-1">{errors.email.message}</p>}</div>
                <div><Label>Mobile</Label><Input {...register("mobile")} className="mt-2" />{errors.mobile && <p className="text-xs text-oxblood mt-1">{errors.mobile.message}</p>}</div>
                <div><Label>Password</Label><Input type="password" {...register("password")} className="mt-2" />{errors.password && <p className="text-xs text-oxblood mt-1">{errors.password.message}</p>}</div>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-6">
                <div><Label>Profession</Label><Input {...register("profession")} placeholder="e.g. Clinical Psychologist" className="mt-2" />{errors.profession && <p className="text-xs text-oxblood mt-1">{errors.profession.message}</p>}</div>
                <div><Label>Qualifications</Label><Input {...register("qualifications")} placeholder="e.g. MSc Clinical Psychology, BA Psychology" className="mt-2" />{errors.qualifications && <p className="text-xs text-oxblood mt-1">{errors.qualifications.message}</p>}</div>
                <div><Label>License number</Label><Input {...register("license_number")} placeholder="e.g. PSY-12345" className="mt-2" />{errors.license_number && <p className="text-xs text-oxblood mt-1">{errors.license_number.message}</p>}</div>
                <div className="border border-dashed border-ink/30 p-5 flex items-center gap-3 text-sm text-ink/70">
                  <Upload className="h-5 w-5 text-oxblood" /> Upload supporting documents (optional)
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="grid gap-6">
                <div><Label>Professional bio</Label><Textarea rows={6} {...register("bio")} placeholder="Tell us about your practice, your approach, and what clients can expect." className="mt-2" />{errors.bio && <p className="text-xs text-oxblood mt-1">{errors.bio.message}</p>}</div>
                <div className="border border-dashed border-ink/30 p-5 flex items-center gap-3 text-sm text-ink/70">
                  <UserIcon className="h-5 w-5 text-oxblood" /> Profile photo (optional)
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="border border-ink/15 p-6 text-sm text-ink/80 flex items-start gap-3">
                <FileText className="h-5 w-5 text-oxblood mt-0.5" />
                <div>
                  <p>By submitting, you confirm the information provided is accurate and that you agree to our <a className="text-oxblood link-underline" href="#">Terms</a> and <a className="text-oxblood link-underline" href="#">Code of Conduct</a>.</p>
                  <p className="mt-2 text-ink/60">An editor will verify your credentials before activation.</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-ink/15 pt-6">
              <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>← Back</Button>
              {step < 3 ? (
                <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!isValid}>Continue →</Button>
              ) : (
                <Button type="submit">Submit application →</Button>
              )}
            </div>
          </form>
        </Card>
      </section>
    </PageTransition>
  );
}
