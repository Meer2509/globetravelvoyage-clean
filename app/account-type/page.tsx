"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/AuthLayout";

type AccountType = "customer" | "agent" | "agency" | "guide" | "host";

const types: {
  key: AccountType;
  emoji: string;
  label: string;
  tagline: string;
  benefits: string[];
  cta: string;
  href: string;
  badge?: string;
}[] = [
  {
    key: "customer",
    emoji: "🧳",
    label: "Traveler",
    tagline: "Plan, book and explore the world",
    benefits: [
      "AI-powered trip planner & visa guide",
      "Track bookings, visas & documents",
      "Connect with verified travel experts",
      "Earn referral rewards",
    ],
    cta: "Join as Traveler",
    href: "/register?type=customer",
  },
  {
    key: "agent",
    emoji: "👔",
    label: "Visa Expert",
    tagline: "Offer professional visa preparation services",
    benefits: [
      "Create a verified expert profile",
      "Receive visa prep service leads",
      "Manage client applications & docs",
      "Generate authorization form templates",
    ],
    cta: "Join as Visa Expert",
    href: "/register?type=agent",
    badge: "Earn from clients",
  },
  {
    key: "agency",
    emoji: "🏢",
    label: "Travel Agency",
    tagline: "List packages, tours and grow your bookings",
    benefits: [
      "Publish tour packages & tickets",
      "Manage leads and bookings",
      "Get a verification badge",
      "Access agency analytics dashboard",
    ],
    cta: "Join as Travel Agency",
    href: "/register?type=agency",
    badge: "Business verified",
  },
  {
    key: "guide",
    emoji: "🧭",
    label: "Tour Guide",
    tagline: "Showcase your local expertise globally",
    benefits: [
      "List guided tours & experiences",
      "Set availability & pricing",
      "Receive booking requests",
      "Build your 5-star review profile",
    ],
    cta: "Join as Tour Guide",
    href: "/register?type=guide",
  },
  {
    key: "host",
    emoji: "🏠",
    label: "Property Host",
    tagline: "Earn from your property with global travelers",
    benefits: [
      "List rentals, vacation homes & apartments",
      "Manage short and long-term stays",
      "Receive buy/sell & rental leads",
      "Verified host badge",
    ],
    cta: "Join as Property Host",
    href: "/register?type=host",
  },
];

export default function AccountTypePage() {
  const [hovered, setHovered] = useState<AccountType | null>(null);

  return (
    <AuthLayout
      eyebrow="Choose your path"
      headline="How will you use Globe Travel Voyage?"
      subline="Select the account type that matches your role. You can always add more later."
    >
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Choose account type</h1>
          <p className="mt-1.5 text-sm text-charcoal/60">
            Select how you want to use Globe Travel Voyage.
          </p>
        </div>

        <div className="space-y-3">
          {types.map((type) => (
            <div
              key={type.key}
              onMouseEnter={() => setHovered(type.key)}
              onMouseLeave={() => setHovered(null)}
              className={`relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer group ${
                hovered === type.key
                  ? "border-blue bg-blue/5 shadow-md"
                  : "border-soft-200 hover:border-navy/20"
              }`}
            >
              {type.badge && (
                <span className="absolute right-4 top-4 rounded-full bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold text-gold">
                  {type.badge}
                </span>
              )}

              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-all ${
                  hovered === type.key ? "bg-navy" : "bg-soft"
                }`}>
                  {type.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-navy text-sm">{type.label}</h3>
                  </div>
                  <p className="text-xs text-charcoal/55 mt-0.5">{type.tagline}</p>

                  <ul className={`mt-2 space-y-1 overflow-hidden transition-all duration-300 ${
                    hovered === type.key ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}>
                    {type.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-1.5 text-xs text-charcoal/65">
                        <span className="text-blue">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href={type.href}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
                  hovered === type.key
                    ? "bg-navy text-white opacity-100"
                    : "bg-soft text-navy opacity-0 group-hover:opacity-100"
                }`}
              >
                {type.emoji} {type.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-charcoal/55">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-blue hover:underline">
            Sign in
          </Link>
        </p>

        <p className="mt-3 text-center text-xs text-charcoal/35">
          Not sure? Start as a Traveler — you can upgrade your account anytime.
        </p>
      </div>
    </AuthLayout>
  );
}
