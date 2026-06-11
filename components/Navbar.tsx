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
      { label: "AI Visa Assistant",    href: "/visa",                   desc: "AI guidance for every country" },
      { label: "USA Visa Guide",       href: "/visa/usa",               desc: "B1/B2, F-1 and more" },
      { label: "USA from Pakistan",    href: "/visa/usa-from-pakistan", desc: "Step-by-step PK → USA" },
      { label: "All Countries A–Z",   href: "/visa/countries",         desc: "Browse 190+ countries" },
      { label: "Start Application",   href: "/visa/start",             desc: "3-step visa lead form" },
    ],
  },
  {
    label: "Travel",
    href: "/flights",
    sub: [
      { label: "Flights",             href: "/flights",     desc: "Compare routes globally" },
      { label: "Hotels & Stays",      href: "/hotels",      desc: "Hotels, apartments, villas" },
      { label: "Car Rentals",         href: "/car-rentals", desc: "Economy to luxury cars" },
      { label: "Cruises & Boats",     href: "/cruises",     desc: "Ocean, river & yacht charters" },
      { label: "Local Tours",         href: "/tours",       desc: "Verified guide experiences" },
      { label: "Attraction Tickets",  href: "/tickets",     desc: "Skip-the-line worldwide" },
    ],
  },
  {
    label: "Plan",
    href: "/trip-planner",
    sub: [
      { label: "AI Trip Planner",     href: "/trip-planner",      desc: "Budget → full itinerary" },
      { label: "AI Visa Assistant",   href: "/ai-visa-assistant",  desc: "AI-guided visa prep" },
      { label: "AI Flight Finder",    href: "/ai-flight-finder",   desc: "Best routes by AI" },
      { label: "Properties",          href: "/properties",         desc: "Rent, buy or list property" },
      { label: "Post a Listing",      href: "/properties/post",    desc: "List your property" },
    ],
  },
  {
    label: "Experts",
    href: "/agents",
    sub: [
      { label: "Visa Experts",         href: "/agents",       desc: "Verified visa agents" },
      { label: "Travel Agencies",      href: "/agencies",     desc: "Curated agency packages" },
      { label: "Contact an Expert",    href: "/lead/contact", desc: "Send a direct enquiry" },
      { label: "Referral Program",     href: "/referrals",    desc: "Earn commissions" },
    ],
  },
];

