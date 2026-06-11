"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/FilterBar";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { SaveButton } from "@/components/SaveButton";
import { properties } from "@/lib/data";

type Property = (typeof properties)[0];

const CITY_CHIPS    = [...new Set(properties.map((p) => p.city))];
const TYPE_CHIPS    = ["For rent", "For sale", "Travel stay", "Apartment", "House", "Villa"];

export default function PropertiesPage() {
  const [modal, setModal]       = useState<{ open: boolean; property: Property | null }>({ open: false, property: null });
  const [search, setSearch]     = useState("");
  const [chips, setChips]       = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds]         = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "rent" | "sale">("all");

  function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setSearch(values["city"] ?? "");
    setMinPrice(values["min"] ?? "");
    setMaxPrice(values["max"] ?? "");
    setBeds(values["beds"] ?? "");
    setChips(selectedChips);
  }

  const filtered = useMemo(() => {
    let list = properties;
    if (activeTab === "rent") list = list.filter((p) => p.listingType !== "For Sale");
    if (activeTab === "sale") list = list.filter((p) => p.listingType === "For Sale");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.country.toLowerCase().includes(q));
    }
    if (chips.includes("For rent")) list = list.filter((p) => p.listingType !== "For Sale");
    if (chips.includes("For sale")) list = list.filter((p) => p.listingType === "For Sale");
    const cityChips = chips.filter((c) => CITY_CHIPS.includes(c));
    if (cityChips.length > 0) list = list.filter((p) => cityChips.includes(p.city));
    if (beds) list = list.filter((p) => p.beds >= Number(beds));
    return list;
  }, [search, chips, activeTab, beds, minPrice, maxPrice]);

  return (
    <>
      <div className="bg-hero-gradient py-14">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Properties</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Rent, buy/sell & travel stays</h1>
          <p className="mt-2 text-white/60 text-sm max-w-2xl">
            Houses and apartments for rent or sale, plus short and long-term travel stays. We connect you with hosts and sellers.
          </p>
        </div>
      </div>

      <div className="container-px">
        <FilterBar
          fields={[
            { key: "city", placeholder: "City or area" },
            { key: "min",  placeholder: "Min price" },
            { key: "max",  placeholder: "Max price" },
            { key: "beds", placeholder: "Min bedrooms" },
          ]}
          chips={[...TYPE_CHIPS, ...CITY_CHIPS]}
          onSearch={handleSearch}
        />
      </div>

      <div className="container-px pt-8">
        {/* Tab switcher */}
        <div className="mb-6 flex gap-1 w-fit rounded-xl bg-soft border border-soft-200 p-1">
          {(["all", "rent", "sale"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-navy shadow-[var(--shadow-card)]"
                  : "text-charcoal/50 hover:text-navy"
              }`}
            >
              {tab === "all" ? "All listings" : tab === "rent" ? "For rent" : "For sale"}
            </button>
          ))}
        </div>

        <div className="mb-5 text-sm text-charcoal/50">
          {filtered.length} propert{filtered.length !== 1 ? "ies" : "y"} found
          {(search || chips.length > 0) ? " — filtered" : ""}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
            <span className="text-4xl mb-3">🏠</span>
            <p className="font-semibold text-navy">No properties found</p>
            <p className="mt-1 text-sm text-charcoal/45">Try different filters or locations.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property) => (
              <div key={property.id} className="card card-hover flex flex-col overflow-hidden">
                <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-soft to-soft-200 text-5xl">
                  <span>{property.emoji}</span>
                  <div className="absolute right-2 top-2">
                    <SaveButton
                      id={property.id}
                      onToggle={(saved) =>
                        setSavedIds((prev) => {
                          const next = new Set(prev);
                          saved ? next.add(property.id) : next.delete(property.id);
                          return next;
                        })
                      }
                      className="rounded-lg bg-white/80 shadow-sm"
                    />
                  </div>
                  <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    property.listingType === "For Sale"
                      ? "bg-gold text-navy"
                      : "bg-blue/90 text-white"
                  }`}>
                    {property.listingType}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-bold text-navy">{property.title}</h3>
                  <p className="text-sm text-charcoal/55">{property.city}, {property.country}</p>
                  <div className="mt-3 flex gap-3 text-xs text-charcoal/55">
                    <span>🛏 {property.beds} bed{property.beds !== 1 ? "s" : ""}</span>
                    <span>🚿 {property.baths} bath{property.baths !== 1 ? "s" : ""}</span>
                    <span>📐 {property.area}</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between border-t border-soft-200 pt-4">
                    <div>
                      <p className="text-lg font-extrabold text-navy">{property.price}</p>
                      <p className="text-xs text-charcoal/45">
                        {property.listingType === "For Sale" ? "asking price" : "per month"}
                      </p>
                    </div>
                    <button
                      onClick={() => setModal({ open: true, property })}
                      className="btn-blue px-4 py-2 text-sm"
                    >
                      {property.listingType === "For Sale" ? "Inquire" : "Contact host"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Disclaimer>
            Globe Travel Voyage is not a real estate broker, agent or legal
            advisor. Property listings are provided by hosts and sellers. Always
            perform your own due diligence and verify ownership and terms
            independently before any payment.
          </Disclaimer>
        </div>
      </div>

      <div className="mt-8">
        <CTASection
          title="List your property for rent or sale"
          subtitle="Create a host account to publish listings, capture leads and manage inquiries."
          primary={{ label: "Become a host", href: "/register?role=host" }}
          secondary={{ label: "Open host dashboard", href: "/dashboard/agency" }}
        />
      </div>

      <ContactModal
        open={modal.open}
        onClose={() => setModal({ open: false, property: null })}
        mode="property_inquiry"
        subjectName={modal.property?.title}
        subjectMeta={modal.property ? `${modal.property.city}, ${modal.property.country} · ${modal.property.price}` : undefined}
      />
    </>
  );
}
