"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { ContactModal } from "@/components/ContactModal";
import { fetchMarketplaceExperts, type MarketplaceExpertRow } from "@/lib/supabase/mvp-queries";
import { isSupabaseConfigured } from "@/lib/auth";

type AgentCard = {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  cases: number;
  initials: string;
  location: string;
  responseTime: string;
};

function mapExpert(e: MarketplaceExpertRow): AgentCard {
  const name = e.full_name ?? e.email.split("@")[0];
  const specialties = (e.services ?? []).slice(0, 4).map((s) => s.replace(/^[^:]+:/, "").trim() || s);
  return {
    id: e.id,
    name,
    title: e.bio?.slice(0, 60) ?? "Visa preparation expert",
    specialties: specialties.length ? specialties : ["Visa preparation"],
    rating: 0,
    reviews: 0,
    verified: e.is_verified,
    cases: 0,
    initials: name.slice(0, 2).toUpperCase(),
    location: [e.city, e.country].filter(Boolean).join(", ") || "—",
    responseTime: "—",
  };
}

export function VisaAgentsSection() {
  const [agents, setAgents] = useState<AgentCard[]>([]);
  const [modal, setModal] = useState<{ open: boolean; agent: AgentCard | null }>({
    open: false,
    agent: null,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchMarketplaceExperts().then((rows) => {
      setAgents(rows.map(mapExpert));
    });
  }, []);

  if (agents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-soft-200 bg-white py-12 text-center">
        <p className="text-3xl mb-3">👔</p>
        <p className="font-bold text-navy">Visa experts joining the marketplace</p>
        <p className="mt-2 text-sm text-muted max-w-md mx-auto">
          Verified agents appear here after admin review. Browse premium visa services or request expert help today.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/services#premium" className="btn-primary px-5 py-2.5 text-sm">
            Premium visa services
          </Link>
          <Link href="/agents" className="btn-outline px-5 py-2.5 text-sm">
            View experts directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {agents.slice(0, 4).map((a) => (
          <MarketplaceCard
            key={a.id}
            id={a.id}
            initials={a.initials}
            name={a.name}
            subtitle={a.title}
            rating={a.rating}
            reviews={a.reviews}
            verified={a.verified}
            tags={a.specialties}
            meta={a.location}
            responseTime={a.responseTime}
            ctaLabel="Contact expert"
            onContact={() => setModal({ open: true, agent: a })}
          />
        ))}
      </div>
      <ContactModal
        open={modal.open}
        onClose={() => setModal({ open: false, agent: null })}
        mode="contact_expert"
        subjectName={modal.agent?.name}
        subjectMeta={modal.agent ? `${modal.agent.specialties[0]} · ${modal.agent.location}` : undefined}
      />
    </>
  );
}
