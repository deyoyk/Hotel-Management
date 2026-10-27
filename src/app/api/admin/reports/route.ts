import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "../_helpers";
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const url = new URL(req.url);
  const from = url.searchParams.get("from") ?? "2000-01-01";
  const to = url.searchParams.get("to") ?? "2100-01-01";
  const db = await getDb();
  const bookings = await db.collection("bookings").find({ checkIn: { $gte: from, $lte: to } }).sort({ checkIn: 1 }).toArray();
  const payments = await db.collection("payments").find({}).toArray();
  const revenueByDay: Record<string, number> = {};
  for (const p of payments) {
    const d = String((p as { createdAt?: string }).createdAt ?? "").slice(0, 10);
    revenueByDay[d] = (revenueByDay[d] ?? 0) + Number((p as { amount?: number }).amount ?? 0);
  }
  return NextResponse.json({
    bookings: bookings.map((b) => ({ ...b, _id: String(b._id) })),
    revenueByDay: Object.entries(revenueByDay).sort().map(([date, total]) => ({ date, total })),
    totalRevenue: Object.values(revenueByDay).reduce((a, b) => a + b, 0),
    totalBookings: bookings.length,
  });
}
