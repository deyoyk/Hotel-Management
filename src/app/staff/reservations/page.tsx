"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Badge, Input, Button, PageHeader, EmptyState, statusTone } from "@/components/ui";
import { ArrowRight, Search, UserPlus } from "lucide-react";

type Row = { id: string; bookingNumber: string; guestName: string; roomNumber: string; checkIn: string; checkOut: string; status: string };

export default function StaffReservations() {
  const [list, setList] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  async function load() {
    try {
      const j = await api<{ bookings: Row[] }>("/api/bookings");
      setList(j.bookings ?? []);
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  useEffect(() => { load(); }, []);
  const filtered = list.filter((b) => !q || `${b.bookingNumber} ${b.guestName} ${b.roomNumber}`.toLowerCase().includes(q.toLowerCase()));
  async function act(id: string, action: string) {
    try {
      await api(`/api/bookings/${id}/${action}`, { method: "POST" });
      toast.success(action === "check-in" ? "Guest checked in." : "Guest checked out.");
      load();
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Operations" title="Reservations" description="Every booking in the hotel, with instant check-in and check-out." actions={<Link href="/staff/walk-in"><Button variant="gold"><UserPlus className="h-4 w-4" /> Walk-in</Button></Link>} />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input placeholder="Search guest, room or booking number…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
      </div>
      {filtered.length === 0 && <EmptyState title="No reservations found" hint="Walk-ins can be created in seconds." />}
      <div className="space-y-3">
        {filtered.map((b) => (
          <Card key={b.id} className="animate-rise flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-forest-950">{b.bookingNumber} · {b.guestName} · Room {b.roomNumber}</p>
              <p className="text-sm text-ink-500">{b.checkIn} → {b.checkOut}</p>
            </div>
            <Badge tone={statusTone(b.status)}>{b.status.replace(/_/g, " ")}</Badge>
            <div className="flex items-center gap-2">
              <Link href={`/staff/reservations/${b.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-forest-800 underline decoration-brass-400 decoration-2 underline-offset-4">Open <ArrowRight className="h-3.5 w-3.5" /></Link>
              {b.status === "confirmed" && <Button size="sm" onClick={() => act(b.id, "check-in")}>Check in</Button>}
              {b.status === "checked_in" && <Button size="sm" onClick={() => act(b.id, "check-out")}>Check out</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
