"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Card, Button, Input, Badge } from "@/components/ui";

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Record<string, string | number | boolean>[]>([]);
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ number: "", typeId: "", floor: "1", basePrice: "2500", capacity: "2" });
  async function load() {
    setRooms((await (await fetch("/api/admin/rooms")).json()).rooms ?? []);
    setTypes((await (await fetch("/api/admin/room-types")).json()).roomTypes ?? []);
  }
  useEffect(() => { load(); }, []);
  async function create(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ number: "", typeId: "", floor: "1", basePrice: "2500", capacity: "2" });
    load();
  }
  async function toggle(id: string, field: string, value: unknown) {
    await fetch(`/api/admin/rooms/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }) });
    load();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Room management</h1>
      <Card>
        <form onSubmit={create} className="grid gap-2 sm:grid-cols-6">
          <Input placeholder="Number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
          <select value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })} className="rounded-lg border px-2 text-sm"><option value="">Type…</option>{types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          <Input placeholder="Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
          <Input placeholder="Price" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
          <Input placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          <Button>Add room</Button>
        </form>
      </Card>
      {rooms.map((r) => (
        <Card key={String(r.id)} className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Room {String(r.number)} · {String(r.typeId)} · ₹{String(r.basePrice)} · <Badge>{String(r.maintenanceStatus)}</Badge> <Badge>{String(r.housekeepingStatus)}</Badge></p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => toggle(String(r.id), "maintenanceStatus", r.maintenanceStatus === "operational" ? "maintenance" : "operational")}>{r.maintenanceStatus === "operational" ? "Block" : "Unblock"}</Button>
            <Button variant="ghost" onClick={() => toggle(String(r.id), "isActive", !(r.isActive as boolean))}>{r.isActive ? "Deactivate" : "Activate"}</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
