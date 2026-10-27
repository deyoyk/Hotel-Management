import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import { ObjectId } from "mongodb";
export async function GET(req: Request) {
  const db = await getDb();
  const url = new URL(req.url);
  const roomTypeId = url.searchParams.get("roomTypeId");
  const q = roomTypeId ? { roomTypeId } : {};
  const reviews = await db.collection("reviews").find(q).sort({ createdAt: -1 }).limit(50).toArray();
  return NextResponse.json({ reviews: reviews.map((r) => ({ ...r, _id: String(r._id) })) });
}
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.roomTypeId || !body.rating) return NextResponse.json({ error: "roomTypeId and rating required" }, { status: 400 });
  const db = await getDb();
  const stay = await db.collection("bookings").findOne({ userId: user.id, roomTypeId: body.roomTypeId, status: "checked_out" });
  if (!stay && user.role === "customer") return NextResponse.json({ error: "Only guests with completed stays can review" }, { status: 403 });
  const id = new ObjectId().toString();
  const doc = { _id: new ObjectId(id), id, userId: user.id, userName: user.name, roomTypeId: body.roomTypeId, rating: Math.min(5, Math.max(1, Number(body.rating))), comment: String(body.comment ?? "").slice(0, 1000), createdAt: new Date().toISOString() };
  await db.collection("reviews").insertOne(doc as never);
  return NextResponse.json({ review: { ...doc, _id: id } }, { status: 201 });
}
