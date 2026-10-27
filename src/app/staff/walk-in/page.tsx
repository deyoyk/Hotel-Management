"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Button, Input, Field, Textarea, Select, PageHeader } from "@/components/ui";
import { UserPlus } from "lucide-react";

export default function WalkInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ roomId: "", checkIn: "", checkOut: "", guestCount: 2, guestName: "", guestEmail: "walkin@hotel.local", guestPhone: "", specialRequests: "", paymentAmount: "", paymentMethod: "cash" });
  const [busy, setBusy] = useState(false);
  async function run(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const j = await api<{ booking: { id: string; bookingNumber: string } }>("/api/staff/walk-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, paymentAmount: form.paymentAmount ? Number(form.paymentAmount) : undefined }) });
      toast.success(`Walk-in confirmed: ${j.booking.bookingNumber}.`);
      router.push(`/staff/reservations/${j.booking.id}`);
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  const set = (k: string, v: string | number) => setForm({ ...form, [k]: v });
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader eyebrow="Front desk" title="Walk-in booking" description="Create a confirmed reservation for a guest standing at the counter." />
      <Card className="animate-rise">
        <form onSubmit={run} className="space-y-4">
          <Field label="Room ID or number"><Input required placeholder="101" value={form.roomId} onChange={(e) => set("roomId", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Check-in"><Input type="date" required value={form.checkIn} onChange={(e) => set("checkIn", e.target.value)} /></Field>
            <Field label="Check-out"><Input type="date" required value={form.checkOut} onChange={(e) => set("checkOut", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Guests"><Input type="number" min={1} max={10} value={form.guestCount} onChange={(e) => set("guestCount", Number(e.target.value))} /></Field>
            <Field label="Payment collected (₹)"><Input type="number" min={0} placeholder="0" value={form.paymentAmount} onChange={(e) => set("paymentAmount", e.target.value)} /></Field>
          </div>
          <Field label="Guest name"><Input required placeholder="Walk-in guest" value={form.guestName} onChange={(e) => set("guestName", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email"><Input type="email" value={form.guestEmail} onChange={(e) => set("guestEmail", e.target.value)} /></Field>
            <Field label="Phone"><Input value={form.guestPhone} onChange={(e) => set("guestPhone", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Payment method"><Select value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option></Select></Field>
          </div>
          <Field label="Special requests (detail)"><Textarea rows={2} value={form.specialRequests} onChange={(e) => set("specialRequests", e.target.value)} /></Field>
          <Button className="w-full" size="lg" disabled={busy}><UserPlus className="h-4 w-4" /> {busy ? "Creating…" : "Create booking"}</Button>
        </form>
      </Card>
    </div>
  );
}
