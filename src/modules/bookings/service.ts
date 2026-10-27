import { ObjectId } from "mongodb";
import { getDb, getRawClient, ensureIndexes } from "@/lib/mongodb";
import { nightDates, nightsBetween, priceFor, validRange } from "@/lib/booking-utils";
import { nanoid } from "nanoid";

export async function findAvailableRooms(checkIn: string, checkOut: string, guests = 1, typeId?: string, maxPrice?: number) {
  await ensureIndexes();
  const db = await getDb();
  const dates = nightDates(checkIn, checkOut);
  if (!dates.length) return [];
  const blocked = await db.collection("room_nights").find({ date: { $in: dates } }).project({ roomId: 1 }).toArray();
  const blockedIds = new Set(blocked.map((b) => String(b.roomId)));
  const q: Record<string, unknown> = { isActive: true, maintenanceStatus: "operational", capacity: { $gte: guests } };
  if (typeId) q.typeId = typeId;
  if (maxPrice) q.basePrice = { $lte: maxPrice };
  const rooms = await db.collection("rooms").find(q).toArray();
  const types = await db.collection("room_types").find({}).toArray();
  const tmap = new Map(types.map((t) => [String(t.id ?? t._id), t]));
  return rooms
    .filter((r) => !blockedIds.has(String(r.id ?? r._id)))
    .map((r) => ({ ...r, _id: String(r._id), id: String(r.id ?? r._id), type: tmap.get(String(r.typeId)) ?? null }));
}

export async function createBooking(input: {
  userId: string; roomId: string; checkIn: string; checkOut: string; guestCount: number;
  guestName: string; guestEmail: string; guestPhone?: string; specialRequests?: string;
  status?: string; recordPayment?: { amount: number; method: string };
}) {
  await ensureIndexes();
  if (!validRange(input.checkIn, input.checkOut)) throw new Error("Invalid date range");
  const db = await getDb();
  const real = await db.collection("rooms").findOne({ id: input.roomId }) ?? await db.collection("rooms").findOne({ number: input.roomId });
  if (!real) throw new Error("Room not found");
  if (!real.isActive || real.maintenanceStatus !== "operational") throw new Error("Room unavailable");
  if (input.guestCount > Number(real.capacity)) throw new Error("Guest count exceeds capacity");
  const settings = await db.collection("hotel_settings").findOne({ _id: "global" as never });
  const taxPct = Number((settings as never as { taxPercentage?: number } | null)?.taxPercentage ?? 12);
  const nights = nightsBetween(input.checkIn, input.checkOut);
  const price = priceFor(nights, Number(real.basePrice), taxPct);
  const dates = nightDates(input.checkIn, input.checkOut);
  const id = new ObjectId().toString();
  const count = await db.collection("bookings").countDocuments();
  const bookingNumber = `HTL-2026-${String(count + 1).padStart(5, "0")}-${nanoid(3).toUpperCase()}`;
  const now = new Date().toISOString();
  const booking = {
    _id: new ObjectId(id), id, bookingNumber, userId: input.userId,
    guestName: input.guestName, guestEmail: input.guestEmail, guestPhone: input.guestPhone ?? "",
    roomId: String(real.id ?? real._id), roomNumber: String(real.number), roomTypeId: String(real.typeId),
    guestCount: input.guestCount, checkIn: input.checkIn, checkOut: input.checkOut,
    nights: price.nights, pricePerNight: price.pricePerNight, subtotal: price.subtotal, tax: price.tax, total: price.total,
    status: input.status ?? "confirmed", paymentStatus: "unpaid",
    specialRequests: input.specialRequests ?? "", actualCheckInAt: null, actualCheckOutAt: null,
    createdAt: now, updatedAt: now,
  };
  const nightDocs = dates.map((date) => ({ roomId: booking.roomId, date, bookingId: id }));
  const client = await getRawClient();
  const session = client.startSession();
  try {
    if (process.env.MONGODB_TRANSACTIONS === "off") throw new Error("skip-tx");
    await session.withTransaction(async () => {
      await db.collection("bookings").insertOne(booking as never, { session } as never);
      if (nightDocs.length) await db.collection("room_nights").insertMany(nightDocs as never, { session } as never);
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Transaction numbers") || msg.includes("replica set") || msg.includes("skip-tx") || msg.includes("E11000") || msg.includes("duplicate")) {
      try { await session.abortTransaction().catch(() => {}); } catch { void 0; }
      await db.collection("bookings").deleteOne({ id } as never).catch(() => {});
      await db.collection("room_nights").deleteMany({ bookingId: id } as never).catch(() => {});
      try {
        await db.collection("bookings").insertOne(booking as never);
        await db.collection("room_nights").insertMany(nightDocs as never, { ordered: true });
      } catch (err) {
        await db.collection("bookings").deleteOne({ id } as never).catch(() => {});
        await db.collection("room_nights").deleteMany({ bookingId: id } as never).catch(() => {});
        throw new Error("Room is already booked for the selected dates");
      }
    } else throw e;
  } finally {
    await session.endSession();
  }
  if (input.recordPayment && input.recordPayment.amount > 0) {
    const amt = input.recordPayment.amount;
    await db.collection("payments").insertOne({
      id: new ObjectId().toString(), bookingId: id, amount: amt, method: input.recordPayment.method,
      receivedBy: input.userId, createdAt: now,
    } as never);
    const ps = amt >= price.total ? "paid" : "partially_paid";
    await db.collection("bookings").updateOne({ id } as never, { $set: { paymentStatus: ps, updatedAt: now } });
    booking.paymentStatus = ps;
  }
  return { ...booking, _id: String(booking._id) };
}

export async function releaseNights(bookingId: string) {
  const db = await getDb();
  await db.collection("room_nights").deleteMany({ bookingId } as never);
}

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["checked_in", "cancelled", "no_show"],
  checked_in: ["checked_out"],
  checked_out: [], cancelled: [], no_show: [],
};
