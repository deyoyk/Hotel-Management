import { connection } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Card, PageHeader } from "@/components/ui";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export const instant = false;

export default async function ContactPage() {
  await connection();
  let s: { email?: string; phone?: string; address?: string; checkInTime?: string; checkOutTime?: string } = {};
  try {
    const db = await getDb();
    s = (await db.collection("hotel_settings").findOne({ _id: "global" as never }) as unknown as typeof s) ?? {};
  } catch { void 0; }
  const rows: [string, typeof Mail][] = [
    [s.email ?? "stay@grandhorizon.in", Mail],
    [s.phone ?? "+91 80 4000 1200", Phone],
    [s.address ?? "12 Residency Road, Bengaluru 560025", MapPin],
  ];
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader eyebrow="Contact" title="Talk to the front desk" description="Reservations, maintenance requests, invoices — reach us any time." />
      <Card className="animate-rise">
        <div className="space-y-3">
          {rows.map(([value, Icon]) => (
            <p key={value} className="flex items-center gap-3 rounded-xl border border-forest-900/10 bg-ivory-50 px-4 py-3 text-sm font-medium text-forest-950">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-900 text-brass-300"><Icon className="h-4 w-4" /></span>{value}
            </p>
          ))}
          <p className="flex items-center gap-3 rounded-xl border border-forest-900/10 bg-ivory-50 px-4 py-3 text-sm font-medium text-forest-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-900 text-brass-300"><Clock className="h-4 w-4" /></span>
            Check-in {s.checkInTime ?? "2:00 PM"} · Check-out {s.checkOutTime ?? "11:00 AM"}
          </p>
        </div>
      </Card>
    </div>
  );
}
