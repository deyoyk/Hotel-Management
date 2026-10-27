import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import { ALLOWED_TRANSITIONS, releaseNights } from "@/modules/bookings/service";
import { logActivity } from "@/modules/common";

async function findBooking(db: Awaited<ReturnType<typeof getDb>>, id: string) {
  return db.collection("bookings").findOne({ $or: [{ id }, { bookingNumber: id }] } as never);
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const db = await getDb();
  const b = await findBooking(db, id);
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role === "customer" && (b as { userId?: string }).userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const payments = await db.collection("payments").find({ bookingId: (b as { id?: string }).id }).toArray();
  return NextResponse.json({ booking: { ...b, _id: String(b._id) }, payments: payments.map((p) => ({ ...p, _id: String(p._id) })) });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role === "customer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const db = await getDb();
  const b = await findBooking(db, id);
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const now = new Date().toISOString();
  if (body.status) {
    const cur = String((b as { status?: string }).status);
    if (!(ALLOWED_TRANSITIONS[cur] ?? []).includes(String(body.status))) return NextResponse.json({ error: `Cannot transition ${cur} to ${body.status}` }, { status: 400 });
    const update: Record<string, unknown> = { status: body.status, updatedAt: now };
    if (body.status === "checked_in") {
      update.actualCheckInAt = now;
      await db.collection("rooms").updateOne({ id: (b as { roomId?: string }).roomId } as never, { $set: { housekeepingStatus: "occupied" } });
    }
    if (body.status === "checked_out") {
      update.actualCheckOutAt = now;
      await releaseNights(String((b as { id?: string }).id));
      await db.collection("rooms").updateOne({ id: (b as { roomId?: string }).roomId } as never, { $set: { housekeepingStatus: "cleaning_required" } });
      await db.collection("housekeeping_tasks").insertOne({ id: `${(b as { roomId?: string }).roomId}-${Date.now()}`, roomId: (b as { roomId?: string }).roomId, bookingId: (b as { id?: string }).id, status: "pending", createdAt: now } as never);
    }
    if (body.status === "cancelled") {
      await releaseNights(String((b as { id?: string }).id));
      await db.collection("bookings").updateOne({ _id: b._id } as never, { $set: { paymentStatus: "refunded", updatedAt: now } }).catch(() => {});
    }
    await db.collection("bookings").updateOne({ _id: b._id } as never, { $set: update });
    await logActivity({ actorId: user.id, actorRole: user.role, action: `booking.${body.status}`, entity: "booking", entityId: String((b as { id?: string }).id) });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}
