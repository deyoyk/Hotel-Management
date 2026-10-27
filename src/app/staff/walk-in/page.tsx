"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Field, Textarea } from "@/components/ui";

export default function WalkInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ roomId: "", checkIn: "", checkOut: "", guestCount: 2, guestName: "", guestEmail: "walkin@hotel.local", guestPhone: "", specialRequests: "", paymentAmount: "", paymentMethod: "cash" });
  const [err, setErr] = useState("");
  async function run(e: FormEvent) {
    e.preventDefault(); setErr("");
    const r = await fetch("/api/staff/walk-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, paymentAmount: form.paymentAmount ? Number(form.paymentAmount) : undefined }) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error ?? "Failed"); return; }
    router.push(`/staff/reservations/${j.booking.id}`);
  }
  const set = (k: string, v: string | number) => setForm({ ...form, [k]: v });
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-3 text-2xl font-bold">Walk-in booking</h1>
      <Card>
        <form onSubmit={run} className="space-y-3">
          <Field label="Room ID or number"><Input required value={form.roomId} onChange={(e) => set("roomId", e.target.value)} placeholder="101" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-in"><Input type="date" required value={form.checkIn} onChange={(e) => set("checkIn", e.target.value)} /></Field>
            <Field label="Check-out"><Input type="date" required value={form.checkOut} onChange={(e) => set("checkOut", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Guests"><Input type="number" min={1} max={10} value={form.guestCount} onChange={(e) => set("guestCount", Number(e.target.value))} /></Field>
            <Field label="Payment amount"><Input type="number" value={form.paymentAmount} onChange={(e) => set("paymentAmount", e.target.value)} /></Field>
          </div>
          <Field label="Guest name"><Input required value={form.guestName} onChange={(e) => set("guestName", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email"><Input value={form.guestEmail} onChange={(e) => set("guestEmail", e.target.value)} /></Field>
            <Field label="Phone"><Input value={form.guestPhone} onChange={(e) => set("guestPhone", e.target.value)} /></Field>
          </div>
          <Field label="Requests"><Textarea rows={2} value={form.specialRequests} onChange={(e) => set("specialRequests", e.target.value)} /></Field>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button>Create booking</Button>
        </form>
      </Card>
    </div>
  );
}
