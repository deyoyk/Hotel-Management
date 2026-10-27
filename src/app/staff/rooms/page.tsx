"use client";
import { useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Badge, PageHeader, EmptyState, statusTone } from "@/components/ui";
import { inr } from "@/lib/utils";
import { BedDouble } from "lucide-react";

type Room = { id: string; number: string; basePrice: number; housekeepingStatus: string; maintenanceStatus: string };

export default function StaffRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  useEffect(() => {
    api<{ rooms: Room[] }>("/api/rooms").then((j) => setRooms(j.rooms ?? [])).catch((e) => toast.error(messageOf(e)));
  }, []);
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Inventory" title="Room status" description="Live housekeeping and maintenance state of every room." />
      {rooms.length === 0 && <EmptyState title="No rooms yet" hint="Ask an admin to add rooms." />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <Card key={r.id} className="animate-rise flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-brass-300"><BedDouble className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-forest-950">Room {r.number}</p>
              <p className="text-sm text-ink-500">{inr(Number(r.basePrice))} / night</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge tone={statusTone(r.housekeepingStatus)}>{r.housekeepingStatus.replace(/_/g, " ")}</Badge>
              <Badge tone={statusTone(r.maintenanceStatus)}>{r.maintenanceStatus.replace(/_/g, " ")}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
