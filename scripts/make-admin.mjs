import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hotel_hrms";
const dbName = process.env.MONGODB_DB || "hotel_hrms";
const email = (process.argv[2] || "").trim().toLowerCase();

if (!email || !email.includes("@")) {
  console.error("Usage: npm run make-admin -- you@example.com");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const res = await db.collection("user").updateOne(
    { email },
    { $set: { role: "admin", isActive: true, updatedAt: new Date() } }
  );
  if (res.matchedCount === 0) {
    console.error(`No user found with email ${email}`);
    process.exit(2);
  }
  console.log(`${email} is now an admin`);
} finally {
  await client.close();
}
