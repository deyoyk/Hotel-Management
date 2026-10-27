import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import { releaseNights } from "@/modules/bookings/service";
import { logActivity } from "@/modules/common";
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const db = await getDb();
  const b = await db.collection("bookings").findOne({ $or: [{ id }, { bookingNumber: id }] } as never) as unknown as { _id: unknown; id: string; userId: string; status: string } | null;
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role === "customer" && b.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["pending", "confirmed"].includes(b.status)) return NextResponse.json({ error: "Only pending or confirmed bookings can be cancelled" }, { status: 400 });
  const now = new Date().toISOString();
  await db.collection("bookings").updateOne({ id: b.id } as never, { $set: { status: "cancelled", updatedAt: now } });
  await releaseNights(b.id);
  await logActivity({ actorId: user.id, actorRole: user.role, action: "booking.cancelled", entity: "booking", entityId: b.id });
  return NextResponse.json({ ok: true });
}
