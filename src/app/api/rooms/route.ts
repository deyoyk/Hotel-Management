import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
export async function GET() {
  const db = await getDb();
  const [rooms, types] = await Promise.all([db.collection("rooms").find({ isActive: true }).toArray(), db.collection("room_types").find({}).toArray()]);
  const tmap = new Map(types.map((t) => [String((t as { id?: string }).id ?? t._id), t]));
  return NextResponse.json({ rooms: rooms.map((r) => ({ ...r, _id: String(r._id), id: String((r as { id?: string }).id ?? r._id), type: tmap.get(String((r as { typeId?: string }).typeId)) ?? null })) });
}
