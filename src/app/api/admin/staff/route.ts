import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "../_helpers";
import { logActivity } from "@/modules/common";
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const db = await getDb();
  const users = await db.collection("user").find({ role: { $in: ["staff", "admin"] } }).toArray();
  return NextResponse.json({ staff: users.map((u) => ({ id: String(u._id), email: u.email, name: u.name, role: u.role, isActive: u.isActive !== false, phone: u.phone ?? "" })) });
}
export async function POST(req: Request) {
  const { error, user } = await requireAdmin();
  if (error || !user) return error ?? NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  if (!body.email || !body.password || !body.name) return NextResponse.json({ error: "name, email and password required" }, { status: 400 });
  const { auth } = await import("@/lib/auth");
  try {
    const res = await auth.api.signUpEmail({ body: { email: body.email, password: body.password, name: body.name, role: body.role === "admin" ? "admin" : "staff", phone: body.phone ?? "", isActive: true } } as never);
    await logActivity({ actorId: user.id, actorRole: user.role, action: "staff.create", entity: "user", entityId: String((res as { user?: { id?: string } }).user?.id ?? body.email), detail: body.email });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to create staff" }, { status: 400 });
  }
}
