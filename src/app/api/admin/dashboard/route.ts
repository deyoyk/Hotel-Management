import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "../_helpers";
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const db = await getDb();
  const t = new Date().toISOString().slice(0, 10);
  const [totalRooms, occupiedRooms, maintRooms, totalReservations, checkIns, checkOuts, paidAgg, bookings] = await Promise.all([
    db.collection("rooms").countDocuments({ isActive: true }),
    db.collection("rooms").countDocuments({ housekeepingStatus: "occupied" }),
    db.collection("rooms").countDocuments({ maintenanceStatus: "maintenance" }),
    db.collection("bookings").countDocuments({}),
    db.collection("bookings").countDocuments({ checkIn: t, status: { $in: ["confirmed", "pending"] } }),
    db.collection("bookings").countDocuments({ checkOut: t, status: "checked_in" }),
    db.collection("payments").aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]).toArray(),
    db.collection("bookings").find({}).sort({ createdAt: -1 }).limit(100).toArray(),
  ]);
  const monthly: Record<string, number> = {};
  for (const b of bookings) {
    const m = String((b as { createdAt?: string }).createdAt ?? "").slice(0, 7);
    if (m) monthly[m] = (monthly[m] ?? 0) + Number((b as { total?: number }).total ?? 0);
  }
  const byType: Record<string, number> = {};
  for (const b of bookings) {
    const k = String((b as { roomTypeId?: string }).roomTypeId ?? "unknown");
    byType[k] = (byType[k] ?? 0) + 1;
  }
  const cancellations = bookings.filter((b) => (b as { status?: string }).status === "cancelled").length;
  return NextResponse.json({
    totalRooms, occupiedRooms, availableRooms: totalRooms - occupiedRooms, maintenanceRooms: maintRooms,
    totalReservations, todayCheckIns: checkIns, todayCheckOuts: checkOuts,
    monthlyRevenue: (paidAgg[0] as { total?: number } | undefined)?.total ?? 0,
    occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
    revenueByMonth: Object.entries(monthly).sort().map(([month, total]) => ({ month, total })),
    bookingsByType: Object.entries(byType).map(([type, count]) => ({ type, count })),
    cancellations,
  });
}
