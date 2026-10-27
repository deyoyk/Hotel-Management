"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Button, Card, Input, Badge, PageHeader, EmptyState, statusTone } from "@/components/ui";
import { inr } from "@/lib/utils";
import { ArrowRight, BedDouble, Search, Users } from "lucide-react";

type Room = { id: string; number: string; basePrice: number; capacity: number; floor: number; housekeepingStatus: string; type?: { name?: string } | null };

export default function SearchPage() {
  const [form, setForm] = useState({ checkIn: "", checkOut: "", guests: "2" });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [typeId, setTypeId] = useState("");
  useEffect(() => {
    api<{ roomTypes: { id: string; name: string }[] }>("/api/admin/room-types").then((j) => setTypes(j.roomTypes)).catch(() => {});
  }, []);
  async function run(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const q = new URLSearchParams({ checkIn: form.checkIn, checkOut: form.checkOut, guests: form.guests });
      if (typeId) q.set("typeId", typeId);
      const j = await api<{ rooms: Room[] }>(`/api/availability?${q.toString()}`);
      setRooms(j.rooms);
      setSearched(true);
      if (j.rooms.length === 0) toast.info("No rooms free for those dates. Try different dates.");
      else toast.success(`${j.rooms.length} room${j.rooms.length === 1 ? "" : "s"} available.`);
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Reservations" title="Check availability" description="Pick your dates and we will show every room that is genuinely free — overlapping bookings are blocked at the database level." />
      <Card className="border-forest-900/15 bg-forest-950 text-ivory-50">
        <form onSubmit={run} className="grid gap-3 sm:grid-cols-[1fr_1fr_0.7fr_1fr_auto]">
          <Input type="date" required aria-label="Check-in" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 [color-scheme:dark]" />
          <Input type="date" required aria-label="Check-out" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 [color-scheme:dark]" />
          <Input type="number" min={1} max={10} aria-label="Guests" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50" />
          <select aria-label="Room category" value={typeId} onChange={(e) => setTypeId(e.target.value)} className="w-full cursor-pointer rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-ivory-50 outline-none">
            <option value="" className="text-ink-900">Any category</option>
            {types.map((t) => <option key={t.id} value={t.id} className="text-ink-900">{t.name}</option>)}
          </select>
          <Button variant="gold" disabled={loading}><Search className="h-4 w-4" /> {loading ? "Searching…" : "Search"}</Button>
        </form>
      </Card>
      {searched && rooms.length === 0 && <EmptyState title="No rooms available" hint="Try shifting your dates by a day or two." />}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <Card key={r.id} className="animate-rise group p-0">
            <div className="flex h-28 items-end justify-between rounded-t-2xl bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 p-5">
              <BedDouble className="h-7 w-7 text-brass-300" />
              <Badge tone={statusTone(r.housekeepingStatus)}>{r.housekeepingStatus.replace(/_/g, " ")}</Badge>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-xl font-semibold text-forest-950">Room {r.number}</h3>
                <p className="text-right text-sm font-bold text-forest-900">{inr(r.basePrice)}<span className="block text-[11px] font-medium text-ink-500">per night</span></p>
              </div>
              <p className="mt-1 flex items-center gap-2 text-sm text-ink-500"><Users className="h-4 w-4 text-forest-600" /> {r.type?.name ?? "Standard"} · Sleeps {r.capacity} · Floor {r.floor}</p>
              <Link href={`/booking/${r.id}?checkIn=${form.checkIn}&checkOut=${form.checkOut}&guests=${form.guests}`} className="mt-4 block"><Button className="w-full">Select room <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
