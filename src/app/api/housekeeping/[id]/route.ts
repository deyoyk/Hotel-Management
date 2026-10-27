import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role === "customer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();
  const allowedTask = ["pending", "in_progress", "done"];
  const allowedRoom = ["clean", "occupied", "cleaning_required", "cleaning_in_progress"];
  const db = await getDb();
  if (body.status && allowedTask.includes(body.status)) {
    await db.collection("housekeeping_tasks").updateOne({ $or: [{ id }, { roomId: id }] } as never, { $set: { status: body.status, updatedAt: new Date().toISOString() } });
    if (body.status === "done" && body.roomId) {
      await db.collection("rooms").updateOne({ id: body.roomId } as never, { $set: { housekeepingStatus: "clean" } });
    }
    return NextResponse.json({ ok: true });
  }
  if (body.housekeepingStatus && allowedRoom.includes(body.housekeepingStatus)) {
    await db.collection("rooms").updateOne({ $or: [{ id }, { number: id }] } as never, { $set: { housekeepingStatus: body.housekeepingStatus } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Invalid status" }, { status: 400 });
}
