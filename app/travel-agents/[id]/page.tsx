import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Stars } from "@/components/Stars";
import { Disclaimer } from "@/components/Disclaimer";
import { MessageProviderButton } from "@/components/messaging/MessageProviderButton";
import { ReviewForm, ReviewList } from "@/components/reviews/ReviewPanel";
import { TravelAgentInquiryForm } from "@/components/travel-agents/TravelAgentInquiryForm";
import {
  fetchVerifiedTravelAgentById,
  fetchTravelAgentServices,
} from "@/lib/supabase/travel-agent-actions";
import { fetchReviewsForTarget } from "@/lib/supabase/review-actions";
import { fetchPublicTrustProfile } from "@/lib/trust/verification-actions";
import { PublicTrustProfileCard } from "@/components/trust/PublicTrustProfileCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agent = await fetchVerifiedTravelAgentById(id);
  if (!agent) return { title: "Travel agent not found" };
  return {
    title: `${agent.full_name} — Travel Agent`,
    description: agent.bio ?? `Verified travel agent ${agent.full_name} on Globe Travel Voyage.`,
  };
}

export default async function TravelAgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [agent, services, reviews] = await Promise.all([
    fetchVerifiedTravelAgentById(id),
    fetchTravelAgentServices(id),
    fetchReviewsForTarget("travel_agent", id),
  ]);

  if (!agent) notFound();

  const trustProfile = await fetchPublicTrustProfile(agent.user_id);

  const displayName = agent.agency_name
    ? `${agent.full_name} · ${agent.agency_name}`
    : agent.full_name;

  return (
    <div className="min-h-screen bg-soft/50">
      <div className="bg-hero-gradient py-10">
        <div className="container-px">
          <Link href="/travel-agents" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80">
            ← All travel agents
          </Link>
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white">
              {agent.full_name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              {agent.featured && <span className="eyebrow-white mb-2">Featured agent</span>}
              <h1 className="text-3xl font-extrabold text-white">{agent.full_name}</h1>
              {agent.agency_name && <p className="text-white/70">{agent.agency_name}</p>}
              <div className="mt-2 flex items-center gap-2">
                <Stars rating={agent.rating ?? 0} />
                <span className="text-sm text-white/60">({agent.review_count ?? 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {trustProfile && <PublicTrustProfileCard profile={trustProfile} />}

            {agent.bio && (
              <div className="card p-6">
                <h2 className="font-bold text-navy mb-2">About</h2>
                <p className="text-sm text-charcoal/65 leading-relaxed whitespace-pre-wrap">{agent.bio}</p>
              </div>
            )}

            <div className="card p-6">
              <h2 className="font-bold text-navy mb-3">Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {agent.specialties.map((s) => (
                  <span key={s} className="chip text-xs">{s}</span>
                ))}
                {agent.specialties.length === 0 && <p className="text-sm text-muted">—</p>}
              </div>
              <div className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
                <p>🌍 {agent.countries_served.join(", ") || "Global"}</p>
                <p>🗣 {agent.languages.join(", ") || "—"}</p>
                {agent.years_experience != null && <p>📅 {agent.years_experience}+ years experience</p>}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-navy mb-4">Services</h2>
              {services.length === 0 ? (
                <p className="text-sm text-muted">Contact for a custom quote.</p>
              ) : (
                <div className="space-y-3">
                  {services.map((s) => (
                    <div key={s.id} className="rounded-xl border border-soft-200 p-4">
                      <p className="font-bold text-navy">{s.title}</p>
                      {s.description && <p className="mt-1 text-sm text-muted">{s.description}</p>}
                      {s.price != null && (
                        <p className="mt-2 text-sm font-semibold text-navy">
                          From ${s.price.toLocaleString()} {s.price_unit !== "quote" ? `/ ${s.price_unit}` : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-navy mb-4">Reviews</h2>
              <ReviewList reviews={reviews} />
              <div className="mt-6 border-t border-soft-200 pt-6">
                <ReviewForm
                  targetType="travel_agent"
                  targetId={agent.id}
                  targetName={agent.full_name}
                />
              </div>
            </div>

            <Disclaimer variant="compact" />
          </div>

          <div className="space-y-4">
            <div className="card sticky top-24 space-y-4 p-6">
              <MessageProviderButton providerUserId={agent.user_id} providerName={agent.full_name} />
              <TravelAgentInquiryForm
                profileId={agent.id}
                agentName={displayName}
                services={services}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
