import Link from "next/link";
import type { Metadata } from "next";
import { TravelAgentsCatalog } from "@/components/travel-agents/TravelAgentsCatalog";
import { ProviderOnboardingCta } from "@/components/ProviderOnboardingCta";
import { CTASection } from "@/components/CTASection";
import { fetchVerifiedTravelAgents } from "@/lib/supabase/travel-agent-actions";

export const metadata: Metadata = {
  title: "Travel Agents — Globe Travel Voyage",
  description: "Browse verified travel agents for visas, flights, tours, and custom itineraries.",
};

export default async function TravelAgentsPage() {
  const agents = await fetchVerifiedTravelAgents();

  return (
    <>
      <div className="bg-hero-gradient py-14">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-dark hover:text-white transition-colors">
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Marketplace</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Verified travel agents</h1>
          <p className="mt-2 text-muted-dark text-sm max-w-2xl">
            Connect with real travel agents for visas, flights, luxury tours, and custom itineraries. Every profile is reviewed by our admin team.
          </p>
        </div>
      </div>

      <TravelAgentsCatalog agents={agents} />

      <section className="section-sm bg-soft/50">
        <div className="container-px max-w-4xl">
          <ProviderOnboardingCta compact />
        </div>
      </section>

      <CTASection
        title="Become a verified travel agent"
        subtitle="Create your profile, list services, and receive inquiries from travelers worldwide."
        primary={{ label: "Join as travel agent", href: "/register?role=agent" }}
        secondary={{ label: "Agent dashboard", href: "/dashboard/agent/marketplace" }}
      />
    </>
  );
}
