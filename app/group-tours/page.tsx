import Link from "next/link";
import type { Metadata } from "next";
import { GroupToursCatalog } from "@/components/group-tours/GroupToursCatalog";
import { CTASection } from "@/components/CTASection";
import { fetchPublicGroupTours } from "@/lib/supabase/group-tour-actions";

export const metadata: Metadata = {
  title: "Group Tours — Globe Travel Voyage",
  description: "Browse verified group tours and premium guided departures from travel agents worldwide.",
};

export default async function GroupToursPage() {
  const tours = await fetchPublicGroupTours();

  return (
    <>
      <div className="bg-hero-gradient py-14">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-dark hover:text-white transition-colors">
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Marketplace</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Group tours</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-dark">
            Premium guided departures from verified travel agents. Request to join — pay later when your spot is confirmed.
          </p>
        </div>
      </div>

      <GroupToursCatalog tours={tours} />

      <CTASection
        title="List your group tour"
        subtitle="Verified travel agents can create departures, set itineraries, and receive join requests."
        primary={{ label: "Agent dashboard", href: "/dashboard/agent/group-tours" }}
        secondary={{ label: "Become a travel agent", href: "/register?role=agent" }}
      />
    </>
  );
}
