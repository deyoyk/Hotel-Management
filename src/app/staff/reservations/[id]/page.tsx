"use client";
import { Suspense, use, useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Badge, Button, PageHeader, Input, Select, statusTone } from "@/components/ui";
import { inr, fmtDate } from "@/lib/utils";
import { LogIn, LogOut, Wallet } from "lucide-react";

type Booking = Record<string, string | number>;
type Payment = { id: string; amount: number; method: string; createdAt?: string };

function StaffReservationDetailInner({ id }: { id: string }) {
  const [data, setData] = useState<{ booking?: Booking; payments?: Payment[] } | null>(null);
  const [pay, setPay] = useState({ amount: "", method: "cash" });
  const [busy, setBusy] = useState(false);
  async function load() {
    try {
      setData(await api(`/api/bookings/${id}`));
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  useEffect(() => { load(); }, [id]);
  const b = data?.booking;
  async function act(path: "check-in" | "check-out" | "cancel") {
    setBusy(true);
    try {
      await api(`/api/bookings/${id}/${path}`, { method: "POST" });
      toast.success(path === "cancel" ? "Reservation cancelled." : path === "check-in" ? "Guest checked in." : "Guest checked out.");
      load();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  async function recordPay() {
    if (!pay.amount || Number(pay.amount) <= 0) {
      toast.error("Enter a payment amount greater than zero.");
      return;
    }
    try {
      const j = await api<{ paymentStatus: string }>("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId: id, amount: Number(pay.amount), method: pay.method }) });
      toast.success(`Payment recorded. Status: ${j.paymentStatus.replace(/_/g, " ")}.`);
      setPay({ amount: "", method: "cash" });
      load();
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  if (!b) return <Card><p className="text-sm text-ink-500">Loading reservation…</p></Card>;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader eyebrow="Reservation" title={String(b.bookingNumber)} description={`${String(b.guestName)} · ${String(b.guestEmail)}${b.guestPhone ? ` · ${String(b.guestPhone)}` : ""}`} actions={<Badge tone={statusTone(String(b.status))}>{String(b.status).replace(/_/g, " ")}</Badge>} />
      <Card className="animate-rise">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <p className="rounded-xl bg-ivory-50 px-4 py-3"><span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-forest-600">Stay</span><span className="font-semibold text-forest-950">Room {String(b.roomNumber)} · {fmtDate(String(b.checkIn))} → {fmtDate(String(b.checkOut))}</span></p>
          <p className="rounded-xl bg-ivory-50 px-4 py-3"><span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-forest-600">Total · {String(b.paymentStatus).replace(/_/g, " ")}</span><span className="font-display text-2xl font-semibold text-forest-950">{inr(Number(b.total))}</span></p>
        </div>
        {b.specialRequests ? <p className="mt-3 rounded-xl bg-ivory-100 px-4 py-2.5 text-sm text-ink-600">“{String(b.specialRequests)}”</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {b.status === "confirmed" && <Button disabled={busy} onClick={() => act("check-in")}><LogIn className="h-4 w-4" /> Check in</Button>}
          {b.status === "checked_in" && <Button disabled={busy} onClick={() => act("check-out")}><LogOut className="h-4 w-4" /> Check out</Button>}
          {(b.status === "confirmed" || b.status === "pending") && <Button variant="danger" disabled={busy} onClick={() => act("cancel")}>Cancel</Button>}
        </div>
      </Card>
      <Card>
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-forest-950"><Wallet className="h-5 w-5 text-brass-500" /> Record payment</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input type="number" min={1} placeholder="Amount (₹)" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
          <Select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option></Select>
          <Button onClick={recordPay} className="shrink-0">Record</Button>
        </div>
        <div className="mt-3 space-y-2">
          {(data?.payments ?? []).map((p) => <p key={p.id} className="flex justify-between rounded-xl bg-ivory-50 px-4 py-2.5 text-sm"><span className="font-semibold">{inr(p.amount)}</span><span className="text-ink-500">{p.method}</span></p>)}
          {(data?.payments ?? []).length === 0 && <p className="text-sm text-ink-500">Nothing collected yet.</p>}
        </div>
      </Card>
    </div>
  );
}

export default function StaffReservationDetail({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Card><p className="text-sm text-ink-500">Loading…</p></Card>}>
      <StaffReservationResolver params={params} />
    </Suspense>
  );
}

function StaffReservationResolver({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StaffReservationDetailInner id={id} />;
}
