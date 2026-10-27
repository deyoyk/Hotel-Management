import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "../../_helpers";
import { logActivity } from "@/modules/common";
import { ObjectId } from "mongodb";
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAdmin();
  if (error || !user) return error ?? NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();
  const db = await getDb();
  const update: Record<string, unknown> = {};
  if (body.role) update.role = body.role;
  if (typeof body.isActive === "boolean") update.isActive = body.isActive;
  if (body.name) update.name = body.name;
  if (body.phone !== undefined) update.phone = body.phone;
  const oid = ObjectId.isValid(id) ? new ObjectId(id) : null;
  await db.collection("user").updateOne(oid ? { _id: oid } as never : ({ id } as never), { $set: { ...update, updatedAt: new Date() } });
  await logActivity({ actorId: user.id, actorRole: user.role, action: "staff.update", entity: "user", entityId: id });
  return NextResponse.json({ ok: true });
}
