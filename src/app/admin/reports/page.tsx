"use client";
import { useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Button, Input, Badge, PageHeader, Stat, statusTone } from "@/components/ui";
import { RevenueChart } from "@/components/charts";
import { inr } from "@/lib/utils";
import { CalendarRange, Play } from "lucide-react";

type Report = { totalRevenue?: number; totalBookings?: number; revenueByDay?: { date: string; total: number }[]; bookings?: Record<string, string | number>[] };

export default function ReportsPage() {
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState("2026-12-31");
  const [d, setD] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  async function load() {
    setBusy(true);
    try {
      setD(await api<Report>(`/api/admin/reports?from=${from}&to=${to}`));
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Analytics" title="Reports & analytics" description="Revenue and occupancy for any date range." actions={<Button variant="gold" size="sm" disabled={busy} onClick={load}><Play className="h-3.5 w-3.5" /> {busy ? "Running…" : "Run report"}</Button>} />
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-forest-700/80">From<Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-forest-700/80">To<Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
      </Card>
      <div className="grid gap-5 sm:grid-cols-2">
        <Stat label="Revenue in range" value={inr(Number(d?.totalRevenue ?? 0))} accent />
        <Stat label="Bookings in range" value={String(d?.totalBookings ?? 0)} sub="Check-ins within the window" />
      </div>
      <Card><h2 className="flex items-center gap-2 font-display text-xl font-semibold text-forest-950"><CalendarRange className="h-5 w-5 text-brass-500" /> Revenue by day</h2><div className="mt-3"><RevenueChart data={d?.revenueByDay ?? []} /></div></Card>
      <Card>
        <h2 className="font-display text-xl font-semibold text-forest-950">Occupancy ledger</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-forest-900/10">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="bg-forest-950 text-left text-[11px] uppercase tracking-[0.14em] text-brass-300"><th className="px-4 py-3">Room</th><th className="px-4 py-3">Guest</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Status</th></tr></thead>
            <tbody>
              {(d?.bookings ?? []).slice(0, 60).map((b) => (
                <tr key={String(b.id)} className="border-t border-forest-900/10 transition hover:bg-ivory-100">
                  <td className="px-4 py-2.5 font-semibold">{String(b.roomNumber)}</td>
                  <td className="px-4 py-2.5">{String(b.guestName)}</td>
                  <td className="px-4 py-2.5 text-ink-500">{String(b.checkIn)} → {String(b.checkOut)}</td>
                  <td className="px-4 py-2.5"><Badge tone={statusTone(String(b.status))}>{String(b.status).replace(/_/g, " ")}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {(d?.bookings ?? []).length === 0 && <p className="px-4 py-6 text-center text-sm text-ink-500">No bookings in this range.</p>}
        </div>
      </Card>
    </div>
  );
}
