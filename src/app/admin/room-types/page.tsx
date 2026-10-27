"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Card, Button, Input, Field, Textarea } from "@/components/ui";

export default function RoomTypesPage() {
  const [types, setTypes] = useState<Record<string, string | number | string[]>[]>([]);
  const [form, setForm] = useState({ name: "", description: "", basePrice: "2500", capacity: "2", beds: "1 King", amenities: "wifi,ac,tv", images: "" });
  async function load() { setTypes((await (await fetch("/api/admin/room-types")).json()).roomTypes ?? []); }
  useEffect(() => { load(); }, []);
  async function create(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/room-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amenities: form.amenities.split(",").map((s) => s.trim()).filter(Boolean), images: form.images ? [form.images] : [] }) });
    load();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Room types</h1>
      <Card>
        <form onSubmit={create} className="grid gap-2 sm:grid-cols-2">
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Base price"><Input value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} /></Field>
          <Field label="Capacity"><Input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></Field>
          <Field label="Beds"><Input value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} /></Field>
          <Field label="Amenities (comma separated)"><Input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} /></Field>
          <Field label="Image URL"><Input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="Description"><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field></div>
          <div><Button>Add type</Button></div>
        </form>
      </Card>
      {types.map((t) => <Card key={String(t.id)}><p className="text-sm font-medium">{String(t.name)} · ₹{String(t.basePrice)} · sleeps {String(t.capacity)}</p><p className="text-sm text-slate-500">{String(t.description)}</p></Card>)}
    </div>
  );
}
