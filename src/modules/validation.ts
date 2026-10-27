import { z } from "zod";

export const searchSchema = z.object({
  checkIn: z.string().min(10), checkOut: z.string().min(10),
  guests: z.coerce.number().min(1).max(10).default(2),
  typeId: z.string().optional(), maxPrice: z.coerce.number().optional(),
});
export const createBookingSchema = z.object({
  roomId: z.string().min(1), checkIn: z.string().min(10), checkOut: z.string().min(10),
  guestCount: z.number().min(1).max(10), guestName: z.string().min(2), guestEmail: z.string().email(),
  guestPhone: z.string().optional(), specialRequests: z.string().max(500).optional(),
});
export const walkInSchema = createBookingSchema.extend({ paymentAmount: z.number().min(0).optional(), paymentMethod: z.string().optional() });
export const roomSchema = z.object({
  number: z.string().min(1), typeId: z.string().min(1), floor: z.coerce.number().min(0).max(50),
  basePrice: z.coerce.number().min(100), capacity: z.coerce.number().min(1).max(10),
  maintenanceStatus: z.enum(["operational", "maintenance"]).default("operational"), isActive: z.boolean().default(true),
});
export const roomTypeSchema = z.object({
  name: z.string().min(2), description: z.string().default(""), basePrice: z.coerce.number().min(100),
  capacity: z.coerce.number().min(1).max(10), beds: z.string().default("1 Queen"),
  amenities: z.array(z.string()).default([]), images: z.array(z.string()).default([]), isActive: z.boolean().default(true),
});
export const settingsSchema = z.object({
  hotelName: z.string().min(2), description: z.string().default(""), address: z.string().default(""),
  phone: z.string().default(""), email: z.string().email().or(z.literal("")).default(""),
  checkInTime: z.string().default("14:00"), checkOutTime: z.string().default("11:00"),
  currency: z.string().default("INR"), taxPercentage: z.coerce.number().min(0).max(40).default(12),
  cancellationPolicy: z.string().default(""),
});
