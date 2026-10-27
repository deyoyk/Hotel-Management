"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Badge, Input, Button, statusTone } from "@/components/ui";

export default function StaffReservations() {
  const [list, setList] = useState<Record<string, string | number>[]>([]);
  const [q, setQ] = useState("");
  async function load() {
    const r = await fetch("/api/bookings");
    const j = await r.json();
    setList(j.bookings ?? []);
  }
  useEffect(() => { load(); }, []);
  const filtered = list.filter((b) => !q || String(b.bookingNumber).toLowerCase().includes(q.toLowerCase()) || String(b.guestName).toLowerCase().includes(q.toLowerCase()) || String(b.roomNumber).includes(q));
  async function act(id: string, path: string) {
    await fetch(`/api/bookings/${id}/${path}`, { method: "POST" });
    load();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reservations</h1>
      <div className="flex gap-2">
        <Input placeholder="Search guest or booking ID" value={q} onChange={(e) => setQ(e.target.value)} />
        <Link href="/staff/walk-in"><Button>Walk-in</Button></Link>
      </div>
      {filtered.map((b) => (
        <Card key={String(b.id)} className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-medium">{String(b.bookingNumber)} · {String(b.guestName)} · Room {String(b.roomNumber)}</p>
            <p className="text-sm text-slate-500">{String(b.checkIn)} → {String(b.checkOut)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={statusTone(String(b.status))}>{String(b.status)}</Badge>
            <Link href={`/staff/reservations/${String(b.id)}`} className="text-sm underline">Open</Link>
            {b.status === "confirmed" && <Button onClick={() => act(String(b.id), "check-in")}>Check in</Button>}
            {b.status === "checked_in" && <Button onClick={() => act(String(b.id), "check-out")}>Check out</Button>}
          </div>
        </Card>
      ))}
    </div>
  );
}
