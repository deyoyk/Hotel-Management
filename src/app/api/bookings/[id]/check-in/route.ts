import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/modules/common";
async function transition(id: string, to: "checked_in" | "checked_out", user: { id: string; role: string }) {
  const db = await getDb();
  const b = await db.collection("bookings").findOne({ $or: [{ id }, { bookingNumber: id }] } as never) as unknown as { _id: unknown; id: string; roomId: string; status: string } | null;
  if (!b) return { error: "Not found", code: 404 };
  if (to === "checked_in" && b.status !== "confirmed") return { error: "Only confirmed bookings can be checked in", code: 400 };
  if (to === "checked_out" && b.status !== "checked_in") return { error: "Only checked-in bookings can be checked out", code: 400 };
  const now = new Date().toISOString();
  if (to === "checked_in") {
    await db.collection("bookings").updateOne({ id: b.id } as never, { $set: { status: "checked_in", actualCheckInAt: now, updatedAt: now } });
    await db.collection("rooms").updateOne({ id: b.roomId } as never, { $set: { housekeepingStatus: "occupied" } });
  } else {
    const { releaseNights } = await import("@/modules/bookings/service");
    await db.collection("bookings").updateOne({ id: b.id } as never, { $set: { status: "checked_out", actualCheckOutAt: now, updatedAt: now } });
    await releaseNights(b.id);
    await db.collection("rooms").updateOne({ id: b.roomId } as never, { $set: { housekeepingStatus: "cleaning_required" } });
    await db.collection("housekeeping_tasks").insertOne({ id: `${b.roomId}-${Date.now()}`, roomId: b.roomId, bookingId: b.id, status: "pending", createdAt: now } as never);
  }
  await logActivity({ actorId: user.id, actorRole: user.role, action: `booking.${to}`, entity: "booking", entityId: b.id });
  return { ok: true };
}
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role === "customer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const to = (url.pathname.includes("check-out") ? "checked_out" : "checked_in") as "checked_in" | "checked_out";
  const res = await transition(id, to, user);
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: res.code });
  return NextResponse.json(res);
}
