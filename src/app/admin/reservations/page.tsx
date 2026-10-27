"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Badge, Input, statusTone } from "@/components/ui";

export default function AdminReservations() {
  const [list, setList] = useState<Record<string, string>[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { fetch("/api/bookings").then((r) => r.json()).then((j) => setList(j.bookings ?? [])).catch(() => {}); }, []);
  const f = list.filter((b) => !q || JSON.stringify(b).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">All reservations</h1>
      <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
      {f.map((b) => (
        <Card key={b.id} className="flex items-center justify-between">
          <p className="text-sm">{b.bookingNumber} · {b.guestName} · Room {b.roomNumber} · {b.checkIn} → {b.checkOut}</p>
          <div className="flex items-center gap-2"><Badge tone={statusTone(b.status)}>{b.status}</Badge><Link href={`/staff/reservations/${b.id}`} className="text-sm underline">Open</Link></div>
        </Card>
      ))}
    </div>
  );
}
