"use client";
import { Suspense, use, useEffect, useState } from "react";
import { Card, Badge, Button, statusTone, Input } from "@/components/ui";
import { inr } from "@/lib/utils";

function StaffReservationDetailInner({ id }: { id: string }) {
  const [data, setData] = useState<{ booking?: Record<string, string | number>; payments?: { id: string; amount: number; method: string }[] } | null>(null);
  const [pay, setPay] = useState({ amount: "", method: "cash" });
  const [msg, setMsg] = useState("");
  async function load() { setData(await (await fetch(`/api/bookings/${id}`)).json()); }
  useEffect(() => { load(); }, [id]);
  const b = data?.booking;
  async function act(path: string, body?: object) {
    const r = await fetch(`/api/bookings/${id}/${path}`, { method: body ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? "Done." : (j.error ?? "Failed"));
    load();
  }
  async function recordPay() {
    const r = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId: id, amount: Number(pay.amount), method: pay.method }) });
    setMsg(r.ok ? "Payment recorded." : "Failed");
    load();
  }
  if (!b) return <Card>Loading…</Card>;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <Badge tone={statusTone(String(b.status))}>{String(b.status)}</Badge>
        <h1 className="mt-1 text-xl font-bold">{String(b.bookingNumber)} · {String(b.guestName)}</h1>
        <p className="text-sm text-slate-600">{String(b.guestEmail)} · {String(b.guestPhone)} · {Number(b.guestCount)} guests</p>
        <p className="text-sm">Room {String(b.roomNumber)} · {String(b.checkIn)} → {String(b.checkOut)} · {inr(Number(b.total))} ({String(b.paymentStatus)})</p>
        <p className="text-sm text-slate-500">Requests: {String(b.specialRequests || "—")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {b.status === "confirmed" && <Button onClick={() => act("check-in")}>Check in</Button>}
          {b.status === "checked_in" && <Button onClick={() => act("check-out")}>Check out</Button>}
          {(b.status === "confirmed" || b.status === "pending") && <Button variant="danger" onClick={() => act("cancel")}>Cancel</Button>}
        </div>
        {msg && <p className="mt-2 text-sm text-slate-600">{msg}</p>}
      </Card>
      <Card>
        <h2 className="font-semibold">Record payment</h2>
        <div className="mt-2 flex gap-2">
          <Input type="number" placeholder="Amount" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
          <select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })} className="rounded-lg border px-2 text-sm"><option value="cash">cash</option><option value="card">card</option><option value="upi">upi</option></select>
          <Button onClick={recordPay}>Record</Button>
        </div>
        {(data?.payments ?? []).map((p) => <p key={p.id} className="text-sm text-slate-600">{inr(p.amount)} · {p.method}</p>)}
      </Card>
    </div>
  );
}

export default function StaffReservationDetail({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Card>Loading…</Card>}>
      <StaffReservationResolver params={params} />
    </Suspense>
  );
}

function StaffReservationResolver({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StaffReservationDetailInner id={id} />;
}
