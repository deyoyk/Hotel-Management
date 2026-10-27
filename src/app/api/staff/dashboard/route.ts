import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireStaff } from "../../admin/_helpers";
function today(): string { return new Date().toISOString().slice(0, 10); }
export async function GET() {
  const { error } = await requireStaff();
  if (error) return error;
  const db = await getDb();
  const t = today();
  const [checkIns, checkOuts, occupied, cleaning, pending, bookings] = await Promise.all([
    db.collection("bookings").find({ checkIn: t, status: { $in: ["confirmed", "pending"] } }).toArray(),
    db.collection("bookings").find({ checkOut: t, status: "checked_in" }).toArray(),
    db.collection("rooms").countDocuments({ housekeepingStatus: "occupied" }),
    db.collection("rooms").countDocuments({ housekeepingStatus: { $in: ["cleaning_required", "cleaning_in_progress"] } }),
    db.collection("bookings").countDocuments({ status: "pending" }),
    db.collection("bookings").find({}).sort({ createdAt: -1 }).limit(20).toArray(),
  ]);
  const totalRooms = await db.collection("rooms").countDocuments({ isActive: true });
  return NextResponse.json({
    todayCheckIns: checkIns.map((b) => ({ ...b, _id: String(b._id) })),
    todayCheckOuts: checkOuts.map((b) => ({ ...b, _id: String(b._id) })),
    occupied, cleaning, pending, totalRooms, available: totalRooms - occupied,
    recent: bookings.map((b) => ({ ...b, _id: String(b._id) })),
  });
}
