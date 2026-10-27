"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui";

export default function GuestsPage() {
  const [d, setD] = useState<{ guests?: Record<string, string>[]; recentBookings?: Record<string, string>[] }>({});
  useEffect(() => { fetch("/api/guests").then((r) => r.json()).then(setD).catch(() => {}); }, []);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Guests</h1>
      {(d.recentBookings ?? []).map((b) => (
        <Card key={String(b.id)}><p className="text-sm font-medium">{String(b.guestName)} · {String(b.guestEmail)} · {String(b.guestPhone)}</p><p className="text-sm text-slate-500">{String(b.bookingNumber)} · Room {String(b.roomNumber)} · {String(b.status)}</p></Card>
      ))}
      {(d.recentBookings ?? []).length === 0 && <Card><p className="text-sm text-slate-500">No guests yet.</p></Card>}
    </div>
  );
}
