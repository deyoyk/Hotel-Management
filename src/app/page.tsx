import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { Card, Button, Badge } from "@/components/ui";
import { inr } from "@/lib/utils";

export const instant = false;

export default async function Home() {
  let types: unknown[] = [];
  try {
    const db = await getDb();
    types = await db.collection("room_types").find({ isActive: { $ne: false } }).limit(6).toArray();
  } catch { types = []; }
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-2xl bg-slate-900 p-10 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Hotel Reservation & Management</p>
        <h1 className="mt-2 max-w-xl text-4xl font-bold leading-tight">Book a comfortable stay at Grand Horizon</h1>
        <p className="mt-3 max-w-xl text-slate-300">Real-time availability, transparent pricing, instant confirmation and staff-managed check-in.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/search"><Button>Check availability</Button></Link>
          <Link href="/rooms"><Button variant="ghost">Browse rooms</Button></Link>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Room categories</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(types as { id?: string; _id?: unknown; name?: string; basePrice?: number; capacity?: number; beds?: string }[]).map((t) => (
            <Card key={String(t.id ?? t._id)}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t.name}</h3>
                <Badge>{inr(Number(t.basePrice ?? 0))} / night</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t.beds} · Sleeps {t.capacity}</p>
              <Link href={`/search`} className="mt-3 inline-block text-sm font-medium underline">Check dates</Link>
            </Card>
          ))}
          {types.length === 0 && <Card><p className="text-sm text-slate-500">Rooms are being configured. Run the seed script to load demo data.</p></Card>}
        </div>
      </section>
    </div>
  );
}
