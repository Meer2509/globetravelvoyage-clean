"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { ListingGrid } from "@/components/ListingGrid";
import { FilterBar } from "@/components/FilterBar";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { agencies, packages } from "@/lib/data";

type Agency = (typeof agencies)[0];

const SERVICE_CHIPS = [...new Set(agencies.flatMap((a) => a.services))].slice(0, 8);
const COUNTRY_CHIPS = [...new Set(agencies.map((a) => a.country))];

export default function AgenciesPage() {
  const [modal, setModal]       = useState<{ open: boolean; agency: Agency | null }>({ open: false, agency: null });
  const [pkgModal, setPkgModal] = useState<{ open: boolean; name: string }>({ open: false, name: "" });
  const [search, setSearch]     = useState("");
  const [chips, setChips]       = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setSearch(values["0"] ?? "");
    setChips(selectedChips);
  }

  const filteredAgencies = useMemo(() => {
    let list = agencies;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q) ||
        a.services.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (chips.includes("Verified only")) list = list.filter((a) => a.verified);
    if (chips.includes("Top rated"))     list = list.filter((a) => a.rating >= 4.7);
    const countryChips = chips.filter((c) => COUNTRY_CHIPS.includes(c));
    if (countryChips.length > 0) list = list.filter((a) => countryChips.includes(a.country));
    const serviceChips = chips.filter((c) => SERVICE_CHIPS.includes(c));
    if (serviceChips.length > 0) list = list.filter((a) => serviceChips.some((c) => a.services.includes(c)));
    return list;
  }, [search, chips]);

  return (
    <>
      {/* Header */}
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
            Verified agencies offering packages, tickets, tours and visa support — with verification badges and transparent reviews.
          </p>
        </div>
      </div>

      <div className="container-px">
        <FilterBar
          fields={[{ key: "0", placeholder: "Search agency name, city, country, service…" }]}
          chips={["Verified only", "Top rated", ...COUNTRY_CHIPS, ...SERVICE_CHIPS]}
          onSearch={handleSearch}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <p className="mb-5 text-sm text-charcoal/50">
            {filteredAgencies.length} agenc{filteredAgencies.length !== 1 ? "ies" : "y"} found
          </p>
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
                tags={a.services}
                meta={`${a.packages} active packages`}
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

          {filteredAgencies.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
              <span className="text-4xl mb-3">🔍</span>
              <p className="font-semibold text-navy">No agencies found</p>
              <p className="mt-1 text-sm text-charcoal/45">Try different filters.</p>
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
          <ListingGrid
            columns={4}
            items={packages.map((p) => ({
              id: p.id,
              emoji: p.emoji,
              title: p.title,
              subtitle: `${p.agency} · ${p.nights} nights`,
              price: p.price,
              priceNote: "per person",
              tags: p.includes,
              ctaLabel: "Request quote",
            }))}
            onCta={(id) => {
              const pkg = packages.find((p) => p.id === id);
              if (pkg) setPkgModal({ open: true, name: pkg.title });
            }}
            onSave={() => {}}
          />
          <div className="mt-8">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </section>

      <CTASection
        title="Grow your travel agency with us"
        subtitle="List packages, tickets and tours, manage leads and bookings, and earn a verification badge."
        primary={{ label: "Register your agency", href: "/register" }}
        secondary={{ label: "Open agency dashboard", href: "/dashboard/agency" }}
      />

      <ContactModal
        open={modal.open}
        onClose={() => setModal({ open: false, agency: null })}
        mode="request_quote"
        subjectName={modal.agency?.name}
        subjectMeta={modal.agency ? `${modal.agency.city}, ${modal.agency.country}` : undefined}
      />

      <ContactModal
        open={pkgModal.open}
        onClose={() => setPkgModal({ open: false, name: "" })}
        mode="request_quote"
        subjectName={pkgModal.name}
      />
    </>
  );
}
