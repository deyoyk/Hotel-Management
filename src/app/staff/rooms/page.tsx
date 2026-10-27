"use client";
import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui";
import { inr } from "@/lib/utils";
export default function StaffRooms() {
  const [rooms, setRooms] = useState<Record<string, string | number | boolean>[]>([]);
  useEffect(() => { fetch("/api/rooms").then((r) => r.json()).then((j) => setRooms(j.rooms ?? [])).catch(() => {}); }, []);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Room status</h1>
      {rooms.map((r) => (
        <Card key={String(r.id)} className="flex items-center justify-between">
          <p className="text-sm font-medium">Room {String(r.number)} · {inr(Number(r.basePrice))}</p>
          <p className="flex gap-2"><Badge>{String(r.housekeepingStatus)}</Badge><Badge tone={r.maintenanceStatus === "operational" ? "green" : "red"}>{String(r.maintenanceStatus)}</Badge></p>
        </Card>
      ))}
    </div>
  );
}
