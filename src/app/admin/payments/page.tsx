"use client";
import { useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, PageHeader, EmptyState, Stat } from "@/components/ui";
import { inr } from "@/lib/utils";
import { ReceiptIndianRupee, Wallet } from "lucide-react";

type Payment = { id?: string; _id?: string; bookingId: string; amount: number; method: string; createdAt: string };

export default function PaymentsPage() {
  const [list, setList] = useState<Payment[]>([]);
  useEffect(() => {
    api<{ payments: Payment[] }>("/api/payments").then((j) => setList(j.payments ?? [])).catch((e) => toast.error(messageOf(e)));
  }, []);
  const total = list.reduce((a, p) => a + Number(p.amount ?? 0), 0);
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Money" title="Payments" description="Every rupee collected at the desk or recorded against a booking." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Stat label="Total collected" value={inr(total)} accent />
        <Stat label="Transactions" value={String(list.length)} sub="Across all bookings" />
      </div>
      {list.length === 0 && <EmptyState title="No payments recorded" hint="Staff record cash, card and UPI payments on each reservation." />}
      <div className="space-y-3">
        {list.map((p) => (
          <Card key={String(p.id ?? p._id)} className="animate-rise flex flex-wrap items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-brass-300"><ReceiptIndianRupee className="h-5 w-5" /></span>
            <p className="min-w-0 flex-1"><span className="font-display text-xl font-semibold text-forest-950">{inr(Number(p.amount))}</span><span className="block text-sm text-ink-500">{p.method} · booking {p.bookingId}</span></p>
            <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500"><Wallet className="h-3.5 w-3.5 text-forest-600" />{String(p.createdAt).slice(0, 10)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
