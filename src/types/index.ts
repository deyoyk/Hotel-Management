export type BookingStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show";
export type PaymentStatus = "unpaid" | "partially_paid" | "paid" | "refunded";
export type HousekeepingStatus = "clean" | "occupied" | "cleaning_required" | "cleaning_in_progress";

export type RoomType = {
  _id?: string; id: string; name: string; description: string; basePrice: number;
  capacity: number; beds: string; amenities: string[]; images: string[]; isActive: boolean;
};
export type Room = {
  _id?: string; id: string; number: string; typeId: string; floor: number; basePrice: number;
  capacity: number; housekeepingStatus: HousekeepingStatus; maintenanceStatus: "operational" | "maintenance";
  isActive: boolean; type?: RoomType;
};
export type Booking = {
  _id?: string; id: string; bookingNumber: string; userId: string; guestName: string; guestEmail: string; guestPhone?: string;
  roomId: string; roomNumber?: string; roomTypeId?: string; guestCount: number; checkIn: string; checkOut: string;
  nights: number; pricePerNight: number; subtotal: number; tax: number; total: number;
  status: BookingStatus; paymentStatus: PaymentStatus; specialRequests?: string;
  actualCheckInAt?: string | null; actualCheckOutAt?: string | null;
  createdAt: string; updatedAt: string;
};
export type HotelSettings = {
  hotelName: string; description: string; address: string; phone: string; email: string;
  checkInTime: string; checkOutTime: string; currency: string; taxPercentage: number; cancellationPolicy: string;
};
export const DEFAULT_SETTINGS: HotelSettings = {
  hotelName: "Grand Horizon Hotel", description: "Comfortable stays in the heart of the city.",
  address: "12 Residency Road, Bengaluru 560025", phone: "+91 80 4000 1200", email: "stay@grandhorizon.in",
  checkInTime: "14:00", checkOutTime: "11:00", currency: "INR", taxPercentage: 12,
  cancellationPolicy: "Free cancellation up to 48 hours before check-in. Later cancellations incur one night charge.",
};
