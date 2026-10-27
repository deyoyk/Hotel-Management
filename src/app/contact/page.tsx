import { Card } from "@/components/ui";
import { getDb } from "@/lib/mongodb";

export const instant = false;
export default async function ContactPage() {
  let email = "stay@grandhorizon.in";
  let phone = "+91 80 4000 1200";
  try {
    const db = await getDb();
    const s = await db.collection("hotel_settings").findOne({ _id: "global" as never }) as unknown as { email?: string; phone?: string } | null;
    if (s?.email) email = s.email;
    if (s?.phone) phone = s.phone;
  } catch { void 0; }
  return (
    <Card>
      <h1 className="text-2xl font-bold">Contact us</h1>
      <p className="mt-2 text-sm text-slate-600">Email: {email}</p>
      <p className="text-sm text-slate-600">Phone: {phone}</p>
      <p className="mt-2 text-sm text-slate-500">For reservation help, maintenance requests or invoices, reach the front desk any time.</p>
    </Card>
  );
}
