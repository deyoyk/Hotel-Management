import { NextResponse } from "next/server";
import { adminRoomsGET, adminRoomsPOST, requireAdmin } from "../_helpers";
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return adminRoomsGET();
}
export async function POST(req: Request) {
  const { error, user } = await requireAdmin();
  if (error || !user) return error ?? NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return adminRoomsPOST(req, user);
}
