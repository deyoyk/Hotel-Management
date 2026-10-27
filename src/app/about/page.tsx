import { Card, PageHeader } from "@/components/ui";
import { Building2, ConciergeBell, LineChart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="About" title="Grand Horizon Hotel & Suites" description="A single-hotel reservation and management platform — a public booking site, a staff operations desk and an admin control room in one application." />
      <div className="grid gap-5 sm:grid-cols-3">
        {[
          ["Public booking", "Live availability, transparent totals and instant confirmation for every guest.", Building2],
          ["Staff operations", "Reservations, walk-ins, check-in, check-out, housekeeping and payments.", ConciergeBell],
          ["Admin control", "Rooms, pricing, staff, revenue analytics and audit logs.", LineChart],
        ].map(([title, body, Icon]) => {
          const Glyph = Icon as typeof Building2;
          return (
            <Card key={title as string} className="animate-rise">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-brass-300"><Glyph className="h-5 w-5" /></span>
              <p className="mt-3 font-display text-xl font-semibold text-forest-950">{title as string}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">{body as string}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
