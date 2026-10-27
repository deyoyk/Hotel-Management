"use client";
import { useEffect, useState } from "react";
import { Card, Button, Input } from "@/components/ui";
import { RevenueChart } from "@/components/charts";
import { inr } from "@/lib/utils";

export default function ReportsPage() {
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState("2026-12-31");
  const [d, setD] = useState<{ totalRevenue?: number; totalBookings?: number; revenueByDay?: { date: string; total: number }[]; bookings?: Record<string, string | number>[] } | null>(null);
  async function load() {
    const j = await (await fetch(`/api/admin/reports?from=${from}&to=${to}`)).json();
    setD(j);
  }
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports & analytics</h1>
      <Card>
        <div className="flex gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button onClick={load}>Run</Button>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><p className="text-xs uppercase text-slate-500">Revenue in range</p><p className="text-2xl font-bold">{inr(Number(d?.totalRevenue ?? 0))}</p></Card>
        <Card><p className="text-xs uppercase text-slate-500">Bookings in range</p><p className="text-2xl font-bold">{d?.totalBookings ?? 0}</p></Card>
      </div>
      <Card><h2 className="mb-2 font-semibold">Revenue by day</h2><RevenueChart data={d?.revenueByDay ?? []} /></Card>
      <Card>
        <h2 className="mb-2 font-semibold">Occupancy calendar</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr><th className="text-left">Room</th><th className="text-left">Guest</th><th className="text-left">Dates</th><th className="text-left">Status</th></tr></thead>
            <tbody>
              {(d?.bookings ?? []).slice(0, 60).map((b) => <tr key={String(b.id)} className="border-t"><td className="py-1">{String(b.roomNumber)}</td><td>{String(b.guestName)}</td><td>{String(b.checkIn)} → {String(b.checkOut)}</td><td>{String(b.status)}</td></tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
