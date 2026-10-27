"use client";
import { useEffect, useState, type FormEvent } from "react";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Button, Input, Field, Badge, PageHeader, EmptyState } from "@/components/ui";
import { ShieldCheck, UserRound } from "lucide-react";

type Staff = { id: string; name: string; email: string; role: string; isActive: boolean };

export default function StaffMgmt() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "staff" });
  const [busy, setBusy] = useState(false);
  async function load() {
    try {
      const j = await api<{ staff: Staff[] }>("/api/admin/staff");
      setStaff(j.staff ?? []);
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  useEffect(() => { load(); }, []);
  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/admin/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      toast.success(`${form.email} added as ${form.role}.`);
      setForm({ name: "", email: "", password: "", role: "staff" });
      load();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  async function toggle(id: string, isActive: boolean, role: string, label: string) {
    try {
      await api(`/api/admin/staff/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive, role }) });
      toast.success(label);
      load();
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Team" title="Staff management" description="Create logins for the front desk and control who can do what." />
      <Card className="border-forest-900/15 bg-forest-950 text-ivory-50">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brass-300"><ShieldCheck className="h-4 w-4" /> New team member</p>
        <form onSubmit={create} className="mt-3 grid gap-2 sm:grid-cols-5">
          <Field label="Name"><Input placeholder="Priya Nair" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" /></Field>
          <Field label="Email"><Input type="email" placeholder="staff@hotel.in" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" /></Field>
          <Field label="Password"><Input type="password" placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border-white/15 bg-white/10 text-ivory-50 placeholder:text-ivory-50/40" /></Field>
          <Field label="Role"><select aria-label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full cursor-pointer rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-ivory-50 outline-none"><option value="staff" className="text-ink-900">staff</option><option value="admin" className="text-ink-900">admin</option></select></Field>
          <div className="flex items-end"><Button variant="gold" disabled={busy}>{busy ? "Adding…" : "Add member"}</Button></div>
        </form>
      </Card>
      {staff.length === 0 && <EmptyState title="No staff accounts" hint="Add the first team member above." />}
      <div className="space-y-3">
        {staff.map((s) => (
          <Card key={s.id} className="animate-rise flex flex-wrap items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-brass-300"><UserRound className="h-5 w-5" /></span>
            <p className="min-w-0 flex-1 text-sm"><span className="font-semibold text-forest-950">{s.name} · {s.email}</span>
              <span className="mt-1 flex gap-1.5"><Badge>{s.role}</Badge><Badge tone={s.isActive ? "green" : "red"}>{s.isActive ? "active" : "disabled"}</Badge></span>
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggle(s.id, !s.isActive, s.role, s.isActive ? `${s.email} disabled.` : `${s.email} re-enabled.`)}>{s.isActive ? "Disable" : "Enable"}</Button>
              <Button size="sm" variant="ghost" onClick={() => toggle(s.id, s.isActive, s.role === "admin" ? "staff" : "admin", `${s.email} is now ${s.role === "admin" ? "staff" : "admin"}.`)}>Make {s.role === "admin" ? "staff" : "admin"}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
