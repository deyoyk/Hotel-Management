import Link from "next/link";
import { connection } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Card, Badge, Button, PageHeader } from "@/components/ui";
import { inr } from "@/lib/utils";
import { ArrowRight, BedDouble, CalendarCheck, ShieldCheck, Sparkles, Star, Users, Wifi } from "lucide-react";

export const instant = false;

export default async function Home() {
  await connection();
  let types: { id?: string; _id?: unknown; name?: string; basePrice?: number; capacity?: number; beds?: string; description?: string; amenities?: string[] }[] = [];
  try {
    const db = await getDb();
    types = await db.collection("room_types").find({ isActive: { $ne: false } }).limit(6).toArray() as typeof types;
  } catch { types = []; }
  return (
    <div className="space-y-12">
      <section className="animate-rise relative overflow-hidden rounded-3xl bg-forest-950 text-ivory-50 shadow-lift">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-forest-700/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brass-400/15 blur-3xl" />
        <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brass-400/30 bg-brass-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-brass-300">
              <Sparkles className="h-3.5 w-3.5" /> Hotel reservation & management
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Stay somewhere<br />truly <span className="italic text-brass-300">grand</span>.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory-50/70 sm:text-base">
              Real-time availability, transparent pricing and instant confirmation — backed by a full staff-run operation from check-in to checkout.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/search"><Button variant="gold" size="lg">Check availability <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/rooms"><Button variant="outline" size="lg" className="border-white/25 bg-white/5 text-ivory-50 hover:border-brass-300/60 hover:bg-white/10">Browse rooms</Button></Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-ivory-50/70">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brass-300" /> No overbooking, ever</span>
              <span className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-brass-300" /> Instant confirmation</span>
              <span className="flex items-center gap-2"><Wifi className="h-4 w-4 text-brass-300" /> Premium amenities</span>
            </div>
          </div>
          <Card className="self-center border-white/10 bg-white/[0.06] text-ivory-50 shadow-lift backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass-300">Tonight at Grand Horizon</p>
            <p className="mt-2 font-display text-3xl font-semibold">From {types.length ? inr(Math.min(...types.map((t) => Number(t.basePrice ?? 0)))) : "—"}</p>
            <p className="text-sm text-ivory-50/60">per night, taxes calculated at checkout</p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center justify-between border-b border-white/10 pb-2"><span className="text-ivory-50/60">Check-in</span><span className="font-semibold">2:00 PM</span></p>
              <p className="flex items-center justify-between border-b border-white/10 pb-2"><span className="text-ivory-50/60">Check-out</span><span className="font-semibold">11:00 AM</span></p>
              <p className="flex items-center justify-between"><span className="text-ivory-50/60">Cancellation</span><span className="font-semibold">48-hr free</span></p>
            </div>
            <Link href="/search" className="mt-5 block"><Button variant="gold" className="w-full">Plan your stay</Button></Link>
          </Card>
        </div>
      </section>

      <section className="space-y-5">
        <PageHeader eyebrow="Stay" title="Room categories" description="Every room belongs to a category with its own character, bedding and price." actions={<Link href="/rooms"><Button variant="outline" size="sm">View all rooms <ArrowRight className="h-3.5 w-3.5" /></Button></Link>} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((t, i) => (
            <Card key={String(t.id ?? i)} className="group p-0">
              <div className="flex h-36 items-end justify-between rounded-t-2xl bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 p-5">
                <BedDouble className="h-8 w-8 text-brass-300" />
                <Badge tone="gold">{inr(Number(t.basePrice ?? 0))} / night</Badge>
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-semibold text-forest-950">{t.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-ink-500">{t.description}</p>
                <p className="mt-2 flex items-center gap-2 text-xs font-medium text-forest-700"><Users className="h-3.5 w-3.5" /> Sleeps {t.capacity} · {t.beds}</p>
                <Link href="/search" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-forest-800 underline decoration-brass-400 decoration-2 underline-offset-4 hover:text-forest-600">Check dates <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            </Card>
          ))}
          {types.length === 0 && (
            <Card className="border-dashed sm:col-span-3"><p className="text-sm text-ink-500">Rooms are being configured. Run <span className="font-mono font-semibold">npm run seed</span> to load demo data.</p></Card>
          )}
        </div>
      </section>

      <section className="grid gap-5 rounded-3xl border border-forest-900/10 bg-white p-8 shadow-card sm:grid-cols-3 sm:p-10">
        {[["Best-rate promise", "Server-side pricing means the total you see is the total you pay — no hidden markups.", Star], ["Flexible cancellation", "Free cancellation up to 48 hours before check-in on every reservation.", CalendarCheck], ["Staffed front desk", "Real check-in, housekeeping and billing handled by the hotel team.", Users]].map(([title, body, Icon]) => {
          const Glyph = Icon as typeof Star;
          return (
            <div key={title as string} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-brass-300"><Glyph className="h-5 w-5" /></span>
              <div><p className="font-display text-lg font-semibold text-forest-950">{title as string}</p><p className="mt-1 text-sm leading-relaxed text-ink-500">{body as string}</p></div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
