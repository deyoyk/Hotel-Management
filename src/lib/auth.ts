import { MongoClient } from "mongodb";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hotel_hrms";
const dbName = process.env.MONGODB_DB || "hotel_hrms";

const client = new MongoClient(uri);
const db = client.db(dbName);

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET || "local-dev-placeholder-secret-change-me-0123456789",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "customer", input: true },
      phone: { type: "string", required: false, input: true },
      isActive: { type: "boolean", required: false, defaultValue: true, input: true },
    },
  },
});
export type SessionUser = { id: string; email: string; name: string; role: string };
