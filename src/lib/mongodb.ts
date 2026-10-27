import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB ?? "hotel_hrms";
const resolvedUri = uri || "mongodb://127.0.0.1:27017/hotel_hrms";

let clientPromise: Promise<MongoClient> | null = null;
let dbRef: Db | null = null;

function getClient(): Promise<MongoClient> {
  if (!clientPromise) {
    const client = new MongoClient(resolvedUri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  if (dbRef) return dbRef;
  const client = await getClient();
  dbRef = client.db(dbName);
  return dbRef;
}

export async function getRawClient(): Promise<MongoClient> {
  return getClient();
}

export async function ensureIndexes(): Promise<void> {
  const db = await getDb();
  await Promise.all([
    db.collection("room_nights").createIndex({ roomId: 1, date: 1 }, { unique: true }),
    db.collection("room_nights").createIndex({ bookingId: 1 }),
    db.collection("bookings").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("bookings").createIndex({ roomId: 1, checkIn: 1, checkOut: 1 }),
    db.collection("bookings").createIndex({ bookingNumber: 1 }, { unique: true }),
    db.collection("bookings").createIndex({ status: 1 }),
    db.collection("rooms").createIndex({ number: 1 }, { unique: true }),
    db.collection("rooms").createIndex({ typeId: 1 }),
    db.collection("payments").createIndex({ bookingId: 1 }),
    db.collection("housekeeping_tasks").createIndex({ roomId: 1, status: 1 }),
    db.collection("activity_logs").createIndex({ createdAt: -1 }),
    db.collection("reviews").createIndex({ roomTypeId: 1 }),
    db.collection("user").createIndex({ email: 1 }, { unique: true }),
  ]);
}
