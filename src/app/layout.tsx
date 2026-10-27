import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/toast";
import Link from "next/link";
import { Suspense } from "react";
import { BedDouble, Mail, MapPin, Phone } from "lucide-react";

const display = Playfair_Display({ subsets: ["latin"], variable: "--fd" });
const sans = Inter({ subsets: ["latin"], variable: "--fb" });

export const metadata: Metadata = { title: "Grand Horizon Hotel & Suites", description: "Hotel reservation and management system" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-screen flex-col bg-ivory-50 font-sans text-ink-900 antialiased">
        <Suspense>
          <Navbar />
        </Suspense>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">{children}</main>
        <footer className="mt-8 bg-forest-950 text-ivory-50/70">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-2 font-display text-xl font-semibold text-ivory-50">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass-400 text-forest-950"><BedDouble className="h-4 w-4" /></span>
                Grand Horizon
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed">A single-hotel reservation and management system with real-time availability, staff operations and revenue analytics.</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass-300">Explore</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Link href="/rooms" className="hover:text-brass-300">Rooms</Link>
                <Link href="/search" className="hover:text-brass-300">Availability</Link>
                <Link href="/dashboard" className="hover:text-brass-300">My stays</Link>
                <Link href="/staff" className="hover:text-brass-300">Staff</Link>
                <Link href="/admin" className="hover:text-brass-300">Admin</Link>
                <Link href="/about" className="hover:text-brass-300">About</Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass-300">Front desk</p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brass-400" /> 12 Residency Road, Bengaluru 560025</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-brass-400" /> +91 80 4000 1200</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-brass-400" /> stay@grandhorizon.in</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 py-4 text-center text-xs text-ivory-50/40">Grand Horizon Hotel · Reservation & Management System</div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
