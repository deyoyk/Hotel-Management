"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Card, Button, Input, Field, Textarea } from "@/components/ui";

export default function SettingsPage() {
  const [form, setForm] = useState({ hotelName: "", description: "", address: "", phone: "", email: "", checkInTime: "14:00", checkOutTime: "11:00", currency: "INR", taxPercentage: 12, cancellationPolicy: "" });
  const [msg, setMsg] = useState("");
  useEffect(() => { fetch("/api/admin/settings").then((r) => r.json()).then((j) => { if (j.settings) setForm(j.settings); }).catch(() => {}); }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setMsg(r.ok ? "Settings saved." : "Failed to save.");
  }
  const set = (k: string, v: string | number) => setForm({ ...form, [k]: v });
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Hotel settings</h1>
      <Card>
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <Field label="Hotel name"><Input value={form.hotelName} onChange={(e) => set("hotelName", e.target.value)} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Address"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="Check-in time"><Input value={form.checkInTime} onChange={(e) => set("checkInTime", e.target.value)} /></Field>
          <Field label="Check-out time"><Input value={form.checkOutTime} onChange={(e) => set("checkOutTime", e.target.value)} /></Field>
          <Field label="Currency"><Input value={form.currency} onChange={(e) => set("currency", e.target.value)} /></Field>
          <Field label="Tax %"><Input type="number" value={form.taxPercentage} onChange={(e) => set("taxPercentage", Number(e.target.value))} /></Field>
          <div className="sm:col-span-2"><Field label="Description"><Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field></div>
          <div className="sm:col-span-2"><Field label="Cancellation policy"><Textarea rows={3} value={form.cancellationPolicy} onChange={(e) => set("cancellationPolicy", e.target.value)} /></Field></div>
          <div><Button>Save settings</Button> {msg && <span className="ml-2 text-sm text-slate-600">{msg}</span>}</div>
        </form>
      </Card>
    </div>
  );
}
