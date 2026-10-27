"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Card, Button, Input, Field, Badge } from "@/components/ui";

export default function StaffMgmt() {
  const [staff, setStaff] = useState<{ id: string; name: string; email: string; role: string; isActive: boolean }[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "staff" });
  const [msg, setMsg] = useState("");
  async function load() { setStaff((await (await fetch("/api/admin/staff")).json()).staff ?? []); }
  useEffect(() => { load(); }, []);
  async function create(e: FormEvent) {
    e.preventDefault(); setMsg("");
    const r = await fetch("/api/admin/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const j = await r.json();
    setMsg(r.ok ? "Staff created." : (j.error ?? "Failed"));
    load();
  }
  async function toggle(id: string, isActive: boolean, role: string) {
    await fetch(`/api/admin/staff/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive, role }) });
    load();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Staff management</h1>
      <Card>
        <form onSubmit={create} className="grid gap-2 sm:grid-cols-5">
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Password"><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          <Field label="Role"><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm"><option value="staff">staff</option><option value="admin">admin</option></select></Field>
          <div className="flex items-end"><Button>Create</Button></div>
        </form>
        {msg && <p className="mt-2 text-sm text-slate-600">{msg}</p>}
      </Card>
      {staff.map((s) => (
        <Card key={s.id} className="flex items-center justify-between">
          <p className="text-sm">{s.name} · {s.email} <Badge>{s.role}</Badge> <Badge tone={s.isActive ? "green" : "red"}>{s.isActive ? "active" : "disabled"}</Badge></p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => toggle(s.id, !s.isActive, s.role)}>{s.isActive ? "Disable" : "Enable"}</Button>
            <Button variant="ghost" onClick={() => toggle(s.id, s.isActive, s.role === "admin" ? "staff" : "admin")}>Make {s.role === "admin" ? "staff" : "admin"}</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
