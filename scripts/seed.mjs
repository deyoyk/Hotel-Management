import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hotel_hrms";
const dbName = process.env.MONGODB_DB || "hotel_hrms";

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  await db.collection("hotel_settings").updateOne(
    { _id: "global" },
    { $set: { _id: "global", hotelName: "Grand Horizon Hotel", description: "Comfortable stays in the heart of the city.", address: "12 Residency Road, Bengaluru 560025", phone: "+91 80 4000 1200", email: "stay@grandhorizon.in", checkInTime: "14:00", checkOutTime: "11:00", currency: "INR", taxPercentage: 12, cancellationPolicy: "Free cancellation up to 48 hours before check-in.", updatedAt: new Date().toISOString() } },
    { upsert: true }
  );
  const types = [
    { id: "deluxe", name: "Deluxe Room", description: "City view with modern amenities.", basePrice: 2500, capacity: 2, beds: "1 King", amenities: ["wifi", "ac", "tv"], images: [], isActive: true },
    { id: "executive", name: "Executive Suite", description: "Spacious suite with lounge area.", basePrice: 5200, capacity: 3, beds: "1 King + Sofa", amenities: ["wifi", "ac", "tv", "minibar"], images: [], isActive: true },
    { id: "family", name: "Family Room", description: "Two connected beds for the whole family.", basePrice: 3800, capacity: 4, beds: "2 Queen", amenities: ["wifi", "ac", "tv"], images: [], isActive: true },
  ];
  for (const t of types) {
    await db.collection("room_types").updateOne({ id: t.id }, { $set: { ...t, _id: new ObjectId(), createdAt: new Date().toISOString() } }, { upsert: true });
  }
  const rooms = [
    { number: "101", typeId: "deluxe", floor: 1 }, { number: "102", typeId: "deluxe", floor: 1 },
    { number: "103", typeId: "deluxe", floor: 1 }, { number: "104", typeId: "deluxe", floor: 1 },
    { number: "201", typeId: "executive", floor: 2 }, { number: "202", typeId: "executive", floor: 2 },
    { number: "301", typeId: "family", floor: 3 }, { number: "302", typeId: "family", floor: 3 },
  ];
  const priceByType = { deluxe: 2500, executive: 5200, family: 3800 };
  const capByType = { deluxe: 2, executive: 3, family: 4 };
  for (const r of rooms) {
    await db.collection("rooms").updateOne(
      { number: r.number },
      { $set: { id: r.number, number: r.number, typeId: r.typeId, floor: r.floor, basePrice: priceByType[r.typeId], capacity: capByType[r.typeId], housekeepingStatus: "clean", maintenanceStatus: "operational", isActive: true } },
      { upsert: true }
    );
  }
  await db.collection("room_nights").createIndex({ roomId: 1, date: 1 }, { unique: true });
  await db.collection("bookings").createIndex({ bookingNumber: 1 }, { unique: true });
  await client.close();
}

main().then(() => {}).catch((e) => { throw e; });
