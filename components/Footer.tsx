import Link from "next/link";
import { Icon } from "./Icon";
import { DISCLAIMER_SHORT } from "@/lib/data";

const cols = [
  {
    title: "Visa Services",
    links: [
      { label: "AI Visa Assistant", href: "/visa" },
      { label: "USA Visa Guide", href: "/visa/usa" },
      { label: "USA from Pakistan", href: "/visa/usa-from-pakistan" },
      { label: "All Countries", href: "/visa/countries" },
      { label: "Visa Experts", href: "/agents" },
    ],
  },
  {
    title: "Travel & Stays",
    links: [
      { label: "Flights", href: "/flights" },
      { label: "Hotels & Stays", href: "/hotels" },
      { label: "Car Rentals", href: "/car-rentals" },
      { label: "Cruises & Boats", href: "/cruises" },
      { label: "Local Tours", href: "/tours" },
      { label: "Attraction Tickets", href: "/tickets" },
    ],
  },
  {
    title: "Plan & Discover",
    links: [
      { label: "AI Trip Planner", href: "/trip-planner" },
      { label: "Destinations", href: "/destinations" },
      { label: "Travel Guides", href: "/guides" },
      { label: "Properties", href: "/properties" },
      { label: "Referral Program", href: "/referrals" },
    ],
  },
  {
    title: "Marketplace",
    links: [
      { label: "Verified Agencies", href: "/agencies" },
      { label: "Visa Agents", href: "/agents" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Log in", href: "/login" },
      { label: "Register", href: "/register" },
    ],
  },
  {
    title: "Company & Legal",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Disclaimer", href: "/legal/disclaimer" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-soft-200 bg-navy text-white">
      {/* Main footer */}
      <div className="container-px py-16">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_repeat(5,1fr)]">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-gold">
                <Icon name="globe" className="h-5 w-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                Globe<span className="text-blue-light">Travel</span>
                <span className="text-gold">Voyage</span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              Your AI Travel Command Center for visas, flights, tours, luxury
              stays and global journeys — powered by AI and verified human experts.
            </p>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-2 gap-2">
              {[
                { icon: "shield" as const, label: "Verified providers" },
                { icon: "check" as const, label: "Transparent reviews" },
                { icon: "sparkles" as const, label: "AI-powered" },
                { icon: "globe" as const, label: "190+ countries" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-3 py-2">
                  <Icon name={b.icon} className="h-3.5 w-3.5 text-gold" />
                  <span className="text-xs text-white/60">{b.label}</span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs leading-relaxed text-white/35">
              {DISCLAIMER_SHORT}
            </p>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/60 transition-colors hover:text-gold"
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

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="container-px flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Globe Travel Voyage. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <Icon name="shield" className="h-3.5 w-3.5 text-gold/70" />
            Independent marketplace · Not a government, embassy or visa authority
          </p>
        </div>
      </div>
    </footer>
  );
}
