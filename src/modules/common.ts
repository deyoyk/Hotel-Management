import { getDb } from "@/lib/mongodb";

export async function logActivity(entry: { actorId?: string; actorRole?: string; action: string; entity?: string; entityId?: string; detail?: string }) {
  try {
    const db = await getDb();
    await db.collection("activity_logs").insertOne({ ...entry, createdAt: new Date().toISOString() });
  } catch { void 0; }
}

export async function getSettings() {
  const { DEFAULT_SETTINGS } = await import("@/types");
  const db = await getDb();
  const doc = await db.collection("hotel_settings").findOne({ _id: "global" as never });
  if (!doc) return DEFAULT_SETTINGS;
  const { _id, ...rest } = doc as Record<string, unknown>;
  return { ...DEFAULT_SETTINGS, ...(rest as object) };
}
