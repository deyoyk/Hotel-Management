import { differenceInCalendarDays, eachDayOfInterval, format } from "date-fns";

export function nightsBetween(checkIn: string, checkOut: string): number {
  return differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
}

export function nightDates(checkIn: string, checkOut: string): string[] {
  const start = new Date(checkIn);
  const endExclusive = new Date(checkOut);
  if (isNaN(start.getTime()) || isNaN(endExclusive.getTime())) return [];
  const last = new Date(endExclusive);
  last.setDate(last.getDate() - 1);
  if (last < start) return [];
  return eachDayOfInterval({ start, end: last }).map((d) => format(d, "yyyy-MM-dd"));
}

export function validRange(checkIn: string, checkOut: string): boolean {
  const n = nightsBetween(checkIn, checkOut);
  return Number.isInteger(n) && n >= 1 && n <= 60;
}

export type PriceBreakdown = { nights: number; pricePerNight: number; subtotal: number; tax: number; total: number };

export function priceFor(nights: number, pricePerNight: number, taxPct: number): PriceBreakdown {
  const subtotal = nights * pricePerNight;
  const tax = Math.round(subtotal * (taxPct / 100));
  return { nights, pricePerNight, subtotal, tax, total: subtotal + tax };
}
