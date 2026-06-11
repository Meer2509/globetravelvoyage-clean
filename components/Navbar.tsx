"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-soft-200 bg-white/98 shadow-[0_4px_24px_-4px_rgba(8,28,58,0.12)] backdrop-blur-xl"
          : "border-b border-white/8 bg-navy/97 backdrop-blur-xl"
      }`}
      onMouseLeave={() => setMegaOpen(null)}
    >
      <div className="container-px flex h-[72px] items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 group" aria-label="Globe Travel Voyage — Home">
          {/* Desktop: full wordmark logo */}
          <Image
            src={scrolled ? "/logo.svg" : "/logo-white.svg"}
            alt="Globe Travel Voyage"
            width={200}
            height={48}
            className="hidden sm:block h-12 w-auto object-contain transition-all duration-300 group-hover:opacity-90"
            priority
          />
          {/* Mobile: icon mark only */}
          <Image
            src="/logo-mark.svg"
            alt="Globe Travel Voyage"
            width={40}
            height={40}
            className="block sm:hidden h-10 w-10 object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <div key={item.href} className="relative" onMouseEnter={() => setMegaOpen(item.label)}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 ${
                    scrolled
                      ? active
                        ? "bg-navy/8 text-navy"
                        : "text-charcoal/70 hover:bg-navy/5 hover:text-navy"
                      : active
                      ? "bg-white/12 text-white"
                      : "text-white/75 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {item.label}
                  <svg viewBox="0 0 16 16" className="h-3 w-3 opacity-50" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </Link>

                {/* Mega dropdown */}
                {megaOpen === item.label && item.sub && (
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-[260px] overflow-hidden rounded-2xl border border-soft-200 bg-white shadow-[0_16px_48px_-8px_rgba(8,28,58,0.18)]">
                    {/* Dropdown header accent */}
                    <div className="h-1 bg-gradient-to-r from-navy via-blue to-gold" />
                    <div className="p-2">
                      {item.sub.map((s) => (
                        <Link
                          key={s.href + s.label}
                          href={s.href}
                          className="group flex items-start gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-soft"
                        >
                          <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/40 transition-colors group-hover:bg-gold" />
                          <div>
                            <span className="block text-sm font-semibold text-navy group-hover:text-blue transition-colors">{s.label}</span>
                            <span className="mt-0.5 block text-xs text-charcoal/55">{s.desc}</span>
                          </div>
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
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/search"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
              scrolled ? "text-charcoal/60 hover:bg-soft hover:text-navy" : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
            title="Search"
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </Link>
          <Link
            href="/login"
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              scrolled
                ? "text-navy/70 hover:bg-navy/5 hover:text-navy"
                : "text-white/75 hover:bg-white/8 hover:text-white"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="btn-gold rounded-xl px-5 py-2.5 text-sm font-bold shadow-[0_2px_12px_rgba(201,162,39,0.30)] hover:shadow-[0_4px_20px_rgba(201,162,39,0.45)] transition-all duration-200"
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
        <div className="border-t border-soft-200 bg-white lg:hidden shadow-lg">
          <div className="container-px py-5">
            <div className="space-y-1">
              {nav.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-navy hover:bg-soft transition-colors"
                  >
                    {item.label}
                  </Link>
                  {item.sub && (
                    <div className="ml-3 mb-2 space-y-0.5 border-l-2 border-gold/20 pl-3">
                      {item.sub.map((s) => (
                        <Link
                          key={s.href + s.label}
                          href={s.href}
                          className="block rounded-xl px-3 py-2 text-xs font-semibold text-charcoal/65 hover:bg-soft hover:text-navy transition-colors"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-soft-200 pt-5">
              <Link href="/login" className="btn-outline py-3 text-sm text-center font-semibold rounded-xl">Log in</Link>
              <Link href="/register" className="btn-gold py-3 text-sm text-center font-bold rounded-xl">Get started</Link>
            </div>
            <div className="mt-3 text-center">
              <Link href="/support" className="text-xs text-charcoal/40 hover:text-navy">Help & Support</Link>
              <span className="mx-2 text-charcoal/20">·</span>
              <Link href="/search" className="text-xs text-charcoal/40 hover:text-navy">Search</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
