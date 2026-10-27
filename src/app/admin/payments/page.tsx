"use client";
import { useEffect, useState } from "react";
import { Card, Button, Input, Field } from "@/components/ui";
import { inr } from "@/lib/utils";

export default function PaymentsPage() {
  const [list, setList] = useState<{ id?: string; _id?: string; bookingId: string; amount: number; method: string; createdAt: string }[]>([]);
  useEffect(() => { fetch("/api/payments").then((r) => r.json()).then((j) => setList(j.payments ?? [])).catch(() => {}); }, []);
  const total = list.reduce((a, p) => a + Number(p.amount ?? 0), 0);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Payments · {inr(total)}</h1>
      {list.map((p) => <Card key={String(p.id ?? p._id)}><p className="text-sm">{inr(Number(p.amount))} · {p.method} · booking {p.bookingId} · {String(p.createdAt).slice(0, 10)}</p></Card>)}
      {list.length === 0 && <Card><p className="text-sm text-slate-500">No payments recorded.</p></Card>}
    </div>
  );
}
