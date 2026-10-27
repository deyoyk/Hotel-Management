"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";

function Flow({ title, match, action }: { title: string; match: string[]; action: string }) {
  const [list, setList] = useState<Record<string, string>[]>([]);
  async function load() {
    const j = await (await fetch("/api/bookings")).json();
    setList((j.bookings ?? []).filter((b: Record<string, string>) => match.includes(String(b.status))));
  }
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      {list.map((b) => (
        <Card key={b.id} className="flex items-center justify-between">
          <p className="text-sm">{b.bookingNumber} · {b.guestName} · Room {b.roomNumber} · {b.checkIn} → {b.checkOut}</p>
          <div className="flex gap-2">
            <Link href={`/staff/reservations/${b.id}`} className="text-sm underline">Open</Link>
            <Button onClick={async () => { await fetch(`/api/bookings/${b.id}/${action}`, { method: "POST" }); load(); }}>{action === "check-in" ? "Check in" : "Check out"}</Button>
          </div>
        </Card>
      ))}
      {list.length === 0 && <Card><p className="text-sm text-slate-500">Nothing here.</p></Card>}
    </div>
  );
}
export function CheckInPage() { return <Flow title="Check-in" match={["confirmed"]} action="check-in" />; }
export function CheckOutPage() { return <Flow title="Check-out" match={["checked_in"]} action="check-out" />; }
