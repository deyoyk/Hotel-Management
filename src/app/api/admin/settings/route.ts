import { NextResponse } from "next/server";
import { adminSettingsGET, adminSettingsPATCH, requireAdmin } from "../_helpers";
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return adminSettingsGET();
}
export async function PATCH(req: Request) {
  const { error, user } = await requireAdmin();
  if (error || !user) return error ?? NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return adminSettingsPATCH(req, user);
}
