"use client";
import { useEffect, useState, type FormEvent } from "react";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Button, Input, Badge, PageHeader, EmptyState, statusTone } from "@/components/ui";
import { BedDouble, Plus } from "lucide-react";
import { inr } from "@/lib/utils";

type Room = { id: string; number: string; typeId: string; basePrice: number; capacity: number; floor: number; housekeepingStatus: string; maintenanceStatus: string; isActive: boolean };

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ number: "", typeId: "", floor: "1", basePrice: "2500", capacity: "2" });
  async function load() {
    try {
      const [r, t] = await Promise.all([api<{ rooms: Room[] }>("/api/admin/rooms"), api<{ roomTypes: { id: string; name: string }[] }>("/api/admin/room-types")]);
      setRooms(r.rooms ?? []);
      setTypes(t.roomTypes ?? []);
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  useEffect(() => { load(); }, []);
  async function create(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/admin/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      toast.success(`Room ${form.number} created.`);
      setForm({ number: "", typeId: "", floor: "1", basePrice: "2500", capacity: "2" });
      load();
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  async function toggle(id: string, field: string, value: unknown, label: string) {
    try {
      await api(`/api/admin/rooms/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }) });
      toast.success(label);
      load();
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Inventory" title="Room management" description="Add rooms, block damaged ones and control availability." />
      <Card className="border-forest-900/15 bg-forest-950 text-ivory-50">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brass-300"><Plus className="h-4 w-4" /> New room</p>
        <form onSubmit={create} className="mt-3 grid gap-2 sm:grid-cols-6">
          <Input aria-label="Room number" placeholder="Number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" />
          <select aria-label="Room type" value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })} className="w-full cursor-pointer rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-ivory-50 outline-none"><option value="" className="text-ink-900">Type…</option>{types.map((t) => <option key={t.id} value={t.id} className="text-ink-900">{t.name}</option>)}</select>
          <Input aria-label="Floor" placeholder="Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" />
          <Input aria-label="Price" placeholder="Price ₹" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" />
          <Input aria-label="Capacity" placeholder="Sleeps" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" />
          <Button variant="gold">Add room</Button>
        </form>
      </Card>
      {rooms.length === 0 && <EmptyState title="No rooms yet" hint="Add your first room above." />}
      <div className="space-y-3">
        {rooms.map((r) => (
          <Card key={r.id} className="animate-rise flex flex-wrap items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-brass-300"><BedDouble className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-forest-950">Room {r.number} · {inr(Number(r.basePrice))} · Sleeps {r.capacity}</p>
              <p className="mt-1 flex flex-wrap gap-1.5"><Badge tone={statusTone(r.housekeepingStatus)}>{r.housekeepingStatus.replace(/_/g, " ")}</Badge><Badge tone={statusTone(r.maintenanceStatus)}>{r.maintenanceStatus.replace(/_/g, " ")}</Badge>{!r.isActive && <Badge tone="red">inactive</Badge>}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggle(r.id, "maintenanceStatus", r.maintenanceStatus === "operational" ? "maintenance" : "operational", r.maintenanceStatus === "operational" ? `Room ${r.number} blocked for maintenance.` : `Room ${r.number} back in service.`)}>{r.maintenanceStatus === "operational" ? "Block" : "Unblock"}</Button>
              <Button size="sm" variant="ghost" onClick={() => toggle(r.id, "isActive", !r.isActive, r.isActive ? `Room ${r.number} deactivated.` : `Room ${r.number} activated.`)}>{r.isActive ? "Deactivate" : "Activate"}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
