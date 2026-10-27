"use client";
import { useEffect, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/toast";
import { messageOf } from "@/lib/api-client";
import { Card, Button, Input, Field, PageHeader } from "@/components/ui";
import { UserRound } from "lucide-react";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", phone: "" });
  useEffect(() => {
    authClient.getSession().then((r) => {
      const u = (r as { data?: { user?: { name?: string } } }).data?.user;
      if (u?.name) setForm((f) => ({ ...f, name: u.name ?? "" }));
    }).catch((e) => toast.error(messageOf(e)));
  }, []);
  function save(e: FormEvent) {
    e.preventDefault();
    toast.info("Profile editing is handled by your account record. Contact staff to change your email.");
  }
  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader eyebrow="Account" title="Profile" />
      <Card className="animate-rise">
        <p className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-brass-300"><UserRound className="h-6 w-6" /></p>
        <form onSubmit={save} className="mt-4 space-y-4">
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} placeholder="+91 …" onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Button className="w-full">Save</Button>
        </form>
      </Card>
    </div>
  );
}
