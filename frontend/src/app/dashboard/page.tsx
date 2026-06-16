"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, CreditCard, MapPin, TrendingUp, User, LogOut, Edit3, Bell, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion";
import { Stat } from "@/components/stat";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { RoleGuard } from "@/components/role-guard";
import { NumberMark, Reveal, Hairline } from "@/components/editorial";
import { ArrowUpRight } from "lucide-react";
import { DashboardBackdrop } from "@/components/effects/dashboard-backdrop";

export default function DashboardPage() {
  return (
    <RoleGuard allow={["practitioner", "admin"]}>
      <DashboardInner />
    </RoleGuard>
  );
}

function DashboardInner() {
  const { user, signOut } = useAuth();
  const token = typeof window !== "undefined" ? (localStorage.getItem("ssq_token") || "demo-token") : "";
  const { data: bookings = [] } = useQuery({ queryKey: ["my-bookings", user?.id], queryFn: () => api.myBookings(token), enabled: !!user });

  const upcoming = bookings.filter((b: any) => new Date(b.booking_date) >= new Date());
  const totalSpent = bookings.reduce((s: number, b: any) => s + Number(b.total_amount || 0), 0);

  return (
    <PageTransition>
      <DashboardBackdrop />
      <section className="container-wide py-12">
        <div className="flex items-baseline justify-between border-b border-ink pb-3 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Studio · Logged in</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">{user?.email}</span>
        </div>
        <Reveal>
          <p className="eyebrow">Practitioner studio</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="h-display text-[44px] sm:text-[64px] md:text-[88px] leading-[0.95] mt-6 text-balance max-w-[18ch]">
            Good morning,<br/><span className="h-italic text-oxblood">{user?.full_name || user?.email?.split("@")[0] || "practitioner"}.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild><Link href="/book">Reserve a room <ArrowUpRight className="h-4 w-4" /></Link></Button>
            <Button variant="outline" onClick={signOut}><LogOut className="h-4 w-4" /> Sign out</Button>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/15 border border-ink/15">
          <div className="bg-bone p-6"><NumberMark n="01" /><div className="mt-4"><Stat value={upcoming.length} suffix="" label="Upcoming bookings" /></div></div>
          <div className="bg-bone p-6"><NumberMark n="02" /><div className="mt-4"><Stat value={bookings.length} suffix="" label="Total bookings" /></div></div>
          <div className="bg-bone p-6"><NumberMark n="03" /><div className="mt-4"><Stat value={Math.round(totalSpent)} suffix="" label="Total spent (USD)" /></div></div>
          <div className="bg-bone p-6"><NumberMark n="04" /><div className="mt-4"><Stat value={bookings.length} suffix="" label="Hours booked" /></div></div>
        </div>

        <div className="mt-16 grid gap-px lg:grid-cols-3 bg-ink/15 border border-ink/15">
          <div className="bg-bone p-8 lg:col-span-2">
            <div className="flex items-baseline justify-between mb-6">
              <NumberMark n="01" label="Upcoming bookings" />
              <Button variant="ghost" size="sm">View all →</Button>
            </div>
            {upcoming.length === 0 ? (
              <div className="border border-dashed border-ink/30 p-8 text-center text-sm text-ink/60 mt-2">
                No upcoming bookings. <Link href="/book" className="text-oxblood link-underline">Reserve a room →</Link>
              </div>
            ) : (
              <ul className="divide-y divide-ink/10">
                {upcoming.slice(0, 5).map((b: any) => (
                  <li key={b.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="h-display text-xl flex items-center gap-2"><MapPin className="h-4 w-4 text-oxblood" /> Room {b.room_id.slice(0,6)}</div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(b.booking_date).toDateString()}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {b.start_time}–{b.end_time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={b.status === "confirmed" ? "bg-oxblood text-bone border-oxblood" : ""}>{b.status}</Badge>
                      <span className="h-display text-2xl">{formatCurrency(Number(b.total_amount))}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-bone p-8">
            <NumberMark n="02" label="Profile" />
            <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Signed in as</div>
            <div className="h-display text-2xl mt-1">{user?.email}</div>
            <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Role</div>
            <div className="h-display text-2xl mt-1 capitalize">{user?.role}</div>
            <Button variant="outline" size="sm" className="mt-6"><Edit3 className="h-3 w-3" /> Edit profile</Button>

            <Hairline className="my-8" />
            <NumberMark n="03" label="Notifications" />
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-oxblood mt-0.5" /> Profile approved by admin.</div>
              <div className="flex items-start gap-2"><FileText className="h-4 w-4 text-ink/40 mt-0.5" /> Welcome to SafeSquare.</div>
            </div>
          </div>
        </div>

        <div className="mt-px grid gap-px lg:grid-cols-2 bg-ink/15 border-x border-b border-ink/15">
          <div className="bg-bone p-8">
            <NumberMark n="04" label="Payment summary" />
            <div className="h-display text-7xl mt-4">{formatCurrency(totalSpent)}</div>
            <div className="mt-2 text-sm text-ink/60">Total spent across {bookings.length} bookings</div>
            <Button variant="outline" size="sm" className="mt-6">Download invoices →</Button>
          </div>
          <div className="bg-bone p-8">
            <NumberMark n="05" label="Monthly usage" />
            <div className="h-display text-7xl mt-4">{bookings.length}<span className="h-italic text-ink/40 text-4xl"> hrs / month</span></div>
            <div className="mt-2 text-sm text-ink/60">Updated daily from your booking history.</div>
            <Button variant="outline" size="sm" className="mt-6">View report →</Button>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
