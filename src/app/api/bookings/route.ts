import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import { createBookingSchema } from "@/modules/validation";
import { createBooking } from "@/modules/bookings/service";
import { logActivity } from "@/modules/common";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const q: Record<string, unknown> = user.role === "customer" ? { userId: user.id } : {};
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  if (status) q.status = status;
  const list = await db.collection("bookings").find(q).sort({ createdAt: -1 }).limit(200).toArray();
  return NextResponse.json({ bookings: list.map((b) => ({ ...b, _id: String(b._id) })) });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  try {
    const booking = await createBooking({ userId: user.id, ...parsed.data });
    await logActivity({ actorId: user.id, actorRole: user.role, action: "booking.create", entity: "booking", entityId: booking.id, detail: booking.bookingNumber });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Booking failed" }, { status: 409 });
  }
}
