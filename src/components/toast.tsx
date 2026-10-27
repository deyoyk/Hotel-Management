"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

export type ToastKind = "error" | "success" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string };
type Listener = (t: ToastItem) => void;

const listeners = new Set<Listener>();
let seq = 0;

function push(kind: ToastKind, message: string) {
  const item = { id: ++seq, kind, message };
  listeners.forEach((l) => l(item));
}

export const toast = {
  error: (message: string) => push("error", message),
  success: (message: string) => push("success", message),
  info: (message: string) => push("info", message),
};

const styles: Record<ToastKind, { bar: string; icon: typeof Info }> = {
  error: { bar: "border-red-200 bg-red-50 text-red-900", icon: TriangleAlert },
  success: { bar: "border-forest-200 bg-forest-50 text-forest-900", icon: CheckCircle2 },
  info: { bar: "border-brass-200 bg-brass-100 text-forest-950", icon: Info },
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    const onToast = (t: ToastItem) => {
      setItems((prev) => [...prev.slice(-3), t]);
      window.setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 5200);
    };
    listeners.add(onToast);
    return () => { listeners.delete(onToast); };
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
      {items.map((t) => {
        const Icon = styles[t.kind].icon;
        return (
          <div key={t.id} className={cn("animate-toast-in pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lift", styles[t.kind].bar)}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
            <button aria-label="Dismiss notification" onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))} className="rounded p-0.5 opacity-60 transition hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
