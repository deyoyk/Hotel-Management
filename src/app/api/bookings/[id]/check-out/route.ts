import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/modules/common";
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role === "customer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const db = await getDb();
  const b = await db.collection("bookings").findOne({ $or: [{ id }, { bookingNumber: id }] } as never) as unknown as { id: string; roomId: string; status: string } | null;
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (b.status !== "checked_in") return NextResponse.json({ error: "Only checked-in bookings can be checked out" }, { status: 400 });
  const now = new Date().toISOString();
  const { releaseNights } = await import("@/modules/bookings/service");
  await db.collection("bookings").updateOne({ id: b.id } as never, { $set: { status: "checked_out", actualCheckOutAt: now, updatedAt: now } });
  await releaseNights(b.id);
  await db.collection("rooms").updateOne({ id: b.roomId } as never, { $set: { housekeepingStatus: "cleaning_required" } });
  await db.collection("housekeeping_tasks").insertOne({ id: `${b.roomId}-${Date.now()}`, roomId: b.roomId, bookingId: b.id, status: "pending", createdAt: now } as never);
  await logActivity({ actorId: user.id, actorRole: user.role, action: "booking.checked_out", entity: "booking", entityId: b.id });
  return NextResponse.json({ ok: true });
}
