"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/motion";
import { Reveal } from "@/components/editorial";
import { useAuth } from "@/contexts/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Loader2, ArrowUpRight } from "lucide-react";
import { AuthBackdrop } from "@/components/effects/auth-backdrop";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { signInEmail, signInOAuth } = useAuth();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setErr(null); setBusy(true);
    try {
      await signInEmail(data.email, data.password);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message ?? "Sign in failed");
    } finally { setBusy(false); }
  }

  return (
    <PageTransition>
      <AuthBackdrop />
      <section className="container-narrow py-16">
        <Reveal>
          <p className="eyebrow">Sign in</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="h-display text-[48px] sm:text-[72px] md:text-[96px] leading-[0.95] mt-6 text-balance max-w-[14ch]">
            Welcome <span className="h-italic text-oxblood">back</span>.
          </h1>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="lead mt-6 max-w-[60ch]">Sign in to your SafeSquare account.</p>
        </Reveal>

        <Card className="mt-12 p-6 sm:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} className="mt-2" />
              {errors.email && <p className="text-xs text-oxblood mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" {...register("password")} className="mt-2" />
              {errors.password && <p className="text-xs text-oxblood mt-1">{errors.password.message}</p>}
            </div>
            {err && <p className="text-sm text-oxblood">{err}</p>}
            <Button type="submit" disabled={busy} size="lg">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowUpRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <div className="my-8 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-ink/50">
            <span className="h-px flex-1 bg-ink/15" /> or continue with <span className="h-px flex-1 bg-ink/15" />
          </div>

          <div className="grid grid-cols-2 gap-px bg-ink/15 border border-ink/15">
            <Button variant="outline" className="rounded-none py-4" onClick={() => signInOAuth("google")}>Google</Button>
            <Button variant="outline" className="rounded-none py-4" onClick={() => signInOAuth("azure")}>Microsoft</Button>
          </div>
          {!isSupabaseConfigured() && (
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink/50 mt-6 text-center">Demo mode — any email/password works.</p>
          )}
        </Card>

        <p className="text-sm text-center mt-8 text-ink/70">
          New here? <Link href="/register" className="text-oxblood link-underline">Create an account</Link>
        </p>
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-center mt-3 text-ink/50">
          <Link href="/forgot-password" className="hover:text-oxblood">Forgot password?</Link>
        </p>
      </section>
    </PageTransition>
  );
}
