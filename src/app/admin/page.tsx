"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { RevenueChart, CountChart } from "@/components/charts";
import { inr } from "@/lib/utils";

export default function AdminHome() {
  const [d, setD] = useState<{ totalRooms?: number; availableRooms?: number; occupiedRooms?: number; maintenanceRooms?: number; totalReservations?: number; todayCheckIns?: number; todayCheckOuts?: number; monthlyRevenue?: number; occupancyRate?: number; revenueByMonth?: { month: string; total: number }[]; bookingsByType?: { type: string; count: number }[]; cancellations?: number } | null>(null);
  useEffect(() => { fetch("/api/admin/dashboard").then((r) => r.json()).then(setD).catch(() => {}); }, []);
  const stats: [string, string][] = [
    ["Total rooms", String(d?.totalRooms ?? "—")], ["Available", String(d?.availableRooms ?? "—")],
    ["Occupied", String(d?.occupiedRooms ?? "—")], ["Maintenance", String(d?.maintenanceRooms ?? "—")],
    ["Reservations", String(d?.totalReservations ?? "—")], ["Check-ins today", String(d?.todayCheckIns ?? "—")],
    ["Check-outs today", String(d?.todayCheckOuts ?? "—")], ["Revenue", inr(Number(d?.monthlyRevenue ?? 0))],
    ["Occupancy", `${d?.occupancyRate ?? 0}%`], ["Cancellations", String(d?.cancellations ?? "—")],
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(([k, v]) => <Card key={k}><p className="text-xs uppercase text-slate-500">{k}</p><p className="text-xl font-bold">{v}</p></Card>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-2 font-semibold">Revenue over time</h2><RevenueChart data={d?.revenueByMonth ?? []} /></Card>
        <Card><h2 className="mb-2 font-semibold">Bookings by room type</h2><CountChart data={d?.bookingsByType ?? []} /></Card>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        {["rooms", "room-types", "reservations", "staff", "housekeeping", "payments", "reports", "logs", "settings"].map((p) => <Link key={p} href={`/admin/${p}`} className="underline">{p}</Link>)}
      </div>
    </div>
  );
}
