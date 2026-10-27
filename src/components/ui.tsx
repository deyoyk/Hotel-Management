import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes, ChangeEvent, TextareaHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "gold" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-forest-900 text-ivory-50 shadow-sm hover:bg-forest-800 active:bg-forest-950",
  gold: "bg-brass-400 text-forest-950 shadow-sm hover:bg-brass-300 active:bg-brass-500",
  outline: "border border-forest-900/20 bg-white/60 text-forest-900 hover:border-forest-900/40 hover:bg-forest-50",
  ghost: "text-forest-900 hover:bg-forest-900/5",
  danger: "bg-red-700 text-white shadow-sm hover:bg-red-600 active:bg-red-800",
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({ className, variant = "primary", size = "md", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button {...rest} className={cn("inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-50", buttonVariants[variant], buttonSizes[size], className)} />;
}

const fieldBase = "w-full rounded-xl border border-forest-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-[inset_0_1px_2px_rgb(10_26_18/0.04)] outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20";

export function Input({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn(fieldBase, className)} />;
}
export function Select({ className, children, ...p }: HTMLAttributes<HTMLSelectElement> & { name?: string; value?: string; onChange?: (e: ChangeEvent<HTMLSelectElement>) => void; children?: ReactNode }) {
  return <select {...p} className={cn(fieldBase, "cursor-pointer", className)}>{children}</select>;
}
export function Textarea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cn(fieldBase, "resize-y", className)} />;
}

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div {...p} className={cn("rounded-2xl border border-forest-900/10 bg-white p-5 shadow-card sm:p-6", className)} />;
}

type Tone = "slate" | "green" | "red" | "amber" | "blue" | "gold";
const tones: Record<Tone, string> = {
  slate: "bg-forest-900/5 text-forest-900 ring-forest-900/15",
  green: "bg-forest-100 text-forest-800 ring-forest-700/25",
  red: "bg-red-50 text-red-800 ring-red-600/25",
  amber: "bg-brass-100 text-brass-700 ring-brass-600/30",
  blue: "bg-sky-50 text-sky-800 ring-sky-600/25",
  gold: "bg-forest-900 text-brass-300 ring-brass-400/40",
};
export function Badge({ tone = "slate", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", tones[tone], className)}>{children}</span>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-forest-700/80">{label}</span>{children}</label>;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="animate-rise flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass-600">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-forest-950 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-sm leading-relaxed text-ink-500 sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <Card className={cn("relative overflow-hidden", accent && "border-forest-900 bg-forest-950 text-ivory-50")}>
      {accent && <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brass-400/20 blur-2xl" />}
      <p className={cn("text-[11px] font-bold uppercase tracking-[0.16em]", accent ? "text-brass-300" : "text-forest-600")}>{label}</p>
      <p className={cn("mt-1 font-display text-3xl font-semibold tracking-tight", accent ? "text-ivory-50" : "text-forest-950")}>{value}</p>
      {sub && <p className={cn("mt-1 text-xs", accent ? "text-ivory-50/60" : "text-ink-500")}>{sub}</p>}
    </Card>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <Card className="border-dashed py-10 text-center">
      <p className="font-display text-xl text-forest-900">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-500">{hint}</p>}
    </Card>
  );
}

export function statusTone(s: string): Tone {
  if (s === "confirmed" || s === "paid" || s === "clean" || s === "checked_out" || s === "done") return "green";
  if (s === "cancelled" || s === "no_show") return "red";
  if (s === "pending" || s === "partially_paid" || s === "cleaning_required" || s === "unpaid" || s === "maintenance") return "amber";
  if (s === "operational" || s === "cleaning_in_progress" || s === "in_progress") return "blue";
  return "slate";
}
