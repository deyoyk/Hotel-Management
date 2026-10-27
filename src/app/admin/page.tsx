"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, PageHeader, Stat } from "@/components/ui";
import { RevenueChart, CountChart } from "@/components/charts";
import { inr } from "@/lib/utils";
import { ArrowRight, BedDouble, ClipboardList, ConciergeBell, LineChart, Settings2, Sparkles, Users, Wallet } from "lucide-react";

type Dash = { totalRooms?: number; availableRooms?: number; occupiedRooms?: number; maintenanceRooms?: number; totalReservations?: number; todayCheckIns?: number; todayCheckOuts?: number; monthlyRevenue?: number; occupancyRate?: number; revenueByMonth?: { month: string; total: number }[]; bookingsByType?: { type: string; count: number }[]; cancellations?: number };

const nav = [
  ["Rooms", "/admin/rooms", BedDouble], ["Room types", "/admin/room-types", ClipboardList],
  ["Reservations", "/admin/reservations", ConciergeBell], ["Staff", "/admin/staff", Users],
  ["Housekeeping", "/admin/housekeeping", Sparkles], ["Payments", "/admin/payments", Wallet],
  ["Reports", "/admin/reports", LineChart], ["Settings", "/admin/settings", Settings2],
] as const;

export default function AdminHome() {
  const [d, setD] = useState<Dash | null>(null);
  useEffect(() => {
    api<Dash>("/api/admin/dashboard").then(setD).catch((e) => toast.error(messageOf(e)));
  }, []);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Control room" title="Hotel overview" description="Occupancy, revenue and operations at a glance." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Total rooms" value={String(d?.totalRooms ?? "—")} />
        <Stat label="Available" value={String(d?.availableRooms ?? "—")} />
        <Stat label="Occupied" value={String(d?.occupiedRooms ?? "—")} accent />
        <Stat label="Maintenance" value={String(d?.maintenanceRooms ?? "—")} />
        <Stat label="Occupancy" value={`${d?.occupancyRate ?? 0}%`} />
        <Stat label="Reservations" value={String(d?.totalReservations ?? "—")} />
        <Stat label="Check-ins today" value={String(d?.todayCheckIns ?? "—")} />
        <Stat label="Check-outs today" value={String(d?.todayCheckOuts ?? "—")} />
        <Stat label="Revenue" value={inr(Number(d?.monthlyRevenue ?? 0))} accent />
        <Stat label="Cancellations" value={String(d?.cancellations ?? "—")} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card><h2 className="font-display text-xl font-semibold text-forest-950">Revenue over time</h2><div className="mt-3"><RevenueChart data={d?.revenueByMonth ?? []} /></div></Card>
        <Card><h2 className="font-display text-xl font-semibold text-forest-950">Bookings by room type</h2><div className="mt-3"><CountChart data={d?.bookingsByType ?? []} /></div></Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {nav.map(([label, href, Icon]) => (
          <Link key={href} href={href}>
            <Card className="group flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-900 text-brass-300"><Icon className="h-5 w-5" /></span>
              <span className="flex-1 text-sm font-semibold text-forest-950">{label}</span>
              <ArrowRight className="h-4 w-4 text-brass-500 transition group-hover:translate-x-1" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
