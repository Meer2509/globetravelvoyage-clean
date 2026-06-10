"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const nav = [
  { label: "Visa", href: "/visa" },
  { label: "Flights", href: "/flights" },
  { label: "Hotels", href: "/hotels" },
  { label: "Cars", href: "/car-rentals" },
  { label: "Cruises", href: "/cruises" },
  { label: "Tours", href: "/tours" },
  { label: "Trip Planner", href: "/trip-planner" },
  { label: "Properties", href: "/properties" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-soft-200 bg-white/85 backdrop-blur-md">
      <div className="container-px flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-gold">
            <Icon name="globe" className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-navy">
            Globe<span className="text-blue">Travel</span>
            <span className="text-gold">Voyage</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-soft text-navy" : "text-navy/70 hover:bg-soft hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login" className="btn-ghost px-4 py-2 text-sm">
            Log in
          </Link>
          <Link href="/register" className="btn-primary px-5 py-2 text-sm">
            Get started
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-soft-200 text-navy lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-soft-200 bg-white lg:hidden">
          <div className="container-px grid gap-1 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-navy/80 hover:bg-soft"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setOpen(false)} className="btn-outline py-2.5 text-sm">
                Log in
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="btn-primary py-2.5 text-sm">
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
