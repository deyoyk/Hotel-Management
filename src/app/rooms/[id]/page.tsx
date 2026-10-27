import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { Card, Badge, Button } from "@/components/ui";
import { inr } from "@/lib/utils";

export const instant = false;

export default async function RoomDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const room = await db.collection("rooms").findOne({ $or: [{ id }, { number: id }] } as never);
  if (!room) return <Card>Room not found.</Card>;
  const type = await db.collection("room_types").findOne({ id: (room as { typeId?: string }).typeId });
  const reviews = await db.collection("reviews").find({ roomTypeId: (room as { typeId?: string }).typeId }).sort({ createdAt: -1 }).limit(10).toArray();
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Room {String((room as { number?: string }).number)}</h1>
          <Badge>{(type as { name?: string } | null)?.name}</Badge>
        </div>
        <p className="mt-2 text-sm text-slate-600">{(type as { description?: string } | null)?.description}</p>
        <p className="mt-2 text-sm">Beds: {(type as { beds?: string } | null)?.beds} · Sleeps {(room as { capacity?: number }).capacity} · Floor {(room as { floor?: number }).floor}</p>
        <p className="mt-1 text-sm">Amenities: {((type as { amenities?: string[] } | null)?.amenities ?? []).join(", ") || "—"}</p>
        <p className="mt-2 text-lg font-semibold">{inr(Number((room as { basePrice?: number }).basePrice))} <span className="text-sm font-normal text-slate-500">per night</span></p>
        <Link href={`/booking/${(room as { id?: string }).id ?? (room as { number?: string }).number}`}><Button>Book this room</Button></Link>
      </Card>
      <Card>
        <h2 className="font-semibold">Guest reviews</h2>
        <div className="mt-2 space-y-2">
          {reviews.map((r) => <p key={String(r._id)} className="text-sm text-slate-600">{"★".repeat(Number((r as { rating?: number }).rating ?? 5))} — {String((r as { comment?: string }).comment ?? "")}</p>)}
          {reviews.length === 0 && <p className="text-sm text-slate-500">No reviews yet.</p>}
        </div>
      </Card>
    </div>
  );
}
