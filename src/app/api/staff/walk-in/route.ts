import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireStaff } from "../../admin/_helpers";
import { createBooking } from "@/modules/bookings/service";
import { walkInSchema } from "@/modules/validation";
import { logActivity } from "@/modules/common";
export async function POST(req: Request) {
  const { error, user } = await requireStaff();
  if (error || !user) return error ?? NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const parsed = walkInSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  try {
    const booking = await createBooking({
      userId: `walkin-${Date.now()}`,
      roomId: parsed.data.roomId, checkIn: parsed.data.checkIn, checkOut: parsed.data.checkOut,
      guestCount: parsed.data.guestCount, guestName: parsed.data.guestName, guestEmail: parsed.data.guestEmail,
      guestPhone: parsed.data.guestPhone, specialRequests: parsed.data.specialRequests, status: "confirmed",
      recordPayment: parsed.data.paymentAmount ? { amount: parsed.data.paymentAmount, method: parsed.data.paymentMethod ?? "cash" } : undefined,
    });
    const db = await getDb();
    await db.collection("guests").insertOne({ id: booking.userId, name: parsed.data.guestName, email: parsed.data.guestEmail, phone: parsed.data.guestPhone ?? "", createdAt: new Date().toISOString() } as never).catch(() => {});
    await logActivity({ actorId: user.id, actorRole: user.role, action: "booking.walkin", entity: "booking", entityId: booking.id });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Booking failed" }, { status: 409 });
  }
}
