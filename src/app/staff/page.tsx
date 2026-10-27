"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";

export default function StaffHome() {
  const [d, setD] = useState<{ todayCheckIns?: unknown[]; todayCheckOuts?: unknown[]; occupied?: number; available?: number; pending?: number; cleaning?: number } | null>(null);
  useEffect(() => { fetch("/api/staff/dashboard").then((r) => r.json()).then(setD).catch(() => {}); }, []);
  const cards: [string, string][] = [
    ["Today's check-ins", String(d?.todayCheckIns?.length ?? 0)],
    ["Today's check-outs", String(d?.todayCheckOuts?.length ?? 0)],
    ["Occupied rooms", String(d?.occupied ?? 0)],
    ["Available rooms", String(d?.available ?? 0)],
    ["Pending reservations", String(d?.pending ?? 0)],
    ["Rooms needing cleaning", String(d?.cleaning ?? 0)],
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Staff dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(([k, v]) => <Card key={k}><p className="text-xs uppercase text-slate-500">{k}</p><p className="text-2xl font-bold">{v}</p></Card>)}
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/staff/reservations" className="underline">Reservations</Link>
        <Link href="/staff/check-in" className="underline">Check-in</Link>
        <Link href="/staff/check-out" className="underline">Check-out</Link>
        <Link href="/staff/walk-in" className="underline">Walk-in booking</Link>
        <Link href="/staff/housekeeping" className="underline">Housekeeping</Link>
        <Link href="/staff/guests" className="underline">Guests</Link>
      </div>
      <Card>
        <h2 className="font-semibold">Today arrivals</h2>
        {((d?.todayCheckIns as unknown[]) ?? []).map((b) => {
          const x = b as { id: string; bookingNumber: string; guestName: string; roomNumber: string };
          return <p key={x.id} className="text-sm text-slate-600">{x.bookingNumber} · {x.guestName} · Room {x.roomNumber} <Link href={`/staff/reservations/${x.id}`} className="underline">Open</Link></p>;
        })}
        {!(d?.todayCheckIns as unknown[] | undefined)?.length && <p className="text-sm text-slate-500">No arrivals today. <Badge>all clear</Badge></p>}
      </Card>
    </div>
  );
}
