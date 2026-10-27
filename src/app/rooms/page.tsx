import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { Card, Badge } from "@/components/ui";
import { inr } from "@/lib/utils";

export const instant = false;

export default async function RoomsPage() {
  const db = await getDb();
  const rooms = await db.collection("rooms").find({ isActive: true }).sort({ number: 1 }).limit(100).toArray();
  const types = await db.collection("room_types").find({}).toArray();
  const tmap = new Map(types.map((t) => [String((t as { id?: string }).id ?? t._id), t]));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Rooms</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => {
          const t = tmap.get(String((r as { typeId?: string }).typeId)) as { name?: string } | undefined;
          return (
            <Card key={String(r._id)}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Room {String((r as { number?: string }).number)} · {t?.name ?? ""}</h3>
                <Badge tone={(r as { housekeepingStatus?: string }).housekeepingStatus === "clean" ? "green" : "amber"}>{String((r as { housekeepingStatus?: string }).housekeepingStatus)}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">Sleeps {(r as { capacity?: number }).capacity} · {inr(Number((r as { basePrice?: number }).basePrice))} / night</p>
              <Link href={`/rooms/${(r as { id?: string }).id ?? (r as { number?: string }).number}`} className="mt-3 inline-block text-sm font-medium underline">View details</Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
