import Link from "next/link";
import { connection } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Card, Badge, Button, PageHeader } from "@/components/ui";
import { inr } from "@/lib/utils";
import { ArrowLeft, ArrowRight, BedDouble, Check, Star, Users } from "lucide-react";

export const instant = false;

export default async function RoomDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const db = await getDb();
  const room = await db.collection("rooms").findOne({ $or: [{ id }, { number: id }] } as never);
  if (!room) return <Card><p className="font-display text-xl text-forest-950">Room not found.</p><Link href="/rooms" className="mt-2 inline-block text-sm font-semibold text-forest-700 underline">Back to rooms</Link></Card>;
  const type = await db.collection("room_types").findOne({ id: (room as { typeId?: string }).typeId });
  const reviews = await db.collection("reviews").find({ roomTypeId: (room as { typeId?: string }).typeId }).sort({ createdAt: -1 }).limit(10).toArray();
  const amenities = ((type as { amenities?: string[] } | null)?.amenities ?? []) as string[];
  return (
    <div className="space-y-6">
      <Link href="/rooms" className="inline-flex items-center gap-1 text-sm font-semibold text-forest-700 hover:text-forest-900"><ArrowLeft className="h-4 w-4" /> All rooms</Link>
      <section className="animate-rise overflow-hidden rounded-3xl bg-forest-950 text-ivory-50 shadow-lift">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="flex min-h-64 flex-col justify-end bg-gradient-to-br from-forest-700 via-forest-800 to-forest-950 p-8">
            <BedDouble className="h-10 w-10 text-brass-300" />
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.24em] text-brass-300">{(type as { name?: string } | null)?.name}</p>
            <h1 className="mt-1 font-display text-5xl font-semibold tracking-tight">Room {String((room as { number?: string }).number)}</h1>
            <p className="mt-2 text-sm text-ivory-50/70">{(type as { beds?: string } | null)?.beds} · Sleeps {(room as { capacity?: number }).capacity} · Floor {(room as { floor?: number }).floor}</p>
          </div>
          <div className="p-8">
            <p className="text-sm leading-relaxed text-ivory-50/75">{(type as { description?: string } | null)?.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {amenities.map((a) => <Badge key={a} tone="gold" className="bg-white/10 text-brass-200 ring-white/15"><Check className="h-3 w-3" /> {a}</Badge>)}
              {amenities.length === 0 && <p className="text-sm text-ivory-50/50">Amenities listed at check-in.</p>}
            </div>
            <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
              <p><span className="font-display text-4xl font-semibold text-brass-300">{inr(Number((room as { basePrice?: number }).basePrice))}</span><span className="ml-1 text-sm text-ivory-50/60">/ night</span></p>
              <Link href={`/booking/${(room as { id?: string }).id ?? (room as { number?: string }).number}`}><Button variant="gold" size="lg">Book this room <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>
          </div>
        </div>
      </section>
      <Card>
        <PageHeader eyebrow="Reviews" title="Guest reviews" />
        <div className="mt-4 space-y-3">
          {reviews.map((r) => (
            <div key={String(r._id)} className="rounded-xl border border-forest-900/10 bg-ivory-50 p-4">
              <p className="flex items-center gap-1 text-brass-500">{"★".repeat(Number((r as { rating?: number }).rating ?? 5))}<span className="ml-2 text-xs font-semibold text-ink-500">{String((r as { createdAt?: string }).createdAt ?? "").slice(0, 10)}</span></p>
              <p className="mt-1 text-sm text-ink-600">{String((r as { comment?: string }).comment ?? "")}</p>
            </div>
          ))}
          {reviews.length === 0 && <p className="flex items-center gap-2 text-sm text-ink-500"><Star className="h-4 w-4 text-brass-500" /> No reviews yet — be the first to stay in this room.</p>}
        </div>
      </Card>
    </div>
  );
}
