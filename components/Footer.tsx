"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "./Icon";
import { useCatalog } from "@/lib/catalog/context";
import { submitLeadRequest } from "@/lib/supabase/actions";
import { SITE_CONFIG, FORM_SUBMIT_SUCCESS_MESSAGE, FORM_SUBMIT_ERROR_MESSAGE, supportMailto } from "@/lib/site-config";

const navCols = [
  {
    title: "Visa Services",
    links: [
      { label: "Services & Pricing", href: "/services" },
      { label: "AI Visa Assistant", href: "/visa" },
      { label: "USA Visa Guide", href: "/visa/usa" },
      { label: "USA from Pakistan 🇵🇰→🇺🇸", href: "/visa/usa-from-pakistan" },
      { label: "All Countries A–Z", href: "/visa/countries" },
      { label: "AI Travel Concierge", href: "/concierge" },
      { label: "Travel Agents Marketplace", href: "/travel-agents" },
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
      { label: "AI Travel Concierge", href: "/concierge" },
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
      { label: SITE_CONFIG.supportEmail, href: supportMailto },
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
      { label: "Customer Terms", href: "/legal/customer-terms" },
      { label: "Provider Terms", href: "/legal/provider-terms" },
      { label: "Refund Policy", href: "/legal/refund" },
      { label: "Cancellation Policy", href: "/legal/cancellation" },
      { label: "Cookie Policy", href: "/legal/cookies" },
      { label: "Payment Terms", href: "/legal/payment-terms" },
    ],
  },
];

const socials = [
  { label: "WhatsApp", icon: "💬", href: "/contact" },
  { label: "Instagram", icon: "📸", href: "/contact" },
  { label: "Facebook", icon: "📘", href: "/contact" },
  { label: "Twitter / X", icon: "🐦", href: "/contact" },
  { label: "YouTube", icon: "▶️", href: "/contact" },
  { label: "LinkedIn", icon: "💼", href: "/contact" },
];

const popularRoutes = [
  { from: "🇦🇪 Dubai", to: "🇵🇰 Lahore", price: "from $145" },
  { from: "🇸🇦 Riyadh", to: "🇵🇰 Karachi", price: "from $170" },
  { from: "🇦🇪 Dubai", to: "🇮🇳 Delhi", price: "from $130" },
  { from: "🇵🇰 Karachi", to: "🇺🇸 New York", price: "from $720" },
];

function NewsletterBar() {
  const [email, setEmail]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }
    setError("");
    setLoading(true);
    const result = await submitLeadRequest({
      name: "Newsletter subscriber",
      email,
      leadType: "newsletter",
      message: "Footer newsletter signup",
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setSubmitted(true);
  }

  return (
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
          {submitted ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm text-emerald-300">
              <span className="text-lg">✅</span>
              <p>{FORM_SUBMIT_SUCCESS_MESSAGE}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 shrink-0">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="your@email.com"
                  className="input-dark w-60 text-sm py-2.5"
                  required
                />
                <button type="submit" disabled={loading} className="btn-gold shrink-0 px-5 py-2.5 text-sm disabled:opacity-70">
                  {loading ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                    </svg>
                  ) : "Subscribe"}
                </button>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const { disclaimerShort } = useCatalog();
  return (
    <footer className="mt-auto bg-navy text-white">
      <NewsletterBar />

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

            <p className="mt-4 text-sm text-white/55">
              Support:{" "}
              <a href={supportMailto} className="font-semibold text-gold hover:underline">
                {SITE_CONFIG.supportEmail}
              </a>
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
                {popularRoutes.map((r, index) => (
                  <Link
                    key={`${r.from}-${r.to}-${index}`}
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
              {disclaimerShort}
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
