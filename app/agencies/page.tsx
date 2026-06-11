"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { FilterBar } from "@/components/FilterBar";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { isSupabaseConfigured } from "@/lib/auth";
import { fetchMarketplaceAgencies, type MarketplaceAgencyRow } from "@/lib/supabase/mvp-queries";

type AgencyCard = {
  id: string;
  name: string;
  city: string;
  country: string;
  services: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  initials: string;
  description: string;
};

function mapAgency(a: MarketplaceAgencyRow): AgencyCard {
  const name = a.agency_name;
  return {
    id: a.id,
    name,
    city: "—",
    country: a.registration_country ?? "—",
    services: (a.services ?? []).slice(0, 4),
    rating: a.rating ?? 0,
    reviews: a.review_count ?? 0,
    verified: a.is_verified,
    initials: name.slice(0, 2).toUpperCase(),
    description: a.description ?? "",
  };
}

export default function AgenciesPage() {
  const [modal, setModal] = useState<{ open: boolean; agency: AgencyCard | null }>({ open: false, agency: null });
  const [search, setSearch] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [agencyList, setAgencyList] = useState<AgencyCard[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoaded(true);
      return;
    }
    fetchMarketplaceAgencies().then((rows) => {
      setAgencyList(rows.map(mapAgency));
      setLoaded(true);
    });
  }, []);

  const COUNTRY_CHIPS = [...new Set(agencyList.map((a) => a.country).filter((c) => c !== "—"))].slice(0, 8);
  const SERVICE_CHIPS = [...new Set(agencyList.flatMap((a) => a.services))].slice(0, 8);

  function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setSearch(values["0"] ?? "");
    setChips(selectedChips);
  }

  const filteredAgencies = useMemo(() => {
    let list = agencyList;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q) ||
        a.services.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (chips.includes("Verified only")) list = list.filter((a) => a.verified);
    if (chips.includes("Top rated")) list = list.filter((a) => a.rating >= 4.7);
    const countryChips = chips.filter((c) => COUNTRY_CHIPS.includes(c));
    if (countryChips.length > 0) list = list.filter((a) => countryChips.includes(a.country));
    const serviceChips = chips.filter((c) => SERVICE_CHIPS.includes(c));
    if (serviceChips.length > 0) list = list.filter((a) => serviceChips.some((c) => a.services.includes(c)));
    return list;
  }, [search, chips, agencyList, COUNTRY_CHIPS, SERVICE_CHIPS]);

  return (
    <>
      <div className="bg-hero-gradient py-14">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Verified agencies</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Travel agencies you can trust
          </h1>
          <p className="mt-2 text-white/60 text-sm max-w-2xl">
            Verified agencies offering packages, tickets, tours and visa support — listed from our Supabase marketplace.
          </p>
        </div>
      </div>

      <div className="container-px">
        <FilterBar
          fields={[{ key: "0", placeholder: "Search agency name, country, service…" }]}
          chips={["Verified only", "Top rated", ...COUNTRY_CHIPS, ...SERVICE_CHIPS]}
          onSearch={handleSearch}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <p className="mb-5 text-sm text-charcoal/50">
            {filteredAgencies.length} agenc{filteredAgencies.length !== 1 ? "ies" : "y"} found
          </p>

          {loaded && agencyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
              <span className="text-4xl mb-3">🏢</span>
              <p className="font-semibold text-navy">No agencies listed yet</p>
              <p className="mt-1 max-w-md text-sm text-charcoal/45">
                Travel agencies appear here after they register and add services in the agency dashboard.
              </p>
              <Link href="/register?role=agency" className="btn-primary mt-5 px-5 py-2.5 text-sm">
                Register your agency
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredAgencies.map((a) => (
                <MarketplaceCard
                  key={a.id}
                  id={a.id}
                  initials={a.initials}
                  name={a.name}
                  subtitle={`${a.city}, ${a.country}`}
                  rating={a.rating}
                  reviews={a.reviews}
                  verified={a.verified}
                  tags={a.services.length ? a.services : ["Travel packages"]}
                  meta={a.description ? a.description.slice(0, 48) : "Agency profile"}
                  ctaLabel="Request quote"
                  onContact={() => setModal({ open: true, agency: a })}
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
          )}

          {loaded && agencyList.length > 0 && filteredAgencies.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
              <span className="text-4xl mb-3">🔍</span>
              <p className="font-semibold text-navy">No agencies match your filters</p>
              <p className="mt-1 text-sm text-charcoal/45">Try different search terms or filters.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="eyebrow mb-2">Curated trips</span>
              <h2 className="text-xl font-extrabold text-navy">Vacation packages</h2>
            </div>
            <Link href="/trip-planner" className="btn-outline py-2 px-4 text-sm">Plan your own →</Link>
          </div>
          <div className="rounded-2xl border border-dashed border-soft-200 bg-white py-14 text-center">
            <p className="font-semibold text-navy">No packages published yet</p>
            <p className="mt-1 text-sm text-charcoal/45">Agencies add packages from their dashboard — they will appear here when live.</p>
          </div>
          <div className="mt-8">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </section>

      <CTASection
        title="Grow your travel agency with us"
        subtitle="List packages, tickets and tours, manage leads and bookings, and earn a verification badge."
        primary={{ label: "Register your agency", href: "/register?role=agency" }}
        secondary={{ label: "Open agency dashboard", href: "/dashboard/agency" }}
      />

      <ContactModal
        open={modal.open}
        onClose={() => setModal({ open: false, agency: null })}
        mode="request_quote"
        subjectName={modal.agency?.name}
        subjectMeta={modal.agency ? `${modal.agency.city}, ${modal.agency.country}` : undefined}
      />
    </>
  );
}
