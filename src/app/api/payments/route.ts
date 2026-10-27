import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import { requireStaff } from "../admin/_helpers";
import { logActivity } from "@/modules/common";
import { ObjectId } from "mongodb";
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("bookingId");
  const db = await getDb();
  const q = bookingId ? { bookingId } : user.role === "customer" ? {} : {};
  const payments = await db.collection("payments").find(q).sort({ createdAt: -1 }).limit(200).toArray();
  return NextResponse.json({ payments: payments.map((p) => ({ ...p, _id: String(p._id) })) });
}
export async function POST(req: Request) {
  const { error, user } = await requireStaff();
  if (error || !user) return error ?? NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  if (!body.bookingId || !body.amount) return NextResponse.json({ error: "bookingId and amount required" }, { status: 400 });
  const db = await getDb();
  const now = new Date().toISOString();
  const id = new ObjectId().toString();
  await db.collection("payments").insertOne({ id, bookingId: body.bookingId, amount: Number(body.amount), method: body.method ?? "cash", receivedBy: user.id, createdAt: now } as never);
  const all = await db.collection("payments").find({ bookingId: body.bookingId }).toArray();
  const booking = await db.collection("bookings").findOne({ id: body.bookingId }) as unknown as { total?: number } | null;
  const paid = all.reduce((a, p) => a + Number((p as { amount?: number }).amount ?? 0), 0);
  const total = Number(booking?.total ?? 0);
  const ps = paid >= total && total > 0 ? "paid" : paid > 0 ? "partially_paid" : "unpaid";
  await db.collection("bookings").updateOne({ id: body.bookingId } as never, { $set: { paymentStatus: ps, updatedAt: now } });
  await logActivity({ actorId: user.id, actorRole: user.role, action: "payment.record", entity: "booking", entityId: body.bookingId, detail: String(body.amount) });
  return NextResponse.json({ ok: true, paymentStatus: ps }, { status: 201 });
}
