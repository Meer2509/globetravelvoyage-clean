"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const nav = [
  {
    label: "Visa",
    href: "/visa",
    sub: [
      { label: "AI Visa Assistant", href: "/visa", desc: "AI guidance for every country" },
      { label: "USA Visa Guide", href: "/visa/usa", desc: "B1/B2, F-1 and more" },
      { label: "USA from Pakistan", href: "/visa/usa-from-pakistan", desc: "Step-by-step PK → USA" },
      { label: "All Countries", href: "/visa/countries", desc: "Browse 190+ countries" },
    ],
  },
  {
    label: "Travel",
    href: "/flights",
    sub: [
      { label: "Flights", href: "/flights", desc: "Compare cheap routes globally" },
      { label: "Hotels & Stays", href: "/hotels", desc: "Hotels, apartments, villas" },
      { label: "Car Rentals", href: "/car-rentals", desc: "Economy to luxury cars" },
      { label: "Cruises & Boats", href: "/cruises", desc: "Ocean, river & private charters" },
      { label: "Local Tours", href: "/tours", desc: "Verified local guide experiences" },
      { label: "Attraction Tickets", href: "/tickets", desc: "Skip-the-line worldwide" },
    ],
  },
  {
    label: "Plan",
    href: "/trip-planner",
    sub: [
      { label: "AI Trip Planner", href: "/trip-planner", desc: "Budget → full itinerary" },
      { label: "AI Visa Assistant", href: "/ai-visa-assistant", desc: "AI-guided visa prep" },
      { label: "AI Flight Finder", href: "/ai-flight-finder", desc: "Best routes by AI" },
      { label: "Destinations", href: "/destinations", desc: "Luxury inspiration" },
      { label: "Properties", href: "/properties", desc: "Rent, buy or list property" },
      { label: "Post a Listing", href: "/properties/post", desc: "List your property" },
    ],
  },
  {
    label: "Experts",
    href: "/agents",
    sub: [
      { label: "Visa Experts", href: "/agents", desc: "Verified visa agents" },
      { label: "Travel Agencies", href: "/agencies", desc: "Curated agency packages" },
      { label: "Referral Program", href: "/referrals", desc: "Earn commissions" },
      { label: "Contact an Expert", href: "/lead/contact", desc: "Send a direct enquiry" },
      { label: "Start Visa Application", href: "/visa/start", desc: "3-step application form" },
    ],
  },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMegaOpen(null);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-soft-200 bg-white/95 shadow-[0_2px_16px_-4px_rgba(8,28,58,0.10)] backdrop-blur-md"
          : "border-b border-white/10 bg-navy/95 backdrop-blur-md"
      }`}
      onMouseLeave={() => setMegaOpen(null)}
    >
      <div className="container-px flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${scrolled ? "bg-navy" : "bg-white/10"}`}>
            <Icon name="globe" className="h-5 w-5 text-gold" />
          </span>
          <span className={`text-lg font-extrabold tracking-tight ${scrolled ? "text-navy" : "text-white"}`}>
            Globe<span className={scrolled ? "text-blue" : "text-blue-light"}>Travel</span>
            <span className="text-gold">Voyage</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <div key={item.href} className="relative" onMouseEnter={() => setMegaOpen(item.label)}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    scrolled
                      ? active
                        ? "bg-soft text-navy"
                        : "text-charcoal hover:bg-soft hover:text-navy"
                      : active
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </Link>

                {/* Mega dropdown */}
                {megaOpen === item.label && item.sub && (
                  <div className="absolute left-0 top-full z-50 mt-1 min-w-[240px] overflow-hidden rounded-2xl border border-soft-200 bg-white shadow-[var(--shadow-premium)]">
                    <div className="p-2">
                      {item.sub.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="flex flex-col rounded-xl px-4 py-3 hover:bg-soft"
                        >
                          <span className="text-sm font-semibold text-navy">{s.label}</span>
                          <span className="mt-0.5 text-xs text-charcoal/70">{s.desc}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/login"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              scrolled ? "text-charcoal hover:bg-soft" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="btn-gold px-5 py-2 text-sm"
          >
            Get started
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl lg:hidden transition-colors ${
            scrolled ? "border border-soft-200 text-navy" : "border border-white/20 text-white"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-soft-200 bg-white lg:hidden">
          <div className="container-px py-4">
            {nav.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-navy hover:bg-soft"
                >
                  {item.label}
                </Link>
                {item.sub && (
                  <div className="ml-4 mb-2 space-y-0.5">
                    {item.sub.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className="block rounded-xl px-3 py-2 text-sm text-charcoal hover:bg-soft"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-soft-200 pt-4">
              <Link href="/login" className="btn-outline py-2.5 text-sm">Log in</Link>
              <Link href="/register" className="btn-gold py-2.5 text-sm">Get started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
