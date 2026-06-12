"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { FilterBar } from "@/components/FilterBar";
import { TrustBadge } from "@/components/TrustBadge";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { trustItems } from "@/lib/data";
import { fetchMarketplaceExperts, type MarketplaceExpertRow } from "@/lib/supabase/mvp-queries";
import { isSupabaseConfigured } from "@/lib/auth";

type AgentCard = {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  countries: string[];
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
    countries: e.country ? [e.country] : [],
    rating: 0,
    reviews: 0,
    verified: e.is_verified,
    cases: 0,
    initials: name.slice(0, 2).toUpperCase(),
    location: [e.city, e.country].filter(Boolean).join(", ") || "—",
    responseTime: "—",
  };
}

export default function AgentsPage() {
  const [modal, setModal] = useState<{ open: boolean; agent: AgentCard | null }>({ open: false, agent: null });
  const [search, setSearch] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showSaved, setShowSaved] = useState(false);
  const [agentList, setAgentList] = useState<AgentCard[]>([]);
  const [usingLive, setUsingLive] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchMarketplaceExperts().then((rows) => {
      if (rows.length > 0) {
        setAgentList(rows.map(mapExpert));
        setUsingLive(true);
      }
    });
  }, []);

  const agents = agentList;

  const SPECIALTIES = [...new Set(agents.flatMap((a) => a.specialties))].slice(0, 8);

  function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setSearch(values["0"] ?? "");
    setChips(selectedChips);
  }

  const filtered = useMemo(() => {
    let list = agents;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.specialties.some((s) => s.toLowerCase().includes(q)) ||
        a.countries.some((c) => c.toLowerCase().includes(q)) ||
        a.location.toLowerCase().includes(q)
      );
    }
    if (chips.includes("Verified only")) list = list.filter((a) => a.verified);
    if (chips.includes("Top rated")) list = list.filter((a) => a.rating >= 4.8);
    const specialtyChips = chips.filter((c) => SPECIALTIES.includes(c));
    if (specialtyChips.length > 0) {
      list = list.filter((a) => specialtyChips.some((c) => a.specialties.includes(c)));
    }
    if (showSaved) list = list.filter((a) => savedIds.has(a.id));
    return list;
  }, [search, chips, showSaved, savedIds, agents, SPECIALTIES]);

  return (
    <>
      <div className="bg-hero-gradient py-14">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Home
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow-white mb-3">Verified experts</span>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                Verified visa agents & travel experts
              </h1>
              <p className="mt-2 text-white/60 text-sm max-w-2xl">
                {usingLive
                  ? "Live experts from your Supabase database. Ratings appear when reviews are submitted."
                  : "Connect Supabase and add visa experts to populate this marketplace."}
              </p>
            </div>
            <button
              onClick={() => setShowSaved(!showSaved)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                showSaved ? "border-red-300 bg-red-50 text-red-600" : "border-white/20 bg-white/8 text-white/70 hover:bg-white/15"
              }`}
            >
              ♥ Saved ({savedIds.size})
            </button>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container-px">
          <FilterBar
            fields={[{ key: "0", placeholder: "Search by name, specialty, or country…" }]}
            chips={["Verified only", "Top rated", ...SPECIALTIES]}
            onSearch={handleSearch}
          />

          {filtered.length === 0 ? (
            <div className="card py-16 text-center">
              <p className="text-4xl mb-3">👔</p>
              <p className="font-bold text-navy">No experts listed yet</p>
              <p className="mt-2 text-sm text-charcoal/55 max-w-md mx-auto">
                Visa experts who complete onboarding appear here automatically.
              </p>
              <Link href="/onboarding/agent" className="btn-primary mt-6 inline-flex px-6 py-3 text-sm">
                Become a visa expert
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((agent) => (
                <MarketplaceCard
                  key={agent.id}
                  id={agent.id}
                  initials={agent.initials}
                  name={agent.name}
                  subtitle={agent.title}
                  rating={agent.rating}
                  reviews={agent.reviews}
                  tags={agent.specialties}
                  meta={agent.location}
                  responseTime={agent.responseTime !== "—" ? agent.responseTime : undefined}
                  verified={agent.verified}
                  onSave={() => setSavedIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(agent.id)) next.delete(agent.id);
                    else next.add(agent.id);
                    return next;
                  })}
                  onContact={() => setModal({ open: true, agent })}
                  ctaLabel="Contact expert"
                  payAction={
                    <StripeCheckoutButton
                      productKey="usa_visa_consultation"
                      checkoutMeta={{
                        agentId: agent.id,
                        listingTitle: agent.name,
                      }}
                      label="Premium consultation"
                      className="btn-outline w-full py-2.5 text-sm"
                      fullWidth
                    />
                  }
                />
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            {trustItems.slice(0, 3).map((t) => (
              <TrustBadge key={t.title} icon={t.icon} emoji={t.emoji} title={t.title} text={t.text} />
            ))}
          </div>
          <Disclaimer className="mt-8" />
        </div>
      </section>

      <CTASection
        title="Are you a visa expert?"
        subtitle="Join the marketplace, set your services, and receive real leads from travelers."
        primary={{ label: "Become an expert", href: "/onboarding/agent" }}
        secondary={{ label: "View pricing", href: "/pricing" }}
      />

      <ContactModal
        open={modal.open}
        onClose={() => setModal({ open: false, agent: null })}
        mode="contact_expert"
        subjectName={modal.agent?.name}
      />
    </>
  );
}
