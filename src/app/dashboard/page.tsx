import Link from "next/link";
import { connection } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, Badge, Button, PageHeader, Stat, EmptyState, statusTone } from "@/components/ui";
import { inr, fmtDate } from "@/lib/utils";
import { ArrowRight, BedDouble, CalendarDays, Wallet } from "lucide-react";

export const instant = false;

export default async function CustomerDashboard() {
  await connection();
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const bookings = await db.collection("bookings").find({ userId: user.id }).sort({ createdAt: -1 }).limit(50).toArray();
  const upcoming = bookings.filter((b) => ["pending", "confirmed"].includes(String((b as { status?: string }).status)));
  const spent = bookings.filter((b) => !["cancelled"].includes(String((b as { status?: string }).status))).reduce((a, b) => a + Number((b as { total?: number }).total ?? 0), 0);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="My stays" title={`Welcome, ${user.name.split(" ")[0]}`} description="Track upcoming trips, review past stays and manage your reservations." actions={<><Link href="/search"><Button variant="gold">New booking <ArrowRight className="h-4 w-4" /></Button></Link><Link href="/dashboard/profile"><Button variant="outline">Profile</Button></Link></>} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat label="Total bookings" value={String(bookings.length)} sub="Across all time" />
        <Stat label="Upcoming" value={String(upcoming.length)} sub="Confirmed and pending trips" />
        <Stat label="Total spent" value={inr(spent)} sub="Excluding cancelled stays" accent />
      </div>
      <div className="space-y-3">
        {bookings.map((b) => {
          const status = String((b as { status?: string }).status);
          return (
            <Card key={String(b._id)} className="animate-rise flex flex-wrap items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-brass-300"><BedDouble className="h-6 w-6" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-forest-950">{String((b as { bookingNumber?: string }).bookingNumber)} · Room {(b as { roomNumber?: string }).roomNumber}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-ink-500">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{fmtDate(String((b as { checkIn?: string }).checkIn))} → {fmtDate(String((b as { checkOut?: string }).checkOut))}</span>
                  <span className="inline-flex items-center gap-1"><Wallet className="h-3.5 w-3.5" />{inr(Number((b as { total?: number }).total))}</span>
                </p>
              </div>
              <Badge tone={statusTone(status)}>{status.replace(/_/g, " ")}</Badge>
              <Link href={`/dashboard/bookings/${(b as { id?: string }).id}`} className="text-sm font-semibold text-forest-800 underline decoration-brass-400 decoration-2 underline-offset-4">Details</Link>
            </Card>
          );
        })}
        {bookings.length === 0 && <EmptyState title="No bookings yet" hint="Search availability to plan your first stay." />}
      </div>
    </div>
  );
}
