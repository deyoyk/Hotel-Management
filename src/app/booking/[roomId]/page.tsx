"use client";
import { Suspense, use, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Input, Field, Textarea } from "@/components/ui";
import { inr } from "@/lib/utils";

function BookingInner({ roomId }: { roomId: string }) {
  const sp = useSearchParams();
  const router = useRouter();
  const [room, setRoom] = useState<{ number: string; basePrice: number } | null>(null);
  const [form, setForm] = useState({ checkIn: sp.get("checkIn") ?? "", checkOut: sp.get("checkOut") ?? "", guestCount: Number(sp.get("guests") ?? 2), guestName: "", guestEmail: "", guestPhone: "", specialRequests: "" });
  const [err, setErr] = useState("");
  useEffect(() => { fetch(`/api/rooms/${roomId}`).then((r) => r.json()).then((j) => setRoom(j.room)).catch(() => {}); }, [roomId]);
  async function run(e: FormEvent) {
    e.preventDefault(); setErr("");
    const r = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomId, ...form }) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error ?? "Booking failed"); return; }
    router.push(`/booking/confirmation/${j.booking.id}`);
  }
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Book room {room?.number}</h1>
      <Card>
        <form onSubmit={run} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-in"><Input type="date" required value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} /></Field>
            <Field label="Check-out"><Input type="date" required value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Guests"><Input type="number" min={1} max={10} value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })} /></Field>
            <Field label="Phone"><Input value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} /></Field>
          </div>
          <Field label="Full name"><Input required value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" required value={form.guestEmail} onChange={(e) => setForm({ ...form, guestEmail: e.target.value })} /></Field>
          <Field label="Special requests"><Textarea rows={3} value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} /></Field>
          {room && <p className="text-sm text-slate-600">{inr(room.basePrice)} per night · total calculated at confirmation</p>}
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button>Confirm reservation</Button>
        </form>
      </Card>
    </div>
  );
}

function BookingResolver({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  return <BookingInner roomId={roomId} />;
}

export default function BookingPage({ params }: { params: Promise<{ roomId: string }> }) {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
      <BookingResolver params={params} />
    </Suspense>
  );
}
