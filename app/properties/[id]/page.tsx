import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PropertyInquiryForm } from "@/components/properties/PropertyInquiryForm";
import { Disclaimer } from "@/components/Disclaimer";
import { SaveButton } from "@/components/SaveButton";
import { fetchApprovedPropertyById } from "@/lib/supabase/property-actions";
import { fetchUserSavedIds } from "@/lib/supabase/saved-actions";

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

function formatPrice(
  price: number | null,
  period: string | null,
  listingType: string
): string {
  if (price == null) return "Contact for price";
  const formatted = `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (listingType === "sale") return formatted;
  const per =
    period === "night" ? "night" : period === "week" ? "week" : period === "year" ? "year" : "month";
  return `${formatted}/${per}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchApprovedPropertyById(id);
  if (!property) return { title: "Property not found" };
  return {
    title: `${property.title} — Globe Travel Voyage`,
    description: `${property.title} in ${property.city}. ${LISTING_LABEL[property.listing_type] ?? property.listing_type}.`,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, savedIds] = await Promise.all([
    fetchApprovedPropertyById(id),
    fetchUserSavedIds("property"),
  ]);

  if (!property) notFound();

  const emoji = PROPERTY_EMOJI[property.property_type] ?? "🏠";
  const listingLabel = LISTING_LABEL[property.listing_type] ?? property.listing_type;

  return (
    <div className="min-h-screen bg-soft/50">
      <div className="bg-hero-gradient py-10">
        <div className="container-px">
          <Link
            href="/properties"
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            ← All properties
          </Link>
          <div className="flex flex-wrap items-start gap-4">
            <span className="text-5xl">{emoji}</span>
            <div>
              {property.is_featured && (
                <span className="eyebrow-white mb-2">Featured listing</span>
              )}
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{property.title}</h1>
              <p className="mt-2 text-white/70">
                {property.city}
                {property.country ? `, ${property.country}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="chip text-xs">{listingLabel}</span>
                <span className="chip text-xs capitalize">{property.property_type}</span>
              </div>
              <p className="text-3xl font-extrabold text-navy">
                {formatPrice(property.price, property.price_period, property.listing_type)}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
                <span>🛏 {property.beds ?? 0} bed{(property.beds ?? 0) !== 1 ? "s" : ""}</span>
                {property.baths != null && (
                  <span>🚿 {property.baths} bath{property.baths !== 1 ? "s" : ""}</span>
                )}
                {property.area_sqft != null && <span>📐 {property.area_sqft.toLocaleString()} sq ft</span>}
              </div>
              {property.address && (
                <p className="mt-4 text-sm text-charcoal/65">
                  <span className="font-semibold text-navy">Area: </span>
                  {property.address}
                </p>
              )}
              {property.description && (
                <div className="mt-6 border-t border-soft-200 pt-6">
                  <h2 className="font-bold text-navy mb-2">About this property</h2>
                  <p className="text-sm text-charcoal/65 leading-relaxed whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>
              )}
            </div>

            <Disclaimer variant="compact" />
          </div>

          <div className="space-y-4">
            <div className="card p-6 sticky top-24">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-navy">Request a quote</h2>
                <SaveButton
                  id={property.id}
                  itemType="property"
                  title={property.title}
                  defaultSaved={savedIds.includes(property.id)}
                />
              </div>
              <PropertyInquiryForm propertyId={property.id} propertyTitle={property.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
