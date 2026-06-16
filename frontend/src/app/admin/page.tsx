"use client";

import { useState } from "react";
import { Users, FileText, TrendingUp, Edit, Trash2, Check, X, Search, Building2, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion";
import { Reveal, NumberMark, Hairline } from "@/components/editorial";
import { RoleGuard } from "@/components/role-guard";
import { useAuth } from "@/contexts/auth";
import { formatCurrency } from "@/lib/utils";
import { AdminBackdrop } from "@/components/effects/admin-backdrop";

const TABS = ["Overview", "Rooms", "Bookings", "Practitioners", "Journal"] as const;

const ROOMS = [
  { id: "1", name: "Serenity Therapy",    type: "therapy",       rate: 35, status: "active" },
  { id: "2", name: "Aurora Consultation", type: "consultation", rate: 45, status: "active" },
  { id: "3", name: "Lumina Meeting",      type: "meeting",      rate: 60, status: "active" },
  { id: "4", name: "Cove Therapy",        type: "therapy",      rate: 32, status: "maintenance" },
];

const PRACTITIONERS = [
  { id: "1", name: "Dr. Aisha Rahman",  email: "aisha@x.com",  status: "approved", bookings: 28 },
  { id: "2", name: "Marcus Chen",       email: "marcus@x.com", status: "approved", bookings: 19 },
  { id: "3", name: "Priya Natarajan",   email: "priya@x.com",  status: "pending",  bookings: 0 },
  { id: "4", name: "Dr. Sam Whitaker",  email: "sam@x.com",    status: "pending",  bookings: 0 },
];

const BOOKINGS = [
  { id: "b1", room: "Serenity Therapy",    practitioner: "Dr. Aisha",  date: "2026-06-16", time: "10:00–11:00", amount: 35,   status: "confirmed" },
  { id: "b2", room: "Aurora Consultation", practitioner: "Marcus Chen", date: "2026-06-16", time: "14:00–15:30", amount: 67.5, status: "confirmed" },
  { id: "b3", room: "Lumina Meeting",      practitioner: "Priya N.",    date: "2026-06-17", time: "09:00–12:00", amount: 180,  status: "pending" },
  { id: "b4", room: "Cove Therapy",        practitioner: "Dr. Aisha",   date: "2026-06-18", time: "16:00–17:00", amount: 32,   status: "cancelled" },
];

const BLOGS = [
  { id: "1", title: "Choosing the right therapy space",  category: "Therapy",  status: "published" },
  { id: "2", title: "5 signs your practice needs a refresh", category: "Growth", status: "draft" },
];

export default function AdminPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <AdminInner />
    </RoleGuard>
  );
}

