import Link from "next/link";
import { connection } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, Badge, Button, statusTone } from "@/components/ui";
import { inr, fmtDate } from "@/lib/utils";
import { ArrowRight, BadgeCheck, PartyPopper } from "lucide-react";

export const instant = false;

export default async function Confirmation({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const db = await getDb();
  const b = await db.collection("bookings").findOne({ $or: [{ id }, { bookingNumber: id }] } as never);
  if (!b) return <Card>Booking not found.</Card>;
  const book = b as unknown as Record<string, string | number>;
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="animate-rise overflow-hidden rounded-3xl bg-forest-950 text-center text-ivory-50 shadow-lift">
        <div className="bg-gradient-to-b from-forest-800 to-forest-950 p-8">
          <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass-400 text-forest-950"><PartyPopper className="h-7 w-7" /></p>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.24em] text-brass-300">Reservation confirmed</p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">{String(book.bookingNumber)}</h1>
          <p className="mt-2 text-sm text-ivory-50/70">A confirmation has been saved to your bookings.</p>
        </div>
        <div className="space-y-2 p-6 text-left text-sm sm:p-8">
          <p className="flex justify-between border-b border-white/10 pb-2"><span className="text-ivory-50/60">Room</span><span className="font-semibold">{String(book.roomNumber)}</span></p>
          <p className="flex justify-between border-b border-white/10 pb-2"><span className="text-ivory-50/60">Dates</span><span className="font-semibold">{fmtDate(String(book.checkIn))} → {fmtDate(String(book.checkOut))}</span></p>
          <p className="flex justify-between border-b border-white/10 pb-2"><span className="text-ivory-50/60">Guests</span><span className="font-semibold">{String(book.guestCount)} · {String(book.guestName)}</span></p>
          <p className="flex justify-between border-b border-white/10 pb-2"><span className="text-ivory-50/60">Subtotal + tax</span><span className="font-semibold">{inr(Number(book.subtotal))} + {inr(Number(book.tax))}</span></p>
          <p className="flex items-center justify-between pt-1"><span className="text-ivory-50/60">Total · <Badge tone={statusTone(String(book.paymentStatus))}>{String(book.paymentStatus).replace(/_/g, " ")}</Badge></span><span className="font-display text-2xl font-semibold text-brass-300">{inr(Number(book.total))}</span></p>
          <div className="flex gap-3 pt-4">
            <Link href="/dashboard" className="flex-1"><Button variant="gold" className="w-full"><BadgeCheck className="h-4 w-4" /> My bookings</Button></Link>
            <Link href="/rooms" className="flex-1"><Button variant="outline" className="w-full border-white/25 bg-white/5 text-ivory-50 hover:border-brass-300/60 hover:bg-white/10">Book another <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
