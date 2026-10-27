"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Card, Button, Input, Field } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [err, setErr] = useState("");
  async function run(e: FormEvent) {
    e.preventDefault(); setErr("");
    const r = await authClient.signUp.email({ email: form.email, password: form.password, name: form.name });
    if (r.error) { setErr(r.error.message ?? "Registration failed"); return; }
    router.push("/dashboard"); router.refresh();
  }
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-xl font-bold">Create account</h1>
        <form onSubmit={run} className="mt-4 space-y-3">
          <Field label="Full name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Password"><Input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button>Register</Button>
        </form>
        <p className="mt-3 text-sm text-slate-500">Have an account? <Link href="/login" className="underline">Login</Link></p>
      </Card>
    </div>
  );
}
