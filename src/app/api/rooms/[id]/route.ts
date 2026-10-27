import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const room = await db.collection("rooms").findOne({ $or: [{ id }, { number: id }] } as never);
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const type = await db.collection("room_types").findOne({ id: (room as { typeId?: string }).typeId });
  const reviews = await db.collection("reviews").find({ roomTypeId: (room as { typeId?: string }).typeId }).sort({ createdAt: -1 }).limit(10).toArray();
  return NextResponse.json({ room: { ...room, _id: String(room._id), id: String((room as { id?: string }).id ?? room._id) }, type: type ? { ...type, _id: String(type._id) } : null, reviews: reviews.map((r) => ({ ...r, _id: String(r._id) })) });
}
