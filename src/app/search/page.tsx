"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, Card, Input, Badge } from "@/components/ui";
import { inr } from "@/lib/utils";

export default function SearchPage() {
  const [form, setForm] = useState({ checkIn: "", checkOut: "", guests: "2" });
  const [rooms, setRooms] = useState<unknown[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  async function run(e: FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const q = new URLSearchParams({ checkIn: form.checkIn, checkOut: form.checkOut, guests: form.guests }).toString();
      const r = await fetch(`/api/availability?${q}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Search failed");
      setRooms(j.rooms);
    } catch (e) { setErr(e instanceof Error ? e.message : "Search failed"); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Check availability</h1>
      <Card>
        <form onSubmit={run} className="grid gap-3 sm:grid-cols-4">
          <Input type="date" required value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
          <Input type="date" required value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
          <Input type="number" min={1} max={10} value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} />
          <Button disabled={loading}>{loading ? "Searching…" : "Search"}</Button>
        </form>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => {
          const room = r as { id: string; number: string; basePrice: number; capacity: number; type?: { name?: string } };
          return (
            <Card key={room.id}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Room {room.number} · {room.type?.name}</h3>
                <Badge tone="green">{inr(room.basePrice)}</Badge>
              </div>
              <p className="text-sm text-slate-500">Sleeps {room.capacity}</p>
              <Link href={`/booking/${room.id}?checkIn=${form.checkIn}&checkOut=${form.checkOut}&guests=${form.guests}`}><Button>Select room</Button></Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
