import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes, ChangeEvent, TextareaHTMLAttributes, ReactNode } from "react";

export function Button({ className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const v = (p as { variant?: string }).variant ?? "primary";
  const { variant: _v, ...rest } = p as Record<string, unknown>;
  return <button {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} className={cn("inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50", v === "primary" && "bg-slate-900 text-white hover:bg-slate-700", v === "ghost" && "border border-slate-300 hover:bg-slate-100", v === "danger" && "bg-red-600 text-white hover:bg-red-500", className)} />;
}
export function Input({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn("w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900", className)} />;
}
export function Select({ className, children, ...p }: HTMLAttributes<HTMLSelectElement> & { name?: string; value?: string; onChange?: (e: ChangeEvent<HTMLSelectElement>) => void; children?: ReactNode }) {
  return <select {...p} className={cn("w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900", className)}>{children}</select>;
}
export function Textarea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cn("w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900", className)} />;
}
export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div {...p} className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)} />;
}
export function Badge({ tone = "slate", children }: { tone?: "slate" | "green" | "red" | "amber" | "blue"; children: React.ReactNode }) {
  const tones: Record<string, string> = { slate: "bg-slate-100 text-slate-700", green: "bg-green-100 text-green-800", red: "bg-red-100 text-red-700", amber: "bg-amber-100 text-amber-800", blue: "bg-blue-100 text-blue-800" };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1"><span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>{children}</label>;
}
export function statusTone(s: string): "slate" | "green" | "red" | "amber" | "blue" {
  if (s === "confirmed" || s === "paid" || s === "clean" || s === "checked_out" || s === "done") return "green";
  if (s === "cancelled" || s === "no_show") return "red";
  if (s === "pending" || s === "partially_paid" || s === "cleaning_required" || s === "unpaid") return "amber";
  return "blue";
}
