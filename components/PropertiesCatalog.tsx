"use client";

import { useState, useMemo } from "react";
import { PremiumMarketplaceEmpty } from "@/components/PremiumMarketplaceEmpty";
import { FilterBar } from "@/components/FilterBar";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { SaveButton } from "@/components/SaveButton";
import { PROVIDER_ONBOARDING_HEADLINE } from "@/lib/launch-trust";
import type { MarketplacePropertyRow } from "@/lib/supabase/mvp-queries";

const PROPERTY_EMOJI: Record<string, string> = {
  apartment: "🏢",
  house: "🏡",
  studio: "🛏️",
  room: "🚪",
  office: "🏣",
  land: "🌿",
};

const LISTING_LABEL: Record<string, string> = {
  rent: "For rent",
  sale: "For sale",
  short: "Travel stay",
};

function formatPrice(price: number | null, period: string | null, listingType: string): string {
  if (price == null) return "Contact for price";
  const formatted = `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (listingType === "sale") return formatted;
  const per = period === "night" ? "night" : period === "week" ? "week" : period === "year" ? "year" : "month";
  return `${formatted}/${per}`;
}

export function PropertiesCatalog({
  properties,
  savedIds = [],
}: {
  properties: MarketplacePropertyRow[];
  savedIds?: string[];
}) {
  const [modal, setModal] = useState<{ open: boolean; property: MarketplacePropertyRow | null }>({
    open: false,
    property: null,
  });
  const [search, setSearch] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "rent" | "sale">("all");

  const cityChips = [...new Set(properties.map((p) => p.city))];
  const typeChips = ["For rent", "For sale", "Travel stay", "Apartment", "House", "Villa"];

  function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setSearch(values["city"] ?? "");
    setMinPrice(values["min"] ?? "");
    setMaxPrice(values["max"] ?? "");
    setBeds(values["beds"] ?? "");
    setChips(selectedChips);
  }

  const filtered = useMemo(() => {
    let list = properties;
    if (activeTab === "rent") list = list.filter((p) => p.listing_type !== "sale");
    if (activeTab === "sale") list = list.filter((p) => p.listing_type === "sale");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          (p.country ?? "").toLowerCase().includes(q)
      );
    }
    if (chips.includes("For rent")) list = list.filter((p) => p.listing_type === "rent");
    if (chips.includes("For sale")) list = list.filter((p) => p.listing_type === "sale");
    if (chips.includes("Travel stay")) list = list.filter((p) => p.listing_type === "short");
    const selectedCities = chips.filter((c) => cityChips.includes(c));
    if (selectedCities.length > 0) list = list.filter((p) => selectedCities.includes(p.city));
    if (beds) list = list.filter((p) => (p.beds ?? 0) >= Number(beds));
    if (minPrice) {
      const min = Number(minPrice);
      if (!Number.isNaN(min)) list = list.filter((p) => (p.price ?? 0) >= min);
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) list = list.filter((p) => (p.price ?? 0) <= max);
    }
    return list;
  }, [properties, search, chips, activeTab, beds, minPrice, maxPrice, cityChips]);

  return (
    <>
      <div className="container-px">
        <FilterBar
          fields={[
            { key: "city", placeholder: "City or area" },
            { key: "min", placeholder: "Min price" },
            { key: "max", placeholder: "Max price" },
            { key: "beds", placeholder: "Min bedrooms" },
          ]}
          chips={[...typeChips, ...cityChips]}
          onSearch={handleSearch}
        />
      </div>

      <div className="container-px pt-8">
        <div className="mb-6 flex gap-1 w-fit rounded-xl bg-soft border border-soft-200 p-1">
          {(["all", "rent", "sale"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-navy shadow-[var(--shadow-card)]"
                  : "text-muted hover:text-navy"
              }`}
            >
              {tab === "all" ? "All listings" : tab === "rent" ? "For rent" : "For sale"}
            </button>
          ))}
        </div>

        <div className="mb-5 text-sm text-muted">
          {filtered.length} listing{filtered.length !== 1 ? "s" : ""} available
          {search || chips.length > 0 ? " — filtered" : ""}
        </div>

        {properties.length === 0 ? (
          <PremiumMarketplaceEmpty variant="properties" />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
            <span className="text-4xl mb-3">🔍</span>
            <p className="font-semibold text-navy">No properties match your filters</p>
            <p className="mt-1 text-sm text-muted">Try different filters or locations.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property) => {
              const emoji = PROPERTY_EMOJI[property.property_type] ?? "🏠";
              const listingLabel = LISTING_LABEL[property.listing_type] ?? property.listing_type;
              return (
                <div key={property.id} className="card card-hover flex flex-col overflow-hidden">
                  <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-soft to-soft-200 text-5xl">
                    <span>{emoji}</span>
                    <div className="absolute right-2 top-2">
                      <SaveButton
                        id={property.id}
                        itemType="property"
                        title={property.title}
                        defaultSaved={savedIds.includes(property.id)}
                        className="rounded-lg bg-white/80 shadow-sm"
                      />
                    </div>
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        property.listing_type === "sale" ? "bg-gold text-navy" : "bg-blue/90 text-white"
                      }`}
                    >
                      {listingLabel}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-bold text-navy">{property.title}</h3>
                    <p className="text-sm text-muted">
                      {property.city}
                      {property.country ? `, ${property.country}` : ""}
                    </p>
                    <div className="mt-3 flex gap-3 text-xs text-muted">
                      <span>🛏 {property.beds ?? 0} bed{(property.beds ?? 0) !== 1 ? "s" : ""}</span>
                      {property.baths != null && (
                        <span>🚿 {property.baths} bath{property.baths !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                    <div className="mt-5 border-t border-soft-200 pt-4 space-y-2">
                      <div>
                        <p className="text-lg font-extrabold text-navy">
                          {formatPrice(property.price, property.price_period, property.listing_type)}
                        </p>
                        <p className="text-xs text-muted capitalize">{property.property_type}</p>
                      </div>
                      <button
                        onClick={() => setModal({ open: true, property })}
                        className="btn-primary w-full py-2.5 text-sm"
                      >
                        {property.listing_type === "sale" ? "Inquire — free" : "Request quote — free"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <Disclaimer>
            Globe Travel Voyage is not a real estate broker, agent or legal advisor. Property listings are
            provided by hosts and sellers. Always perform your own due diligence before any payment.
          </Disclaimer>
        </div>
      </div>

      <div className="mt-8">
        <CTASection
          title={PROVIDER_ONBOARDING_HEADLINE}
          subtitle="Create a host account to publish listings, capture leads and manage inquiries."
          primary={{ label: "Become a property host", href: "/register?role=host" }}
          secondary={{ label: "Open host dashboard", href: "/dashboard/host" }}
        />
      </div>

      <ContactModal
        open={modal.open}
        onClose={() => setModal({ open: false, property: null })}
        mode="property_inquiry"
        subjectName={modal.property?.title}
        subjectMeta={
          modal.property
            ? `${modal.property.city}${modal.property.country ? `, ${modal.property.country}` : ""} · ${formatPrice(modal.property.price, modal.property.price_period, modal.property.listing_type)}`
            : undefined
        }
      />
    </>
  );
}
