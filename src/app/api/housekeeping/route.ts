import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const q = user.role === "customer" ? {} : {};
  void q;
  const tasks = await db.collection("housekeeping_tasks").find({}).sort({ createdAt: -1 }).limit(200).toArray();
  const rooms = await db.collection("rooms").find({}).toArray();
  const rmap = new Map(rooms.map((r) => [String((r as { id?: string }).id ?? r._id), r]));
  return NextResponse.json({ tasks: tasks.map((t) => ({ ...t, _id: String(t._id), room: rmap.get(String((t as { roomId?: string }).roomId)) ?? null })) });
}
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role === "customer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  if (!body.roomId) return NextResponse.json({ error: "roomId required" }, { status: 400 });
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  const id = new ObjectId().toString();
  await db.collection("housekeeping_tasks").insertOne({ id, roomId: body.roomId, bookingId: body.bookingId ?? null, status: "pending", note: body.note ?? "", createdAt: new Date().toISOString(), createdBy: user.id } as never);
  await db.collection("rooms").updateOne({ id: body.roomId } as never, { $set: { housekeepingStatus: "cleaning_required" } });
  return NextResponse.json({ ok: true, id }, { status: 201 });
}
