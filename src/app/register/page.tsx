"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/toast";
import { messageOf } from "@/lib/api-client";
import { Card, Button, Input, Field } from "@/components/ui";
import { BedDouble, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [busy, setBusy] = useState(false);
  async function run(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await authClient.signUp.email({ email: form.email, password: form.password, name: form.name });
      if (r.error) throw new Error(r.error.message ?? "Registration failed. Try a different email.");
      toast.success("Account created. Welcome to Grand Horizon.");
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
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-forest-950">Create account</h1>
        <p className="mt-1 text-sm text-ink-500">Book rooms, track stays and leave reviews.</p>
        <form onSubmit={run} className="mt-5 space-y-4">
          <Field label="Full name"><Input required autoComplete="name" placeholder="Aarav Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone"><Input autoComplete="tel" placeholder="+91 …" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Password"><Input type="password" required minLength={8} autoComplete="new-password" placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          </div>
          <Button className="w-full" size="lg" disabled={busy}><UserPlus className="h-4 w-4" /> {busy ? "Creating…" : "Register"}</Button>
        </form>
        <p className="mt-4 text-center text-sm text-ink-500">Have an account? <Link href="/login" className="font-semibold text-forest-800 underline decoration-brass-400 decoration-2 underline-offset-4">Login</Link></p>
      </Card>
    </div>
  );
}
