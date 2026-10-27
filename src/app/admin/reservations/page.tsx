"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Badge, Input, PageHeader, EmptyState, statusTone } from "@/components/ui";
import { ArrowRight, Search } from "lucide-react";

type Row = { id: string; bookingNumber: string; guestName: string; roomNumber: string; checkIn: string; checkOut: string; status: string };

export default function AdminReservations() {
  const [list, setList] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    api<{ bookings: Row[] }>("/api/bookings").then((j) => setList(j.bookings ?? [])).catch((e) => toast.error(messageOf(e)));
  }, []);
  const f = list.filter((b) => !q || JSON.stringify(b).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Operations" title="All reservations" description="The complete booking ledger across every guest." />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input placeholder="Search anything…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
      </div>
      {f.length === 0 && <EmptyState title="No reservations match" hint="Try a different search." />}
      <div className="space-y-3">
        {f.map((b) => (
          <Card key={b.id} className="animate-rise flex flex-wrap items-center gap-3">
            <p className="min-w-0 flex-1 text-sm"><span className="font-semibold text-forest-950">{b.bookingNumber} · {b.guestName}</span><span className="block text-ink-500">Room {b.roomNumber} · {b.checkIn} → {b.checkOut}</span></p>
            <Badge tone={statusTone(b.status)}>{b.status.replace(/_/g, " ")}</Badge>
            <Link href={`/staff/reservations/${b.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-forest-800 underline decoration-brass-400 decoration-2 underline-offset-4">Open <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
