import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, Badge, Button } from "@/components/ui";
import { inr, fmtDate } from "@/lib/utils";

export const instant = false;

export default async function Confirmation({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const db = await getDb();
  const b = await db.collection("bookings").findOne({ $or: [{ id }, { bookingNumber: id }] } as never);
  if (!b) return <Card>Booking not found.</Card>;
  const book = b as unknown as Record<string, string | number>;
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Card>
        <Badge tone="green">Confirmed</Badge>
        <h1 className="mt-2 text-2xl font-bold">Booking {String(book.bookingNumber)}</h1>
        <div className="mt-3 space-y-1 text-sm text-slate-600">
          <p>Room {String(book.roomNumber)} · {fmtDate(String(book.checkIn))} → {fmtDate(String(book.checkOut))} · {String(book.nights)} nights</p>
          <p>Guests: {String(book.guestCount)} · {String(book.guestName)} ({String(book.guestEmail)})</p>
          <p>Subtotal {inr(Number(book.subtotal))} · Tax {inr(Number(book.tax))}</p>
          <p className="text-base font-semibold text-slate-900">Total {inr(Number(book.total))} · Payment: {String(book.paymentStatus)}</p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/dashboard"><Button>View my bookings</Button></Link>
          <Link href="/rooms"><Button variant="ghost">Book another</Button></Link>
        </div>
      </Card>
    </div>
  );
}
