"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/toast";
import { messageOf } from "@/lib/api-client";
import { Card, Button, Input, Field } from "@/components/ui";
import { BedDouble, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  async function run(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await authClient.signIn.email({ email: form.email, password: form.password });
      if (r.error) throw new Error(r.error.message ?? "Login failed. Check your email and password.");
      toast.success("Welcome back.");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-md">
      <Card className="animate-rise relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brass-300/25 blur-3xl" />
        <p className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-brass-300"><BedDouble className="h-6 w-6" /></p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-forest-950">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-500">Log in to manage your stays and reservations.</p>
        <form onSubmit={run} className="mt-5 space-y-4">
          <Field label="Email"><Input type="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Password"><Input type="password" required autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          <Button className="w-full" size="lg" disabled={busy}><LogIn className="h-4 w-4" /> {busy ? "Logging in…" : "Login"}</Button>
        </form>
        <p className="mt-4 text-center text-sm text-ink-500">No account? <Link href="/register" className="font-semibold text-forest-800 underline decoration-brass-400 decoration-2 underline-offset-4">Register</Link></p>
      </Card>
    </div>
  );
}
