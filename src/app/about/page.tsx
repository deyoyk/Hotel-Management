import { Card } from "@/components/ui";
export default function AboutPage() {
  return (
    <Card>
      <h1 className="text-2xl font-bold">About Grand Horizon</h1>
      <p className="mt-2 text-sm text-slate-600">A single-hotel reservation and management system: real-time availability with overlap protection, customer bookings, staff check-in and check-out, housekeeping workflows, payment tracking and admin analytics — built with Next.js, TypeScript and MongoDB.</p>
    </Card>
  );
}
