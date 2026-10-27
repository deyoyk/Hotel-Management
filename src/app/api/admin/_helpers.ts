import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import { roomSchema, roomTypeSchema, settingsSchema } from "@/modules/validation";
import { logActivity } from "@/modules/common";
import { ObjectId } from "mongodb";

function isAdmin(role?: string) { return role === "admin"; }
function isStaff(role?: string) { return role === "staff" || role === "admin"; }

export async function adminRoomsGET() {
  const db = await getDb();
  const rooms = await db.collection("rooms").find({}).sort({ number: 1 }).toArray();
  return NextResponse.json({ rooms: rooms.map((r) => ({ ...r, _id: String(r._id) })) });
}
export async function adminRoomsPOST(req: Request, user: { id: string; role: string }) {
  const body = await req.json();
  const parsed = roomSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const db = await getDb();
  const exists = await db.collection("rooms").findOne({ number: parsed.data.number });
  if (exists) return NextResponse.json({ error: "Room number already exists" }, { status: 409 });
  const id = new ObjectId().toString();
  const doc = { _id: new ObjectId(id), id, ...parsed.data, housekeepingStatus: "clean", createdAt: new Date().toISOString() };
  await db.collection("rooms").insertOne(doc as never);
  await logActivity({ actorId: user.id, actorRole: user.role, action: "room.create", entity: "room", entityId: id, detail: parsed.data.number });
  return NextResponse.json({ room: { ...doc, _id: id } }, { status: 201 });
}
export async function adminRoomTypesGET() {
  const db = await getDb();
  const types = await db.collection("room_types").find({}).toArray();
  return NextResponse.json({ roomTypes: types.map((t) => ({ ...t, _id: String(t._id) })) });
}
export async function adminRoomTypesPOST(req: Request, user: { id: string; role: string }) {
  const body = await req.json();
  const parsed = roomTypeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const db = await getDb();
  const id = new ObjectId().toString();
  const doc = { _id: new ObjectId(id), id, ...parsed.data, createdAt: new Date().toISOString() };
  await db.collection("room_types").insertOne(doc as never);
  await logActivity({ actorId: user.id, actorRole: user.role, action: "room-type.create", entity: "room-type", entityId: id });
  return NextResponse.json({ roomType: { ...doc, _id: id } }, { status: 201 });
}
export async function adminSettingsGET() {
  const { getSettings } = await import("@/modules/common");
  return NextResponse.json({ settings: await getSettings() });
}
export async function adminSettingsPATCH(req: Request, user: { id: string; role: string }) {
  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const db = await getDb();
  await db.collection("hotel_settings").updateOne({ _id: "global" as never }, { $set: { ...parsed.data, updatedAt: new Date().toISOString() } }, { upsert: true });
  await logActivity({ actorId: user.id, actorRole: user.role, action: "settings.update", entity: "settings", entityId: "global" });
  return NextResponse.json({ ok: true });
}
export { isAdmin, isStaff };
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.role)) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
  return { error: null, user };
}
export async function requireStaff() {
  const user = await getSessionUser();
  if (!user || !isStaff(user.role)) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
  return { error: null, user };
}
