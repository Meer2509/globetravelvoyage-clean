import Link from "next/link";
import type { Metadata } from "next";
import { PROVIDER_LANDING_PAGES } from "@/lib/provider-acquisition/landing-config";

const PROGRAMS = [
  PROVIDER_LANDING_PAGES["travel-agent"],
  PROVIDER_LANDING_PAGES["visa-expert"],
  PROVIDER_LANDING_PAGES["property-host"],
  PROVIDER_LANDING_PAGES["tour-organizer"],
];

export const metadata: Metadata = {
  title: "Become a Travel Provider",
  description:
    "Join Globe Travel Voyage as a travel agent, visa expert, property host, or tour organizer. Grow your business on our AI-powered marketplace.",
};

export default function ProvidersHubPage() {
  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient py-16">
        <div className="container-px text-center">
          <span className="eyebrow-white mb-3">Provider acquisition</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Join the Globe Travel Voyage marketplace</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/65">
            List services, receive verified traveler inquiries, and grow your business globally. Choose your provider type to get started.
          </p>
        </div>
      </div>

      <div className="container-px py-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {PROGRAMS.map((p) => (
            <Link
              key={p.slug}
              href={`/providers/${p.slug}`}
              className="card group p-6 transition-shadow hover:shadow-[var(--shadow-premium)]"
            >
              <span className="text-4xl">{p.emoji}</span>
              <h2 className="mt-3 text-lg font-extrabold text-navy group-hover:text-blue">{p.eyebrow}</h2>
              <p className="mt-2 text-sm text-charcoal/55 line-clamp-2">{p.subtitle}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-gold">Learn more →</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/referrals" className="text-sm font-semibold text-blue hover:underline">
            Refer a provider and earn rewards →
          </Link>
        </div>
      </div>
    </div>
  );
}