function AdminInner() {
  const { signOut, user } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [q, setQ] = useState("");

  return (
    <PageTransition>
      <AdminBackdrop />
      <section className="container-wide py-12">
        <div className="flex items-baseline justify-between border-b border-ink pb-3 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Editorial</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">{user?.email}</span>
        </div>
        <Reveal>
          <p className="eyebrow">Operations</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="h-display text-[44px] sm:text-[64px] md:text-[88px] leading-[0.95] mt-6 text-balance max-w-[18ch]">
            The <span className="h-italic text-oxblood">desk</span>, at a glance.
          </h1>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={signOut}>Sign out</Button>
          </div>
        </Reveal>

        <div className="mt-12 flex flex-wrap gap-px bg-ink/15 border border-ink/15 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] transition ${tab === t ? "bg-ink text-bone" : "bg-bone text-ink/70 hover:text-ink"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <>
            <div className="mt-px grid grid-cols-2 md:grid-cols-5 gap-px bg-ink/15 border-x border-b border-ink/15">
              <div className="bg-bone p-6"><NumberMark n="01" /><div className="mt-4"><Stat value={132} suffix="" label="Practitioners" /></div></div>
              <div className="bg-bone p-6"><NumberMark n="02" /><div className="mt-4"><Stat value={48} suffix="" label="Active bookings" /></div></div>
              <div className="bg-bone p-6"><NumberMark n="03" /><div className="mt-4"><Stat value={48200} suffix="" label="Revenue" /></div></div>
              <div className="bg-bone p-6"><NumberMark n="04" /><div className="mt-4"><Stat value={78} suffix="%" label="Occupancy" /></div></div>
              <div className="bg-bone p-6"><NumberMark n="05" /><div className="mt-4"><Stat value={4} suffix="" label="Rooms" /></div></div>
            </div>

            <div className="mt-px grid gap-px lg:grid-cols-2 bg-ink/15 border-x border-b border-ink/15">
              <div className="bg-bone p-8">
                <NumberMark n="06" label="Revenue" />
                <h3 className="h-display text-3xl mt-3">Last 7 days</h3>
                <div className="mt-6"><Sparkline values={[120, 180, 220, 260, 290, 340, 410]} /></div>
              </div>
              <div className="bg-bone p-8">
                <NumberMark n="07" label="Utilization" />
                <h3 className="h-display text-3xl mt-3">By room</h3>
                <div className="mt-6 space-y-4 text-sm">
                  {ROOMS.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-3">
                      <span className="w-32 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">No. {String(i+1).padStart(2,"0")}</span>
                      <span className="w-32 truncate">{r.name}</span>
                      <div className="flex-1 h-2 bg-ink/10 relative">
                        <div className="absolute inset-y-0 left-0 bg-ink" style={{ width: `${30 + (i * 13) % 70}%` }} />
                      </div>
                      <span className="num w-12 text-right">{30 + (i * 13) % 70}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "Rooms" && (
          <div className="mt-px bg-bone border-x border-b border-ink/15">
            <div className="flex items-center justify-between p-6 border-b border-ink/15">
              <h3 className="h-display text-3xl">Rooms</h3>
              <Button>New room +</Button>
            </div>
            <Table headers={["No.", "Name", "Type", "Rate", "Status", ""]}>
              {ROOMS.map((r, i) => (
                <tr key={r.id} className="border-t border-ink/10">
                  <td className="py-4 num text-ink/50">{(i+1).toString().padStart(2,"0")}</td>
                  <td className="py-4 h-display text-xl">{r.name}</td>
                  <td className="py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">{r.type}</td>
                  <td className="py-4">{formatCurrency(r.rate)}<span className="text-ink/50 text-xs">/hr</span></td>
                  <td className="py-4"><Badge className={r.status === "active" ? "bg-ink text-bone border-ink" : "bg-bone border-ink/30 text-ink/70"}>{r.status}</Badge></td>
                  <td className="py-4 text-right">
                    <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-oxblood" /></Button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}

        {tab === "Bookings" && (
          <div className="mt-px bg-bone border-x border-b border-ink/15">
            <div className="p-6 border-b border-ink/15"><h3 className="h-display text-3xl">All bookings</h3></div>
            <Table headers={["No.", "Room", "Practitioner", "Date", "Time", "Amount", "Status"]}>
              {BOOKINGS.map((b, i) => (
                <tr key={b.id} className="border-t border-ink/10">
                  <td className="py-4 num text-ink/50">{(i+1).toString().padStart(2,"0")}</td>
                  <td className="py-4">{b.room}</td>
                  <td className="py-4">{b.practitioner}</td>
                  <td className="py-4 num">{b.date}</td>
                  <td className="py-4 num">{b.time}</td>
                  <td className="py-4">{formatCurrency(b.amount)}</td>
                  <td className="py-4"><Badge className={b.status === "confirmed" ? "bg-ink text-bone border-ink" : b.status === "pending" ? "bg-bone border-ink/30 text-ink/70" : "bg-oxblood text-bone border-oxblood"}>{b.status}</Badge></td>
                </tr>
              ))}
            </Table>
          </div>
        )}

        {tab === "Practitioners" && (
          <div className="mt-px bg-bone border-x border-b border-ink/15">
            <div className="p-6 border-b border-ink/15 flex items-center justify-between gap-3">
              <h3 className="h-display text-3xl">Practitioners</h3>
              <div className="relative w-64">
                <Search className="h-4 w-4 absolute left-0 top-1/2 -translate-y-1/2 text-ink/50" />
                <Input className="pl-7" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
              </div>
            </div>
            <Table headers={["No.", "Name", "Email", "Status", "Bookings", "Actions"]}>
              {PRACTITIONERS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).map((p, i) => (
                <tr key={p.id} className="border-t border-ink/10">
                  <td className="py-4 num text-ink/50">{(i+1).toString().padStart(2,"0")}</td>
                  <td className="py-4 h-display text-xl">{p.name}</td>
                  <td className="py-4 text-ink/70 num">{p.email}</td>
                  <td className="py-4"><Badge className={p.status === "approved" ? "bg-ink text-bone border-ink" : "bg-bone border-ink/30 text-ink/70"}>{p.status}</Badge></td>
                  <td className="py-4 num">{p.bookings}</td>
                  <td className="py-4 text-right space-x-1">
                    <Button size="icon" variant="ghost"><Check className="h-4 w-4 text-ink" /></Button>
                    <Button size="icon" variant="ghost"><X className="h-4 w-4 text-oxblood" /></Button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}

        {tab === "Journal" && (
          <div className="mt-px bg-bone border-x border-b border-ink/15">
            <div className="p-6 border-b border-ink/15 flex items-center justify-between">
              <h3 className="h-display text-3xl">Journal</h3>
              <Button>New post +</Button>
            </div>
            <Table headers={["No.", "Title", "Category", "Status", ""]}>
              {BLOGS.map((b, i) => (
                <tr key={b.id} className="border-t border-ink/10">
                  <td className="py-4 num text-ink/50">{(i+1).toString().padStart(2,"0")}</td>
                  <td className="py-4 h-display text-xl">{b.title}</td>
                  <td className="py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">{b.category}</td>
                  <td className="py-4"><Badge className={b.status === "published" ? "bg-ink text-bone border-ink" : "bg-bone border-ink/30 text-ink/70"}>{b.status}</Badge></td>
                  <td className="py-4 text-right">
                    <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </section>
    </PageTransition>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50 border-b border-ink/15">
            {headers.map((h, i) => <th key={i} className={`py-4 px-6 font-normal ${i === headers.length - 1 ? "text-right" : ""}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 100, h = 30;
  const max = Math.max(...values);
  const step = w / (values.length - 1);
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (v / max) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24" preserveAspectRatio="none">
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill="rgba(14,14,16,0.08)" />
      <path d={d} fill="none" stroke="#0E0E10" strokeWidth="0.8" />
      {values.map((v, i) => (
        <circle key={i} cx={i * step} cy={h - (v / max) * h} r="0.7" fill="#6E1023" />
      ))}
    </svg>
  );
}
