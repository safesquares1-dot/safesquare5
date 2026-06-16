"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Check, ChevronLeft, ChevronRight, Clock, CreditCard, Loader2, ArrowUpRight, User, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion";
import { Reveal, NumberMark } from "@/components/editorial";
import { BookBackdrop } from "@/components/effects/book-backdrop";
import { cn, formatCurrency } from "@/lib/utils";
import type { Room } from "@/lib/types";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { n: "01", label: "Select room",  icon: MapPin },
  { n: "02", label: "Choose date",  icon: Calendar },
  { n: "03", label: "Time slot",    icon: Clock },
  { n: "04", label: "Review",       icon: User },
  { n: "05", label: "Payment",      icon: CreditCard },
  { n: "06", label: "Confirmation", icon: Check },
];

const todayISO = () => new Date().toISOString().slice(0, 10);
const hours = (start: string, end: string) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
};

export default function BookPage() {
  const params = useSearchParams();
  const router = useRouter();
  const initialRoom = params.get("room") ?? "";

  const [step, setStep] = React.useState<Step>(0);
  const [room, setRoom] = React.useState<Room | null>(null);
  const [date, setDate] = React.useState<string>(todayISO());
  const [start, setStart] = React.useState("10:00");
  const [end, setEnd]     = React.useState("11:00");
  const [notes, setNotes] = React.useState("");
  const [bookingId, setBookingId] = React.useState<string | null>(null);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => api.listRooms({}),
  });

  React.useEffect(() => {
    if (!room && initialRoom && rooms.length) {
      const r = rooms.find((x) => x.slug === initialRoom || x.id === initialRoom);
      if (r) setRoom(r);
    }
  }, [rooms, initialRoom, room]);

  const total = room ? +(room.hourly_rate * hours(start, end)).toFixed(2) : 0;
  const duration = hours(start, end);

  const book = useMutation({
    mutationFn: async () => {
      const token = typeof window !== "undefined" ? (localStorage.getItem("ssq_token") || "demo-token") : "";
      const b: any = await api.createBooking({
        room_id: room!.id,
        booking_date: date,
        start_time: start,
        end_time: end,
        notes,
      }, token);
      return b;
    },
    onSuccess: (b) => { setBookingId(b.id); setStep(5); },
  });

  return (
    <PageTransition>
      <BookBackdrop />
      <section className="container-wide pt-12 pb-8">
        <div className="flex items-baseline justify-between border-b border-ink pb-3 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Reserve</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">Six steps</span>
        </div>
        <Reveal>
          <h1 className="h-display text-[48px] sm:text-[72px] md:text-[96px] leading-[0.92] text-center">Reserve a room.</h1>
        </Reveal>

        <ol className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {STEPS.map((s, i) => (
            <li key={s.n} className="flex items-center gap-3">
              <span className={cn(
                "font-mono text-[10px] uppercase tracking-[0.22em] px-3 py-2 border",
                step === s.n ? "bg-ink text-bone border-ink" :
                step > s.n   ? "border-ink/40 text-ink/60" :
                               "border-ink/15 text-ink/40"
              )}>
                {s.n} · {s.label}
              </span>
              {i < STEPS.length - 1 && <span className="text-ink/30">→</span>}
            </li>
          ))}
        </ol>
      </section>

      <section className="container-narrow pb-24">
        <Card className="p-6 sm:p-10">
          {step === 0 && (
            <div>
              <NumberMark n="01" label="The room" />
              <h2 className="h-display text-4xl mt-3">Choose your room.</h2>
              {isLoading ? (
                <div className="mt-8 grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <div className="mt-8 grid gap-px sm:grid-cols-2 bg-ink/15 border border-ink/15">
                  {rooms.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRoom(r)}
                      className={cn(
                        "text-left bg-bone p-6 transition",
                        room?.id === r.id ? "bg-ink text-bone" : "hover:bg-bone-2"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="h-display text-2xl">{r.name}</div>
                          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] opacity-70">{r.room_type} · capacity {r.capacity}</div>
                        </div>
                        <div className="h-display text-2xl">{formatCurrency(r.hourly_rate)}<span className="text-sm opacity-60">/hr</span></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <NumberMark n="02" label="The date" />
              <h2 className="h-display text-4xl mt-3">Choose a date.</h2>
              <div className="mt-8 max-w-xs">
                <Label>Date</Label>
                <Input type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} className="mt-2" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <NumberMark n="03" label="The slot" />
              <h2 className="h-display text-4xl mt-3">Pick a time slot.</h2>
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div><Label>Start time</Label><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="mt-2" /></div>
                <div><Label>End time</Label><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-2" /></div>
              </div>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
                Duration: <span className="text-ink">{duration} hour(s)</span>
              </div>
            </div>
          )}

          {step === 3 && room && (
            <div>
              <NumberMark n="04" label="The review" />
              <h2 className="h-display text-4xl mt-3">Review your booking.</h2>
              <div className="mt-8 border-t border-ink">
                <Row label="Room"   value={`${room.name} (${room.room_type})`} />
                <Row label="Date"   value={new Date(date).toDateString()} />
                <Row label="Time"   value={`${start} – ${end}  (${duration} hr)`} />
                <Row label="Rate"   value={`${formatCurrency(room.hourly_rate)} / hour`} />
                <Row label="Notes"  value={notes || "—"} fullWidth />
              </div>
              <div className="mt-6">
                <Label>Optional notes for reception</Label>
                <Textarea className="mt-2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything reception should know about your client?" />
              </div>
              <div className="mt-6 bg-ink text-bone p-5 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-80">Total due</span>
                <span className="h-display text-3xl">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <NumberMark n="05" label="The bill" />
              <h2 className="h-display text-4xl mt-3">Payment.</h2>
              <p className="mt-3 text-ink/70">Secure payment via Stripe. Demo mode accepts anything.</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2"><Label>Card number</Label><Input placeholder="4242 4242 4242 4242" className="mt-2" /></div>
                <div><Label>Expiry</Label><Input placeholder="MM/YY" className="mt-2" /></div>
                <div><Label>CVC</Label><Input placeholder="123" className="mt-2" /></div>
              </div>
              <div className="mt-6 border border-chartreuse/40 p-4 text-sm bg-chartreuse/10">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/80">House note</span>
                <p className="mt-1 text-ink/80">Free cancellation up to 24 hours before your session.</p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="py-12 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center border border-ink">
                <Check className="h-6 w-6 text-oxblood" />
              </div>
              <h2 className="h-display text-4xl mt-6">Booking confirmed.</h2>
              <p className="lead mt-3 max-w-md mx-auto">Confirmation has been sent. Reference: <span className="font-mono text-ink">{bookingId ?? "—"}</span></p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button onClick={() => router.push("/dashboard")}>Go to studio</Button>
                <Button variant="outline" onClick={() => { setStep(0); setRoom(null); setBookingId(null); }}>Book another</Button>
              </div>
            </div>
          )}

          {step !== 5 && (
            <div className="mt-10 flex items-center justify-between border-t border-ink/15 pt-6">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1) as Step)} disabled={step === 0}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              {step < 4 ? (
                <Button onClick={() => setStep((s) => Math.min(4, s + 1) as Step)} disabled={(step === 0 && !room) || duration <= 0}>
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => book.mutate()} disabled={book.isPending}>
                  {book.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing</> : <>Pay {formatCurrency(total)} <ArrowUpRight className="h-4 w-4" /></>}
                </Button>
              )}
            </div>
          )}
        </Card>
      </section>
    </PageTransition>
  );
}

function Row({ label, value, fullWidth = false }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={`flex ${fullWidth ? "flex-col" : "items-center justify-between"} py-4 border-b border-ink/10`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">{label}</span>
      <span className={`text-sm font-medium text-ink ${fullWidth ? "mt-2" : ""}`}>{value}</span>
    </div>
  );
}
