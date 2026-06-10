import Link from "next/link";
import { Icon } from "./Icon";
import { DISCLAIMER_SHORT } from "@/lib/data";

const cols = [
  {
    title: "Explore",
    links: [
      { label: "Visa Marketplace", href: "/visa" },
      { label: "Flights", href: "/flights" },
      { label: "Hotels & Stays", href: "/hotels" },
      { label: "Car Rentals", href: "/car-rentals" },
      { label: "Cruises & Boats", href: "/cruises" },
      { label: "Tours & Tickets", href: "/tours" },
    ],
  },
  {
    title: "Plan & Earn",
    links: [
      { label: "AI Trip Planner", href: "/trip-planner" },
      { label: "Properties", href: "/properties" },
      { label: "Referral Program", href: "/referrals" },
      { label: "Verified Agencies", href: "/agencies" },
      { label: "Verified Agents", href: "/agents" },
    ],
  },
  {
    title: "Accounts",
    links: [
      { label: "Traveler Dashboard", href: "/dashboard/customer" },
      { label: "Agent Dashboard", href: "/dashboard/agent" },
      { label: "Agency Dashboard", href: "/dashboard/agency" },
      { label: "Admin Console", href: "/dashboard/admin" },
      { label: "Log in", href: "/login" },
    ],
  },
  {
    title: "Company",
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
      <div className="container-px py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-gold">
                <Icon name="globe" className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                Globe<span className="text-blue-light">Travel</span>
                <span className="text-gold">Voyage</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              Your AI Travel Command Center for visas, flights, tours, rentals and
              global journeys — powered by AI and verified human experts.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-white/45">
              {DISCLAIMER_SHORT}
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Globe Travel Voyage. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <Icon name="shield" className="h-4 w-4 text-gold" />
            Independent marketplace · Not a government or visa authority
          </p>
        </div>
      </div>
    </footer>
  );
}
