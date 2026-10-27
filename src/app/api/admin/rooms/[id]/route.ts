import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "../../_helpers";
import { logActivity } from "@/modules/common";
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAdmin();
  if (error || !user) return error ?? NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();
  const db = await getDb();
  await db.collection("rooms").updateOne({ $or: [{ id }, { number: id }] } as never, { $set: { ...body, updatedAt: new Date().toISOString() } });
  await logActivity({ actorId: user.id, actorRole: user.role, action: "room.update", entity: "room", entityId: id });
  return NextResponse.json({ ok: true });
}
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAdmin();
  if (error || !user) return error ?? NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const db = await getDb();
  await db.collection("rooms").updateOne({ $or: [{ id }, { number: id }] } as never, { $set: { isActive: false } });
  await logActivity({ actorId: user.id, actorRole: user.role, action: "room.deactivate", entity: "room", entityId: id });
  return NextResponse.json({ ok: true });
}
