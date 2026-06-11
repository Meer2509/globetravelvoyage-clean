import Link from "next/link";
import Image from "next/image";
import { Icon } from "./Icon";
import { DISCLAIMER_SHORT } from "@/lib/data";

const navCols = [
  {
    title: "Visa Services",
    links: [
      { label: "AI Visa Assistant", href: "/visa" },
      { label: "USA Visa Guide", href: "/visa/usa" },
      { label: "USA from Pakistan 🇵🇰→🇺🇸", href: "/visa/usa-from-pakistan" },
      { label: "All Countries A–Z", href: "/visa/countries" },
      { label: "Visa Experts Marketplace", href: "/agents" },
      { label: "Visa Intelligence Hub", href: "/visa" },
    ],
  },
  {
    title: "Flights & Transport",
    links: [
      { label: "Compare Flights", href: "/flights" },
      { label: "Gulf → Pakistan routes", href: "/flights" },
      { label: "Gulf → India routes", href: "/flights" },
      { label: "Pakistan → USA/UK", href: "/flights" },
      { label: "Car Rentals", href: "/car-rentals" },
      { label: "Cruises & Yachts", href: "/cruises" },
    ],
  },
  {
    title: "Hotels & Stays",
    links: [
      { label: "Hotels & Resorts", href: "/hotels" },
      { label: "Vacation Rentals", href: "/properties" },
      { label: "Monthly Furnished Apartments", href: "/properties" },
      { label: "Luxury Properties", href: "/properties" },
      { label: "Buy / Sell Properties", href: "/properties" },
    ],
  },
  {
    title: "Experiences & AI",
    links: [
      { label: "Local Tours", href: "/tours" },
      { label: "Attraction Tickets", href: "/tickets" },
      { label: "AI Trip Planner", href: "/trip-planner" },
      { label: "Destination Explorer", href: "/destinations" },
      { label: "Travel Guides", href: "/guides" },
      { label: "Vacation Packages", href: "/agencies" },
    ],
  },
  {
    title: "Join as a partner",
    links: [
      { label: "Become a visa agent", href: "/register?role=agent" },
      { label: "Become a travel agency", href: "/register?role=agency" },
      { label: "Become a tour guide", href: "/register?role=guide" },
      { label: "Become a property host", href: "/register?role=host" },
      { label: "Referral program", href: "/referrals" },
      { label: "Post a property listing", href: "/properties/post" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Register free", href: "/register" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Saved items", href: "/saved" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "Company & Legal",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Legal Disclaimer", href: "/legal/disclaimer" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
    ],
  },
];

const socials = [
  { label: "WhatsApp", icon: "💬", href: "#" },
  { label: "Instagram", icon: "📸", href: "#" },
  { label: "Facebook", icon: "📘", href: "#" },
  { label: "Twitter / X", icon: "🐦", href: "#" },
  { label: "YouTube", icon: "▶️", href: "#" },
  { label: "LinkedIn", icon: "💼", href: "#" },
];

const popularRoutes = [
  { from: "🇦🇪 Dubai", to: "🇵🇰 Lahore", price: "from $145" },
  { from: "🇸🇦 Riyadh", to: "🇵🇰 Karachi", price: "from $170" },
  { from: "🇦🇪 Dubai", to: "🇮🇳 Delhi", price: "from $130" },
  { from: "🇵🇰 Karachi", to: "🇺🇸 New York", price: "from $720" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-navy text-white">
      {/* ── Newsletter bar ── */}
      <div className="border-b border-white/8">
        <div className="container-px py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                ✈️ Travel smarter with free weekly tips
              </h3>
              <p className="mt-1 text-sm text-white/50">
                Visa updates, price drops, new guides and AI travel insights — no spam.
              </p>
            </div>
            <form className="flex gap-2 shrink-0">
              <input
                type="email"
                placeholder="your@email.com"
                className="input-dark w-60 text-sm py-2.5"
              />
              <button type="submit" className="btn-gold shrink-0 px-5 py-2.5 text-sm">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Main footer content ── */}
      <div className="container-px py-16">
        <div className="grid gap-10 lg:grid-cols-[1.8fr_repeat(6,1fr)]">
          {/* Brand column */}
          <div className="max-w-sm">
            <Link href="/" className="inline-block group" aria-label="Globe Travel Voyage">
              <div className="inline-block rounded-2xl bg-white/95 px-4 py-2 shadow-lg group-hover:bg-white transition-colors">
                <Image
                  src="/logo.png"
                  alt="Globe Travel Voyage"
                  width={380}
                  height={100}
                  className="h-[100px] w-auto object-contain"
                  quality={100}
                />
              </div>
            </Link>

            <p className="mt-5 text-sm leading-relaxed text-white/55">
              Your AI Travel Command Center for visas, flights, tours, luxury stays and global journeys — powered by AI and verified human experts worldwide.
            </p>

            {/* Trust badges */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              {[
                { icon: "shield" as const, label: "ID-verified providers" },
                { icon: "check" as const, label: "Authentic reviews" },
                { icon: "sparkles" as const, label: "AI-powered tools" },
                { icon: "globe" as const, label: "190+ countries" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-3 py-2">
                  <Icon name={b.icon} className="h-3.5 w-3.5 text-gold" />
                  <span className="text-xs text-white/55">{b.label}</span>
                </div>
              ))}
            </div>

            {/* Popular routes mini section */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Popular routes</p>
              <div className="space-y-1.5">
                {popularRoutes.map((r) => (
                  <Link
                    key={r.from}
                    href="/flights"
                    className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-xs hover:bg-white/8 transition-colors"
                  >
                    <span className="text-white/60">{r.from} → {r.to}</span>
                    <span className="font-bold text-gold">{r.price}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="mt-6 text-[11px] leading-relaxed text-white/30">
              {DISCLAIMER_SHORT}
            </p>
          </div>

          {/* Link columns */}
          {navCols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/35">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/55 transition-colors hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Social links ── */}
      <div className="border-t border-white/8">
        <div className="container-px py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50 transition-all hover:border-gold/30 hover:text-gold"
                  aria-label={s.label}
                >
                  <span>{s.icon}</span>
                  <span className="hidden sm:block">{s.label}</span>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-white/35">
              <Link href="/legal/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
              <span>·</span>
              <Link href="/legal/terms" className="hover:text-white/60 transition-colors">Terms</Link>
              <span>·</span>
              <Link href="/legal/disclaimer" className="hover:text-white/60 transition-colors">Disclaimer</Link>
              <span>·</span>
              <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/8 bg-black/20">
        <div className="container-px flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/30 sm:flex-row">
          <p>© {new Date().getFullYear()} Globe Travel Voyage. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <Icon name="shield" className="h-3.5 w-3.5 text-gold/60" />
            <span>Independent marketplace · Not a government, embassy or visa authority · No approval guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
