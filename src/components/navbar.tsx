"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/toast";
import { messageOf } from "@/lib/api-client";
import { Button } from "./ui";
import { BedDouble, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "customer" | "staff" | "admin";

const links: { href: string; label: string; roles?: Role[] }[] = [
  { href: "/rooms", label: "Rooms" },
  { href: "/search", label: "Availability" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "My Stays" },
  { href: "/staff", label: "Staff", roles: ["staff", "admin"] },
  { href: "/admin", label: "Admin", roles: ["admin"] },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    authClient.getSession().then((r) => {
      const u = (r as { data?: { user?: { name: string; role?: string } } }).data?.user;
      if (u) setUser({ name: u.name, role: (u.role ?? "customer") as string });
    }).catch(() => {});
  }, [pathname]);
  const role = (user?.role ?? "") as Role | "";
  const visible = links.filter((l) => {
    if (!l.roles) {
      if ((l.href === "/dashboard") && !user) return false;
      return true;
    }
    return role === "admin" ? true : l.roles.includes(role as Role);
  });
  async function logout() {
    try {
      await authClient.signOut();
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (e) {
      toast.error(messageOf(e));
    }
  }
  return (
    <header className="sticky top-0 z-40 border-b border-forest-950/40 bg-forest-950/95 text-ivory-50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brass-400 text-forest-950">
            <BedDouble className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-tight">Grand Horizon</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-brass-300">Hotel & Suites</span>
          </span>
        </Link>
        <nav className="ml-4 hidden flex-1 items-center gap-1 text-sm lg:flex">
          {visible.map((l) => (
            <Link key={l.href} href={l.href} className={cn("rounded-lg px-3 py-2 font-medium text-ivory-50/70 transition hover:bg-white/5 hover:text-ivory-50", pathname === l.href && "bg-white/10 text-brass-300")}>{l.label}</Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <span className="text-xs text-ivory-50/60">{user.name} · <span className="font-semibold uppercase tracking-wider text-brass-300">{user.role}</span></span>
              <Button variant="gold" size="sm" onClick={logout}><LogOut className="h-3.5 w-3.5" /> Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-ivory-50/70 hover:text-ivory-50">Login</Link>
              <Link href="/register"><Button variant="gold" size="sm">Book now</Button></Link>
            </>
          )}
        </div>
        <button aria-label="Toggle menu" onClick={() => setOpen((v) => !v)} className="ml-auto rounded-lg p-2 text-ivory-50/80 hover:bg-white/10 lg:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/10 px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {visible.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={cn("rounded-lg px-3 py-2.5 text-sm font-medium text-ivory-50/80 hover:bg-white/5", pathname === l.href && "bg-white/10 text-brass-300")}>{l.label}</Link>
            ))}
            <div className="mt-2 flex items-center gap-3 border-t border-white/10 pt-3">
              {user ? (
                <>
                  <span className="flex-1 text-xs text-ivory-50/60">{user.name} · {user.role}</span>
                  <Button variant="gold" size="sm" onClick={logout}>Logout</Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-ivory-50/80">Login</Link>
                  <Link href="/register" onClick={() => setOpen(false)}><Button variant="gold" size="sm">Book now</Button></Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
