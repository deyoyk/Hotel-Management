"use client";
import { useEffect, useState, type FormEvent } from "react";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Button, Input, Field, Textarea, PageHeader } from "@/components/ui";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [form, setForm] = useState({ hotelName: "", description: "", address: "", phone: "", email: "", checkInTime: "14:00", checkOutTime: "11:00", currency: "INR", taxPercentage: 12, cancellationPolicy: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api<{ settings: typeof form }>("/api/admin/settings").then((j) => { if (j.settings) setForm(j.settings); }).catch((e) => toast.error(messageOf(e)));
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      toast.success("Settings saved.");
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  const set = (k: string, v: string | number) => setForm({ ...form, [k]: v });
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader eyebrow="Property" title="Hotel settings" description="Name, timings, taxes and policies used across bookings and invoices." />
      <Card className="animate-rise">
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Hotel name"><Input value={form.hotelName} onChange={(e) => set("hotelName", e.target.value)} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Address"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="Check-in time"><Input value={form.checkInTime} onChange={(e) => set("checkInTime", e.target.value)} /></Field>
          <Field label="Check-out time"><Input value={form.checkOutTime} onChange={(e) => set("checkOutTime", e.target.value)} /></Field>
          <Field label="Currency"><Input value={form.currency} onChange={(e) => set("currency", e.target.value)} /></Field>
          <Field label="Tax %"><Input type="number" min={0} max={40} value={form.taxPercentage} onChange={(e) => set("taxPercentage", Number(e.target.value))} /></Field>
          <div className="sm:col-span-2"><Field label="Description"><Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field></div>
          <div className="sm:col-span-2"><Field label="Cancellation policy"><Textarea rows={3} value={form.cancellationPolicy} onChange={(e) => set("cancellationPolicy", e.target.value)} /></Field></div>
          <div><Button disabled={busy}><Save className="h-4 w-4" /> {busy ? "Saving…" : "Save settings"}</Button></div>
        </form>
      </Card>
    </div>
  );
}
