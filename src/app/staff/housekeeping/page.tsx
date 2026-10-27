"use client";
import { useEffect, useState } from "react";
import { Card, Badge, Button } from "@/components/ui";

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<Record<string, string>[]>([]);
  async function load() { setTasks((await (await fetch("/api/housekeeping")).json()).tasks ?? []); }
  useEffect(() => { load(); }, []);
  async function setStatus(id: string, status: string, roomId?: string) {
    await fetch(`/api/housekeeping/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, roomId }) });
    load();
  }
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Housekeeping</h1>
      {tasks.map((t) => (
        <Card key={String(t.id ?? t._id)} className="flex items-center justify-between">
          <p className="text-sm">Room {(t.room as unknown as { number?: string })?.number ?? String(t.roomId)} · {String(t.status)} · {String(t.note ?? "")}</p>
          <div className="flex gap-2">
            <Badge>{String(t.status)}</Badge>
            {String(t.status) === "pending" && <Button onClick={() => setStatus(String(t.id ?? t.roomId), "in_progress", String(t.roomId))}>Start</Button>}
            {String(t.status) !== "done" && <Button onClick={() => setStatus(String(t.id ?? t.roomId), "done", String(t.roomId))}>Done</Button>}
          </div>
        </Card>
      ))}
      {tasks.length === 0 && <Card><p className="text-sm text-slate-500">No tasks.</p></Card>}
    </div>
  );
}
