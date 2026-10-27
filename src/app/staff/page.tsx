"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Badge, PageHeader, Stat } from "@/components/ui";
import { ArrowRight, BedDouble, CalendarCheck, CalendarX2, ConciergeBell, Sparkles, UserPlus, Users } from "lucide-react";

type Dash = { todayCheckIns?: unknown[]; todayCheckOuts?: unknown[]; occupied?: number; available?: number; pending?: number; cleaning?: number; totalRooms?: number };

const shortcuts = [
  ["Reservations", "/staff/reservations", ConciergeBell],
  ["Walk-in booking", "/staff/walk-in", UserPlus],
  ["Check-in", "/staff/check-in", CalendarCheck],
  ["Check-out", "/staff/check-out", CalendarX2],
  ["Housekeeping", "/staff/housekeeping", Sparkles],
  ["Guests", "/staff/guests", Users],
] as const;

export default function StaffHome() {
  const [d, setD] = useState<Dash | null>(null);
  useEffect(() => {
    api<Dash>("/api/staff/dashboard").then(setD).catch((e) => toast.error(messageOf(e)));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Front desk" title="Today at the hotel" description="Arrivals, departures, occupancy and rooms that need attention — all live." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Check-ins today" value={String(d?.todayCheckIns?.length ?? 0)} sub="Guests arriving" />
        <Stat label="Check-outs today" value={String(d?.todayCheckOuts?.length ?? 0)} sub="Guests departing" />
        <Stat label="Pending reservations" value={String(d?.pending ?? 0)} sub="Need confirmation" accent />
        <Stat label="Occupied rooms" value={String(d?.occupied ?? 0)} sub={`of ${d?.totalRooms ?? "—"} rooms`} />
        <Stat label="Available rooms" value={String(d?.available ?? 0)} sub="Ready to sell" />
        <Stat label="Need cleaning" value={String(d?.cleaning ?? 0)} sub="Housekeeping queue" accent />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map(([label, href, Icon]) => (
          <Link key={href} href={href}>
            <Card className="group flex items-center gap-4 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-brass-300 transition group-hover:bg-forest-800"><Icon className="h-5 w-5" /></span>
              <span className="flex-1 font-semibold text-forest-950">{label}</span>
              <ArrowRight className="h-4 w-4 text-brass-500 transition group-hover:translate-x-1" />
            </Card>
          </Link>
        ))}
      </div>
      <Card>
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-forest-950"><BedDouble className="h-5 w-5 text-brass-500" /> Arriving today</h2>
        <div className="mt-3 space-y-2">
          {((d?.todayCheckIns ?? []) as { id: string; bookingNumber: string; guestName: string; roomNumber: string }[]).map((b) => (
            <p key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ivory-50 px-4 py-2.5 text-sm">
              <span className="font-medium text-forest-950">{b.bookingNumber} · {b.guestName} · Room {b.roomNumber}</span>
              <Link href={`/staff/reservations/${b.id}`} className="font-semibold text-forest-800 underline decoration-brass-400 decoration-2 underline-offset-4">Open</Link>
            </p>
          ))}
          {(d?.todayCheckIns ?? []).length === 0 && <p className="text-sm text-ink-500">No arrivals today. <Badge>all clear</Badge></p>}
        </div>
      </Card>
    </div>
  );
}
