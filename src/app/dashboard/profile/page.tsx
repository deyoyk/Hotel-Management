"use client";
import { useEffect, useState } from "react";
import { Card, Button, Input, Field } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [msg, setMsg] = useState("");
  useEffect(() => {
    authClient.getSession().then((r) => {
      const u = (r as { data?: { user?: { name?: string } } }).data?.user;
      if (u?.name) setForm((f) => ({ ...f, name: u.name ?? "" }));
    }).catch(() => {});
  }, []);
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="mt-3 space-y-3">
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Button onClick={() => setMsg("Profile editing is handled by your account record. Contact staff to change your email.")}>Save</Button>
          {msg && <p className="text-sm text-slate-600">{msg}</p>}
        </div>
      </Card>
    </div>
  );
}
