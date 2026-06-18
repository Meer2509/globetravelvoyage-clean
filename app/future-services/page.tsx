import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { FUTURE_SERVICES } from "@/lib/future-services";
import { CONCIERGE_PATH } from "@/lib/v3/concierge-config";

export const metadata: Metadata = {
  title: "Additional Travel Services — Globe Travel Voyage",
  description:
    "Hotels, cruises, car rentals, local tours, tickets, and travel insurance — request through our AI concierge or verified providers.",
};

export default function FutureServicesPage() {
  return (
    <div className="min-h-screen bg-soft/40">
      <div className="bg-hero-gradient py-14">
        <div className="container-px max-w-3xl">
          <Link href="/" className="mb-4 inline-flex text-xs text-white/50 hover:text-white/80">
            ← Home
          </Link>
          <span className="eyebrow-white">Roadmap</span>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Additional travel services
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Our live marketplaces cover AI concierge, visas, flights, properties, travel agents, group tours, and community.
            The categories below are available through concierge requests and verified partner onboarding.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={CONCIERGE_PATH} className="btn-gold px-6 py-3 text-sm">
              Ask AI Concierge
            </Link>
            <Link href="/#marketplaces" className="btn border border-white/20 px-6 py-3 text-sm text-white hover:bg-white/10">
              Live marketplaces
            </Link>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container-px max-w-4xl">
          <SectionHeader
            eyebrow="Request access"
            title="Specialist booking & partner onboarding"
            subtitle="No static catalog pricing — every request is reviewed with a verified provider."
            center
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FUTURE_SERVICES.map((item) => (
              <div
                key={item.id}
                id={item.id}
                className="scroll-mt-28 rounded-2xl border border-soft-200 bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <span className="text-3xl">{item.emoji}</span>
                <h2 className="mt-3 text-lg font-extrabold text-navy">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{item.description}</p>
                <Link href={item.href} className="mt-4 inline-flex text-sm font-semibold text-blue hover:underline">
                  Request via concierge →
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-xs text-charcoal/50">
            Are you a licensed provider?{" "}
            <Link href="/register" className="font-semibold text-navy hover:underline">
              Join as a verified partner
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