export function Navbar() {
  const [open, setOpen]         = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [shadow, setShadow]     = useState(false);
  const pathname                = usePathname();

  // Only add shadow on scroll — background stays white always
  useEffect(() => {
    const handler = () => setShadow(window.scrollY > 4);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMegaOpen(null);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        shadow ? "shadow-[0_2px_20px_-4px_rgba(8,28,58,0.14)]" : "border-b border-soft-200"
      }`}
      onMouseLeave={() => setMegaOpen(null)}
    >
      {/* ── Main bar ── */}
      <div className="container-px flex items-center justify-between gap-4 py-2 lg:py-0 lg:h-[95px]">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="shrink-0 group"
          aria-label="Globe Travel Voyage — Home"
        >
          {/* Desktop */}
          <Image
            src="/logo.png"
            alt="Globe Travel Voyage"
            width={380}
            height={88}
            className="hidden lg:block h-[88px] w-auto object-contain transition-opacity duration-200 group-hover:opacity-85"
            priority
            quality={100}
          />
          {/* Mobile / tablet */}
          <Image
            src="/logo.png"
            alt="Globe Travel Voyage"
            width={220}
            height={60}
            className="block lg:hidden h-[60px] w-auto object-contain transition-opacity duration-200 group-hover:opacity-85"
            priority
            quality={100}
          />
        </Link>

        {/* ── Desktop nav (centered) ── */}
        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setMegaOpen(item.label)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wide transition-all duration-150 ${
                    active
                      ? "bg-navy/6 text-navy"
                      : "text-charcoal/65 hover:bg-navy/4 hover:text-navy"
                  }`}
                >
                  {item.label}
                  <svg
                    viewBox="0 0 16 16"
                    className={`h-3 w-3 transition-transform duration-150 ${megaOpen === item.label ? "rotate-180" : ""} opacity-40`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </Link>

                {/* Dropdown */}
                {megaOpen === item.label && (
                  <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[260px] overflow-hidden rounded-2xl border border-soft-200 bg-white shadow-[0_20px_60px_-10px_rgba(8,28,58,0.20)]">
                    <div className="h-0.5 bg-gradient-to-r from-navy via-blue to-gold" />
                    <div className="p-2">
                      {item.sub.map((s) => (
                        <Link
                          key={s.href + s.label}
                          href={s.href}
                          className="group/item flex items-start gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-soft"
                        >
                          <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold/35 transition-colors group-hover/item:bg-gold" />
                          <div>
                            <span className="block text-sm font-semibold text-navy transition-colors group-hover/item:text-blue">
                              {s.label}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-charcoal/50">
                              {s.desc}
                            </span>
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

        {/* ── Desktop actions ── */}
        <div className="hidden items-center gap-3 lg:flex shrink-0">
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-charcoal/50 transition-colors hover:bg-soft hover:text-navy"
            title="Search"
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-charcoal/65 transition-all duration-150 hover:bg-navy/5 hover:text-navy"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="btn-gold rounded-xl px-6 py-3 text-sm font-bold shadow-[0_2px_16px_rgba(201,162,39,0.28)] transition-all duration-200 hover:shadow-[0_4px_24px_rgba(201,162,39,0.42)]"
          >
            Get started
          </Link>
        </div>

        {/* ── Mobile burger ── */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-soft-200 text-navy transition-colors hover:bg-soft lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            {open
              ? <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>
              : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>
            }
          </svg>
        </button>
      </div>

      {/* ── Mobile menu drawer ── */}
      {open && (
        <div className="fixed inset-0 top-0 z-40 flex flex-col bg-white lg:hidden">
          {/* Drawer top bar */}
          <div className="flex items-center justify-between border-b border-soft-200 px-5 py-4">
            <Link href="/" onClick={() => setOpen(false)}>
              <Image
                src="/logo.png"
                alt="Globe Travel Voyage"
                width={220}
                height={60}
                className="h-[60px] w-auto object-contain"
                priority
                quality={100}
              />
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-soft-200 text-navy hover:bg-soft"
              aria-label="Close menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Drawer nav */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-1">
              {nav.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center rounded-xl px-4 py-3 text-base font-bold text-navy transition-colors hover:bg-soft"
                  >
                    {item.label}
                  </Link>
                  {item.sub && (
                    <div className="ml-4 mb-3 space-y-0.5 border-l-2 border-gold/25 pl-4">
                      {item.sub.map((s) => (
                        <Link
                          key={s.href + s.label}
                          href={s.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-xl px-3 py-2 text-sm font-medium text-charcoal/60 transition-colors hover:bg-soft hover:text-navy"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Drawer footer CTAs */}
          <div className="border-t border-soft-200 px-5 py-5 space-y-3">
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="btn-gold block w-full py-3.5 text-center text-base font-bold rounded-xl"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="btn-outline block w-full py-3.5 text-center text-base font-semibold rounded-xl"
            >
              Log in
            </Link>
            <div className="flex justify-center gap-6 pt-1">
              <Link href="/support" onClick={() => setOpen(false)} className="text-xs text-charcoal/40 hover:text-navy">Support</Link>
              <Link href="/search"  onClick={() => setOpen(false)} className="text-xs text-charcoal/40 hover:text-navy">Search</Link>
              <Link href="/legal/disclaimer" onClick={() => setOpen(false)} className="text-xs text-charcoal/40 hover:text-navy">Legal</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
