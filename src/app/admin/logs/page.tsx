"use client";
import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui";

export default function LogsPage() {
  const [logs, setLogs] = useState<Record<string, string>[]>([]);
  useEffect(() => { fetch("/api/admin/activity-logs").then((r) => r.json()).then((j) => setLogs(j.logs ?? [])).catch(() => {}); }, []);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Activity logs</h1>
      {logs.map((l) => <Card key={String(l._id)}><p className="text-sm"><Badge>{String(l.action)}</Badge> {String(l.entity ?? "")} {String(l.entityId ?? "")} · {String(l.actorRole ?? "")} · {String(l.createdAt ?? "")}</p>{l.detail && <p className="text-xs text-slate-500">{String(l.detail)}</p>}</Card>)}
      {logs.length === 0 && <Card><p className="text-sm text-slate-500">No activity yet.</p></Card>}
    </div>
  );
}
