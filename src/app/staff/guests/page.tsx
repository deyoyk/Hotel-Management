"use client";
import { useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Badge, PageHeader, EmptyState, statusTone } from "@/components/ui";
import { Mail, Phone, UserRound } from "lucide-react";

type Booking = { id: string; guestName: string; guestEmail: string; guestPhone: string; bookingNumber: string; roomNumber: string; status: string };

export default function GuestsPage() {
  const [list, setList] = useState<Booking[]>([]);
  useEffect(() => {
    api<{ recentBookings: Booking[] }>("/api/guests").then((j) => setList(j.recentBookings ?? [])).catch((e) => toast.error(messageOf(e)));
  }, []);
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Front desk" title="Guests" description="Everyone with a recent reservation at the hotel." />
      {list.length === 0 && <EmptyState title="No guests yet" hint="Bookings create guest records automatically." />}
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((b) => (
          <Card key={String(b.id)} className="animate-rise">
            <p className="flex items-center gap-3 font-semibold text-forest-950"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-900 text-brass-300"><UserRound className="h-5 w-5" /></span>{String(b.guestName)}</p>
            <p className="mt-3 space-y-1 text-sm text-ink-500">
              <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-forest-600" />{String(b.guestEmail)}</span>
              <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-forest-600" />{String(b.guestPhone) || "—"}</span>
            </p>
            <p className="mt-3 flex items-center justify-between border-t border-forest-900/10 pt-3 text-sm"><span className="text-ink-500">{String(b.bookingNumber)} · Room {String(b.roomNumber)}</span><Badge tone={statusTone(b.status)}>{b.status.replace(/_/g, " ")}</Badge></p>
          </Card>
        ))}
      </div>
    </div>
  );
}
