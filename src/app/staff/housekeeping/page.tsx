"use client";
import { useEffect, useState } from "react";
import { api, messageOf } from "@/lib/api-client";
import { toast } from "@/components/toast";
import { Card, Badge, Button, PageHeader, EmptyState, statusTone } from "@/components/ui";
import { CheckCheck, Play, Sparkles } from "lucide-react";

type Task = { id?: string; _id?: string; roomId: string; status: string; note?: string; room?: { number?: string } | null };

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  async function load() {
    try {
      const j = await api<{ tasks: Task[] }>("/api/housekeeping");
      setTasks(j.tasks ?? []);
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  useEffect(() => { load(); }, []);
  async function setStatus(id: string, status: string, roomId?: string) {
    try {
      await api(`/api/housekeeping/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, roomId }) });
      toast.success(status === "done" ? "Room marked clean." : "Cleaning started.");
      load();
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Operations" title="Housekeeping" description="Rooms flow from checkout to clean and back into inventory." />
      {tasks.length === 0 && <EmptyState title="No cleaning tasks" hint="Checkout creates tasks here automatically." />}
      <div className="space-y-3">
        {tasks.map((t) => {
          const key = String(t.id ?? t._id);
          return (
            <Card key={key} className="animate-rise flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-brass-300"><Sparkles className="h-5 w-5" /></span>
              <p className="min-w-0 flex-1 text-sm"><span className="font-semibold text-forest-950">Room {t.room?.number ?? String(t.roomId)}</span>{t.note ? <span className="block text-ink-500">{t.note}</span> : null}</p>
              <Badge tone={statusTone(t.status)}>{String(t.status).replace(/_/g, " ")}</Badge>
              <div className="flex gap-2">
                {String(t.status) === "pending" && <Button size="sm" variant="outline" onClick={() => setStatus(key, "in_progress", String(t.roomId))}><Play className="h-3.5 w-3.5" /> Start</Button>}
                {String(t.status) !== "done" && <Button size="sm" onClick={() => setStatus(key, "done", String(t.roomId))}><CheckCheck className="h-3.5 w-3.5" /> Done</Button>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
