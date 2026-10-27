"use client";
import { Suspense, use, useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Badge, Button, PageHeader, Select, statusTone, Textarea } from "@/components/ui";
import { inr, fmtDate } from "@/lib/utils";
import { Star, Wallet } from "lucide-react";

type Booking = Record<string, string | number>;
type Payment = { id?: string; _id?: string; amount: number; method: string; createdAt: string };

function BookingDetailInner({ id }: { id: string }) {
  const [data, setData] = useState<{ booking?: Booking; payments?: Payment[] } | null>(null);
  const [review, setReview] = useState({ rating: "5", comment: "" });
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
  async function cancel() {
    setBusy(true);
    try {
      await api(`/api/bookings/${id}/cancel`, { method: "POST" });
      toast.success("Reservation cancelled.");
      load();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  async function sendReview() {
    try {
      await api("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomTypeId: b?.roomTypeId, rating: Number(review.rating), comment: review.comment }) });
      toast.success("Thank you — review submitted.");
      setReview({ rating: "5", comment: "" });
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  if (!b) return <Card><p className="text-sm text-ink-500">Loading booking…</p></Card>;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader eyebrow="Booking" title={String(b.bookingNumber)} description={`Room ${String(b.roomNumber)} · ${fmtDate(String(b.checkIn))} → ${fmtDate(String(b.checkOut))} · ${String(b.nights)} nights`} actions={<Badge tone={statusTone(String(b.status))}>{String(b.status).replace(/_/g, " ")}</Badge>} />
      <Card className="animate-rise">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-forest-600">Total due</p>
            <p className="font-display text-4xl font-semibold text-forest-950">{inr(Number(b.total))}</p>
          </div>
          <Badge tone={statusTone(String(b.paymentStatus))}>{String(b.paymentStatus).replace(/_/g, " ")}</Badge>
        </div>
        <p className="mt-2 text-sm text-ink-500">{String(b.guestName)} · {String(b.guestEmail)}{b.guestPhone ? ` · ${String(b.guestPhone)}` : ""} · {String(b.guestCount)} guests</p>
        {b.specialRequests ? <p className="mt-2 rounded-xl bg-ivory-100 px-4 py-2.5 text-sm text-ink-600">“{String(b.specialRequests)}”</p> : null}
        {(b.status === "confirmed" || b.status === "pending") && <Button variant="danger" disabled={busy} onClick={cancel} className="mt-4">{busy ? "Cancelling…" : "Cancel reservation"}</Button>}
      </Card>
      <Card>
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-forest-950"><Wallet className="h-5 w-5 text-brass-500" /> Payments</h2>
        <div className="mt-3 space-y-2">
          {(data?.payments ?? []).map((p) => <p key={String(p.id ?? p._id)} className="flex justify-between rounded-xl bg-ivory-50 px-4 py-2.5 text-sm"><span className="font-semibold">{inr(Number(p.amount))}</span><span className="text-ink-500">{p.method} · {String(p.createdAt).slice(0, 10)}</span></p>)}
          {(data?.payments ?? []).length === 0 && <p className="text-sm text-ink-500">No payments recorded yet — pay at the front desk.</p>}
        </div>
      </Card>
      {b.status === "checked_out" && (
        <Card>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-forest-950"><Star className="h-5 w-5 text-brass-500" /> Leave a review</h2>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Select value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })}><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Poor</option><option value="1">1 — Terrible</option></Select>
            <Textarea rows={2} value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} placeholder="How was your stay?" />
            <Button onClick={sendReview} className="shrink-0">Submit</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Card><p className="text-sm text-ink-500">Loading…</p></Card>}>
      <BookingDetailResolver params={params} />
    </Suspense>
  );
}

function BookingDetailResolver({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BookingDetailInner id={id} />;
}
