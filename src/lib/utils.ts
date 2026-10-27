import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function inr(n: number): string {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
export function fmtDate(d: string | Date): string {
  const x = typeof d === "string" ? new Date(d) : d;
  return x.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
