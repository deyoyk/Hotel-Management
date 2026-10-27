"use client";
import { Suspense, use, useEffect, useState } from "react";
import { Card, Badge, Button, statusTone, Textarea } from "@/components/ui";
import { inr } from "@/lib/utils";

function BookingDetailInner({ id }: { id: string }) {
  const [data, setData] = useState<{ booking?: Record<string, string | number>; payments?: Record<string, string | number>[] } | null>(null);
  const [msg, setMsg] = useState("");
  const [review, setReview] = useState({ rating: "5", comment: "" });
  async function load() {
    const r = await fetch(`/api/bookings/${id}`);
    setData(await r.json());
  }
  useEffect(() => { load(); }, [id]);
  const b = data?.booking;
  async function cancel() {
    const r = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
    const j = await r.json();
    setMsg(r.ok ? "Reservation cancelled." : (j.error ?? "Failed"));
    load();
  }
  async function sendReview() {
    const r = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomTypeId: b?.roomTypeId, rating: Number(review.rating), comment: review.comment }) });
    const j = await r.json();
    setMsg(r.ok ? "Review submitted." : (j.error ?? "Failed"));
  }
  if (!b) return <Card>Loading… {msg}</Card>;
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Card>
        <Badge tone={statusTone(String(b.status))}>{String(b.status)}</Badge>
        <h1 className="mt-2 text-xl font-bold">{String(b.bookingNumber)}</h1>
        <p className="text-sm text-slate-600">Room {String(b.roomNumber)} · {String(b.checkIn)} → {String(b.checkOut)} · {String(b.nights)} nights</p>
        <p className="mt-1 font-semibold">{inr(Number(b.total))} · {String(b.paymentStatus)}</p>
        {(b.status === "confirmed" || b.status === "pending") && <Button variant="danger" onClick={cancel}>Cancel reservation</Button>}
        {msg && <p className="mt-2 text-sm text-slate-600">{msg}</p>}
      </Card>
      <Card>
        <h2 className="font-semibold">Payments</h2>
        {(data?.payments ?? []).map((p) => <p key={String(p.id)} className="text-sm">{inr(Number(p.amount))} · {String(p.method)} · {String(p.createdAt)}</p>)}
        {(data?.payments ?? []).length === 0 && <p className="text-sm text-slate-500">No payments recorded. Pay at the hotel.</p>}
      </Card>
      {b.status === "checked_out" && (
        <Card>
          <h2 className="font-semibold">Leave a review</h2>
          <div className="mt-2 flex gap-2">
            <select value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })} className="rounded-lg border px-2 py-2 text-sm">
              <option value="5">5</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1</option>
            </select>
            <Textarea rows={2} value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} placeholder="How was your stay?" />
            <Button onClick={sendReview}>Submit</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Card>Loading…</Card>}>
      <BookingDetailResolver params={params} />
    </Suspense>
  );
}

function BookingDetailResolver({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BookingDetailInner id={id} />;
}
