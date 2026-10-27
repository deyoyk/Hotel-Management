"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Button, PageHeader, EmptyState } from "@/components/ui";
import { ArrowRight, CalendarCheck, CalendarX2 } from "lucide-react";

function Flow({ title, description, match, action, cta, empty }: { title: string; description: string; match: string[]; action: "check-in" | "check-out"; cta: string; empty: string }) {
  const [list, setList] = useState<Record<string, string>[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  async function load() {
    try {
      const j = await api<{ bookings: Record<string, string>[] }>("/api/bookings");
      setList((j.bookings ?? []).filter((b) => match.includes(String(b.status))));
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  useEffect(() => { load(); }, []);
  async function run(id: string) {
    setBusy(id);
    try {
      await api(`/api/bookings/${id}/${action}`, { method: "POST" });
      toast.success(action === "check-in" ? "Guest checked in." : "Guest checked out.");
      load();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(null);
    }
  }
  const Icon = action === "check-in" ? CalendarCheck : CalendarX2;
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Front desk" title={title} description={description} />
      {list.length === 0 && <EmptyState title={empty} hint="New arrivals appear here automatically." />}
      <div className="space-y-3">
        {list.map((b) => (
          <Card key={b.id} className="animate-rise flex flex-wrap items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-brass-300"><Icon className="h-5 w-5" /></span>
            <p className="min-w-0 flex-1 text-sm"><span className="font-semibold text-forest-950">{b.bookingNumber} · {b.guestName}</span><span className="block text-ink-500">Room {b.roomNumber} · {b.checkIn} → {b.checkOut}</span></p>
            <Link href={`/staff/reservations/${b.id}`} className="text-sm font-semibold text-forest-800 underline decoration-brass-400 decoration-2 underline-offset-4">Open</Link>
            <Button size="sm" disabled={busy === b.id} onClick={() => run(b.id)}>{busy === b.id ? "Working…" : cta} <ArrowRight className="h-3.5 w-3.5" /></Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
export function CheckInPage() { return <Flow title="Check-in" description="Confirmed arrivals ready to receive their keys." match={["confirmed"]} action="check-in" cta="Check in" empty="Nobody waiting to check in" />; }
export function CheckOutPage() { return <Flow title="Check-out" description="In-house guests ready to settle and depart." match={["checked_in"]} action="check-out" cta="Check out" empty="Nobody ready to check out" />; }
