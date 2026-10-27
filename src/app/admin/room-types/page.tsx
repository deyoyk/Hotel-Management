"use client";
import { useEffect, useState, type FormEvent } from "react";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Button, Input, Field, Textarea, PageHeader, EmptyState } from "@/components/ui";
import { inr } from "@/lib/utils";
import { Layers, Plus, Users } from "lucide-react";

type RoomType = { id: string; name: string; description: string; basePrice: number; capacity: number; beds: string };

export default function RoomTypesPage() {
  const [types, setTypes] = useState<RoomType[]>([]);
  const [form, setForm] = useState({ name: "", description: "", basePrice: "2500", capacity: "2", beds: "1 King", amenities: "wifi, ac, tv", images: "" });
  async function load() {
    try {
      const j = await api<{ roomTypes: RoomType[] }>("/api/admin/room-types");
      setTypes(j.roomTypes ?? []);
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  useEffect(() => { load(); }, []);
  async function create(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/admin/room-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amenities: form.amenities.split(",").map((s) => s.trim()).filter(Boolean), images: form.images ? [form.images] : [] }) });
      toast.success(`Category “${form.name}” created.`);
      setForm({ name: "", description: "", basePrice: "2500", capacity: "2", beds: "1 King", amenities: "wifi, ac, tv", images: "" });
      load();
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Inventory" title="Room types" description="Categories carry the shared pricing, bedding and amenities that rooms inherit." />
      <Card className="border-forest-900/15 bg-forest-950 text-ivory-50">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brass-300"><Plus className="h-4 w-4" /> New category</p>
        <form onSubmit={create} className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Name"><Input placeholder="Deluxe Room" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" /></Field>
          <Field label="Base price (₹)"><Input placeholder="2500" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" /></Field>
          <Field label="Capacity"><Input placeholder="2" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" /></Field>
          <Field label="Beds"><Input placeholder="1 King" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" /></Field>
          <Field label="Amenities (comma separated)"><Input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" /></Field>
          <Field label="Image URL"><Input placeholder="https://…" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" /></Field>
          <div className="sm:col-span-2"><Field label="Description"><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" /></Field></div>
          <div><Button variant="gold">Add category</Button></div>
        </form>
      </Card>
      {types.length === 0 && <EmptyState title="No categories yet" hint="Categories group rooms under one price and style." />}
      <div className="grid gap-4 sm:grid-cols-2">
        {types.map((t) => (
          <Card key={t.id} className="animate-rise">
            <p className="flex items-center gap-3 font-display text-xl font-semibold text-forest-950"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-900 text-brass-300"><Layers className="h-5 w-5" /></span>{t.name}</p>
            <p className="mt-2 text-sm text-ink-500">{t.description}</p>
            <p className="mt-3 flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 text-ink-500"><Users className="h-4 w-4 text-forest-600" /> Sleeps {t.capacity} · {t.beds}</span><span className="font-bold text-forest-900">{inr(Number(t.basePrice))} / night</span></p>
          </Card>
        ))}
      </div>
    </div>
  );
}
