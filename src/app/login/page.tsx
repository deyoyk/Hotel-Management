"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Card, Button, Input, Field } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  async function run(e: FormEvent) {
    e.preventDefault(); setErr("");
    const r = await authClient.signIn.email({ email: form.email, password: form.password });
    if (r.error) { setErr(r.error.message ?? "Login failed"); return; }
    router.push("/dashboard"); router.refresh();
  }
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="text-xl font-bold">Login</h1>
        <form onSubmit={run} className="mt-4 space-y-3">
          <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Password"><Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button>Login</Button>
        </form>
        <p className="mt-3 text-sm text-slate-500">No account? <Link href="/register" className="underline">Register</Link></p>
      </Card>
    </div>
  );
}
