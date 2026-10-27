import Link from "next/link";
import { connection } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Card, Badge, Button, PageHeader, EmptyState, statusTone } from "@/components/ui";
import { inr } from "@/lib/utils";
import { ArrowRight, BedDouble, Users } from "lucide-react";

export const instant = false;

export default async function RoomsPage() {
  await connection();
  const db = await getDb();
  const rooms = await db.collection("rooms").find({ isActive: true }).sort({ number: 1 }).limit(100).toArray();
  const types = await db.collection("room_types").find({}).toArray();
  const tmap = new Map(types.map((t) => [String((t as { id?: string }).id ?? t._id), t]));
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Stay" title="Our rooms" description="Every room below is bookable. Availability for your exact dates is confirmed live at search time." actions={<Link href="/search"><Button variant="gold">Check dates <ArrowRight className="h-4 w-4" /></Button></Link>} />
      {rooms.length === 0 && <EmptyState title="No rooms published yet" hint="The hotel is still setting up its inventory." />}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => {
          const t = tmap.get(String((r as { typeId?: string }).typeId)) as { name?: string } | undefined;
          const status = String((r as { housekeepingStatus?: string }).housekeepingStatus ?? "clean");
          return (
            <Card key={String(r._id)} className="animate-rise p-0">
              <div className="flex h-28 items-end justify-between rounded-t-2xl bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 p-5">
                <BedDouble className="h-7 w-7 text-brass-300" />
                <Badge tone={statusTone(status)}>{status.replace(/_/g, " ")}</Badge>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-xl font-semibold text-forest-950">Room {String((r as { number?: string }).number)}</h3>
                  <p className="text-right text-sm font-bold text-forest-900">{inr(Number((r as { basePrice?: number }).basePrice))}<span className="block text-[11px] font-medium text-ink-500">per night</span></p>
                </div>
                <p className="mt-1 flex items-center gap-2 text-sm text-ink-500"><Users className="h-4 w-4 text-forest-600" /> {t?.name ?? "Standard"} · Sleeps {(r as { capacity?: number }).capacity}</p>
                <Link href={`/rooms/${(r as { id?: string }).id ?? (r as { number?: string }).number}`} className="mt-4 block"><Button variant="outline" className="w-full">View details <ArrowRight className="h-4 w-4" /></Button></Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
