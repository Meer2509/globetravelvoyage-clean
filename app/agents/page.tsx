"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { FilterBar } from "@/components/FilterBar";
import { TrustBadge } from "@/components/TrustBadge";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { agents, trustItems } from "@/lib/data";

type Agent = (typeof agents)[0];

const SPECIALTIES = [...new Set(agents.flatMap((a) => a.specialties))].slice(0, 8);

export default function AgentsPage() {
  const [modal, setModal]       = useState<{ open: boolean; agent: Agent | null }>({ open: false, agent: null });
  const [search, setSearch]     = useState("");
  const [chips, setChips]       = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showSaved, setShowSaved] = useState(false);

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
    if (chips.includes("Top rated"))     list = list.filter((a) => a.rating >= 4.8);
    const specialtyChips = chips.filter((c) => SPECIALTIES.includes(c));
    if (specialtyChips.length > 0) {
      list = list.filter((a) => specialtyChips.some((c) => a.specialties.includes(c)));
    }
    if (showSaved) list = list.filter((a) => savedIds.has(a.id));
    return list;
  }, [search, chips, showSaved, savedIds]);

  return (
    <>
      {/* Header */}
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
                Identity-checked agents who prepare documents, review applications and guide you through interviews. Transparent reviews, no pay-to-rank.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSaved(!showSaved)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  showSaved
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-white/20 bg-white/8 text-white/70 hover:bg-white/15"
                }`}
              >
                ♥ Saved ({savedIds.size})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px">
        <FilterBar
          fields={[{ key: "0", placeholder: "Search by name, specialty, country…" }]}
          chips={["Verified only", "Top rated", ...SPECIALTIES]}
          onSearch={handleSearch}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-charcoal/50">
              {filtered.length} expert{filtered.length !== 1 ? "s" : ""} found
              {chips.length > 0 || search ? " — filtered" : ""}
            </p>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1 text-charcoal/40">
                <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" /> Verified
              </span>
              <span className="flex items-center gap-1 text-charcoal/40">
                <span className="h-2 w-2 rounded-full bg-gold inline-block" /> Pending
              </span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((a) => (
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
                meta={`${a.cases.toLocaleString()} cases · ${a.countries.slice(0, 2).join(", ")}`}
                responseTime={a.responseTime}
                ctaLabel="Contact expert"
                onContact={() => setModal({ open: true, agent: a })}
                onSave={(saved) =>
                  setSavedIds((prev) => {
                    const next = new Set(prev);
                    saved ? next.add(a.id) : next.delete(a.id);
                    return next;
                  })
                }
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
              <span className="text-4xl mb-3">🔍</span>
              <p className="font-semibold text-navy">No agents found</p>
              <p className="mt-1 text-sm text-charcoal/45">Try different filters or search terms.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust section */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <div className="mb-8 text-center">
            <span className="eyebrow mb-3">Why verified</span>
            <h2 className="text-2xl font-extrabold text-navy">How verification protects you</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((t) => (
              <TrustBadge key={t.title} icon={t.icon} title={t.title} text={t.text} />
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-4xl">
            <Disclaimer>
              Verification confirms identity and business details — it is not an
              endorsement or guarantee of results. Agents are independent service
              providers. We do not guarantee visa approval. Always agree terms in
              writing and do your own due diligence before paying anyone.
            </Disclaimer>
          </div>
        </div>
      </section>

      <CTASection
        title="Are you a visa agent?"
        subtitle="Create a verified profile, receive leads, manage client applications and grow your reviews."
        primary={{ label: "Become an agent", href: "/register" }}
        secondary={{ label: "Open agent dashboard", href: "/dashboard/agent" }}
      />

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
