import Link from "next/link";
import type { Metadata } from "next";
import { AgentGroupToursPanel } from "@/components/group-tours/AgentGroupToursPanel";
import { fetchMyGroupTours, fetchMyGroupTourRequests } from "@/lib/supabase/group-tour-actions";
import { fetchMyTravelAgentProfile } from "@/lib/supabase/travel-agent-actions";

export const metadata: Metadata = {
  title: "Group Tours — Agent Dashboard",
  robots: { index: false, follow: false },
};

export default async function AgentGroupToursPage() {
  const [{ tours, error: toursError }, { rows: requests }, { profile, error: profileError }] =
    await Promise.all([
      fetchMyGroupTours(),
      fetchMyGroupTourRequests(),
      fetchMyTravelAgentProfile(),
    ]);

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/agent" className="text-xs font-semibold text-blue hover:underline">← Agent dashboard</Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Group tours</h1>
          <p className="mt-1 text-sm text-muted">Create departures, manage itineraries, and receive join requests.</p>
          {profile && (
            <p className="mt-2 text-xs text-charcoal/50">
              Profile: {profile.full_name} · {profile.verification_status}
            </p>
          )}
        </div>
      </div>
      <div className="container-px py-8">
        {(toursError || profileError) && (
          <p className="mb-4 text-sm text-red-600">{toursError ?? profileError}</p>
        )}
        <AgentGroupToursPanel
          initialTours={tours}
          requests={requests}
          profileError={!profile ? "Create your travel agent profile to list group tours." : undefined}
        />
      </div>
    </div>
  );
}
