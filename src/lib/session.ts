import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type AppUser = { id: string; email: string; name: string; role: "customer" | "staff" | "admin"; isActive?: boolean };

export async function getSessionUser(): Promise<AppUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const u = session.user as unknown as Record<string, unknown>;
  if (u.isActive === false) return null;
  return {
    id: String(u.id),
    email: String(u.email ?? ""),
    name: String(u.name ?? ""),
    role: (["customer", "staff", "admin"].includes(String(u.role)) ? String(u.role) : "customer") as AppUser["role"],
    isActive: u.isActive !== false,
  };
}

export function canAccess(userRole: string | undefined, allowed: string[]): boolean {
  if (!userRole) return false;
  if (allowed.includes(userRole)) return true;
  if (userRole === "admin" && (allowed.includes("staff") || allowed.includes("customer"))) return true;
  if (userRole === "staff" && allowed.includes("customer")) return false;
  return false;
}

export const STAFF_ROUTES = ["staff", "admin"];
export const ADMIN_ROUTES = ["admin"];
