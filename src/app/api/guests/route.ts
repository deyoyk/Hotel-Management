import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role === "customer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = await getDb();
  const guests = await db.collection("guests").find({}).sort({ createdAt: -1 }).limit(200).toArray();
  const bookings = await db.collection("bookings").find({}).sort({ createdAt: -1 }).limit(300).toArray();
  return NextResponse.json({
    guests: guests.map((g) => ({ ...g, _id: String(g._id) })),
    recentBookings: bookings.map((b) => ({ ...b, _id: String(b._id) })),
  });
}
