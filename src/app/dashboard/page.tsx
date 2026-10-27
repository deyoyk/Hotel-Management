import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, Badge, statusTone } from "@/components/ui";
import { inr, fmtDate } from "@/lib/utils";

export const instant = false;

export default async function CustomerDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const bookings = await db.collection("bookings").find({ userId: user.id }).sort({ createdAt: -1 }).limit(50).toArray();
  const upcoming = bookings.filter((b) => ["pending", "confirmed"].includes(String((b as { status?: string }).status)));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-xs uppercase text-slate-500">Total bookings</p><p className="text-2xl font-bold">{bookings.length}</p></Card>
        <Card><p className="text-xs uppercase text-slate-500">Upcoming</p><p className="text-2xl font-bold">{upcoming.length}</p></Card>
        <Card><p className="text-xs uppercase text-slate-500">Spent</p><p className="text-2xl font-bold">{inr(bookings.reduce((a, b) => a + Number((b as { total?: number }).total ?? 0), 0))}</p></Card>
      </div>
      <div className="space-y-2">
        {bookings.map((b) => (
          <Card key={String(b._id)} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{String((b as { bookingNumber?: string }).bookingNumber)} · Room {(b as { roomNumber?: string }).roomNumber}</p>
              <p className="text-sm text-slate-500">{fmtDate(String((b as { checkIn?: string }).checkIn))} → {fmtDate(String((b as { checkOut?: string }).checkOut))} · {inr(Number((b as { total?: number }).total))}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={statusTone(String((b as { status?: string }).status))}>{String((b as { status?: string }).status)}</Badge>
              <Link href={`/dashboard/bookings/${(b as { id?: string }).id}`} className="text-sm underline">Details</Link>
            </div>
          </Card>
        ))}
        {bookings.length === 0 && <Card><p className="text-sm text-slate-500">No bookings yet. <Link href="/search" className="underline">Search availability</Link></p></Card>}
      </div>
      <Link href="/dashboard/profile" className="text-sm underline">Edit profile</Link>
    </div>
  );
}
