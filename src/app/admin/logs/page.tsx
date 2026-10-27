"use client";
import { useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Badge, PageHeader, EmptyState } from "@/components/ui";
import { ScrollText } from "lucide-react";

type Log = { _id?: string; action: string; entity?: string; entityId?: string; actorRole?: string; createdAt?: string; detail?: string };

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  useEffect(() => {
    api<{ logs: Log[] }>("/api/admin/activity-logs").then((j) => setLogs(j.logs ?? [])).catch((e) => toast.error(messageOf(e)));
  }, []);
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Audit" title="Activity logs" description="Who did what, and when — across bookings, rooms, staff and settings." />
      {logs.length === 0 && <EmptyState title="No activity yet" hint="Staff and admin actions are recorded here." />}
      <div className="space-y-2.5">
        {logs.map((l, i) => (
          <Card key={String(l._id ?? i)} className="animate-rise flex flex-wrap items-center gap-3 !p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-900 text-brass-300"><ScrollText className="h-4 w-4" /></span>
            <p className="min-w-0 flex-1 text-sm"><Badge>{String(l.action)}</Badge>
              <span className="ml-2 text-ink-500">{String(l.entity ?? "")} {String(l.entityId ?? "")} · {String(l.actorRole ?? "")} · {String(l.createdAt ?? "").slice(0, 19).replace("T", " ")}</span>
              {l.detail ? <span className="block text-xs text-ink-400">{String(l.detail)}</span> : null}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
