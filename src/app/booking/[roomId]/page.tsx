"use client";
import { Suspense, use, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Button, Card, Input, Field, Textarea, PageHeader } from "@/components/ui";
import { inr } from "@/lib/utils";
import { BadgeCheck, CalendarDays } from "lucide-react";

type RoomInfo = { number: string; basePrice: number; type?: { name?: string } | null };

function BookingInner({ roomId }: { roomId: string }) {
  const sp = useSearchParams();
  const router = useRouter();
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [form, setForm] = useState({ checkIn: sp.get("checkIn") ?? "", checkOut: sp.get("checkOut") ?? "", guestCount: Number(sp.get("guests") ?? 2), guestName: "", guestEmail: "", guestPhone: "", specialRequests: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api<{ room: RoomInfo }>(`/api/rooms/${roomId}`).then((j) => setRoom(j.room)).catch((e) => toast.error(messageOf(e)));
  }, [roomId]);
  async function run(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const j = await api<{ booking: { id: string } }>("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomId, ...form }) });
      toast.success("Reservation confirmed.");
      router.push(`/booking/confirmation/${j.booking.id}`);
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader eyebrow="Reservation" title={room ? `Book room ${room.number}` : "Book your stay"} description={room ? `${room.type?.name ?? "Standard room"} · ${inr(room.basePrice)} per night, total calculated at confirmation.` : "Loading room details…"} />
      <Card className="animate-rise">
        <p className="flex items-center gap-2 rounded-xl bg-forest-50 px-4 py-3 text-sm font-medium text-forest-900"><CalendarDays className="h-4 w-4 text-forest-700" /> Free cancellation up to 48 hours before check-in.</p>
        <form onSubmit={run} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Check-in"><Input type="date" required value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} /></Field>
            <Field label="Check-out"><Input type="date" required value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Guests"><Input type="number" min={1} max={10} value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })} /></Field>
            <Field label="Phone"><Input autoComplete="tel" placeholder="+91 …" value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} /></Field>
          </div>
          <Field label="Full name"><Input required autoComplete="name" placeholder="Guest name" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" required autoComplete="email" placeholder="you@example.com" value={form.guestEmail} onChange={(e) => setForm({ ...form, guestEmail: e.target.value })} /></Field>
          <Field label="Special requests"><Textarea rows={3} placeholder="Early check-in, extra bed, quiet floor…" value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} /></Field>
          <Button className="w-full" size="lg" disabled={busy}><BadgeCheck className="h-4 w-4" /> {busy ? "Confirming…" : "Confirm reservation"}</Button>
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
    <Suspense fallback={<Card><p className="text-sm text-ink-500">Loading…</p></Card>}>
      <BookingResolver params={params} />
    </Suspense>
  );
}
