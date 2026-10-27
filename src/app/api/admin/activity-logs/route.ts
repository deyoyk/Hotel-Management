import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "../_helpers";
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const db = await getDb();
  const logs = await db.collection("activity_logs").find({}).sort({ createdAt: -1 }).limit(200).toArray();
  return NextResponse.json({ logs: logs.map((l) => ({ ...l, _id: String(l._id) })) });
}
