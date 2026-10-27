import { NextResponse } from "next/server";
import { findAvailableRooms } from "@/modules/bookings/service";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const checkIn = url.searchParams.get("checkIn") ?? "";
  const checkOut = url.searchParams.get("checkOut") ?? "";
  const guests = Number(url.searchParams.get("guests") ?? 1);
  const typeId = url.searchParams.get("typeId") ?? undefined;
  const maxPrice = url.searchParams.get("maxPrice") ? Number(url.searchParams.get("maxPrice")) : undefined;
  if (!checkIn || !checkOut) return NextResponse.json({ error: "checkIn and checkOut required" }, { status: 400 });
  const rooms = await findAvailableRooms(checkIn, checkOut, guests, typeId, maxPrice);
  return NextResponse.json({ rooms, checkIn, checkOut });
}
