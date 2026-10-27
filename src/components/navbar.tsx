"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui";

type Role = "customer" | "staff" | "admin";
export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  useEffect(() => {
    authClient.getSession().then((r) => {
      const u = (r as { data?: { user?: { name: string; role?: string } } }).data?.user;
      if (u) setUser({ name: u.name, role: (u.role ?? "customer") as string });
    }).catch(() => {});
  }, []);
  const role = (user?.role ?? "") as Role | "";
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">Grand Horizon</Link>
        <nav className="flex flex-1 items-center gap-4 text-sm text-slate-600">
          <Link href="/rooms" className="hover:text-slate-950">Rooms</Link>
          <Link href="/search" className="hover:text-slate-950">Search</Link>
          <Link href="/about" className="hover:text-slate-950">About</Link>
          <Link href="/contact" className="hover:text-slate-950">Contact</Link>
          {user && <Link href="/dashboard" className="hover:text-slate-950">My Stays</Link>}
          {(role === "staff" || role === "admin") && <Link href="/staff" className="hover:text-slate-950">Staff</Link>}
          {role === "admin" && <Link href="/admin" className="hover:text-slate-950">Admin</Link>}
        </nav>
        {user ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-slate-500 sm:inline">{user.name} · {user.role}</span>
            <Button variant="ghost" onClick={async () => { await authClient.signOut(); setUser(null); router.push("/"); router.refresh(); }}>Logout</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-950">Login</Link>
            <Link href="/register"><Button>Book now</Button></Link>
          </div>
        )}
      </div>
    </header>
  );
}
