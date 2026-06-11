import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { fetchMarketplaceProperties } from "@/lib/supabase/mvp-queries";

const PROPERTY_EMOJI: Record<string, string> = {
  apartment: "🏢",
  house: "🏡",
  studio: "🛏️",
  room: "🚪",
  office: "🏣",
  land: "🌿",
};

const LISTING_LABEL: Record<string, string> = {
  rent: "For Rent",
  sale: "For Sale",
  short: "Travel Stay",
};

function formatPrice(price: number | null, period: string | null, listingType: string): string {
  if (price == null) return "Contact for price";
  const formatted = `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (listingType === "sale") return formatted;
  const per = period === "night" ? "night" : period === "week" ? "week" : period === "year" ? "year" : "month";
  return `${formatted}/${per}`;
}

export async function HomePropertiesSection() {
  const properties = await fetchMarketplaceProperties();

  return (
    <section className="section bg-soft">
      <div className="container-px">
        <SectionHeader
          eyebrow="Property marketplace"
          title="Travel stays, rentals & investment properties"
          subtitle="Listings shown here are loaded from Supabase. Property listings open as verified hosts complete onboarding."
          linkHref="/properties"
          linkLabel="All properties"
        />

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { label: "🌙 Vacation stays", href: "/properties" },
            { label: "🏢 Monthly rentals", href: "/properties" },
            { label: "💰 For sale / invest", href: "/properties" },
            { label: "📋 Post a listing", href: "/properties/post" },
          ].map((f) => (
            <Link
              key={f.label}
              href={f.href}
              className="rounded-full border border-soft-200 bg-white px-4 py-2 text-xs font-semibold text-navy hover:border-gold hover:text-navy transition-colors"
            >
              {f.label}
            </Link>
          ))}
        </div>

        {properties.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-soft-200 bg-white py-16 text-center">
            <p className="font-bold text-navy text-lg">Property listings opening soon.</p>
            <p className="mt-2 max-w-md mx-auto text-sm text-muted">
              Verified property hosts are being onboarded. Submit your listing now to be reviewed by our team.
            </p>
            <Link href="/properties/post" className="btn-primary mt-6 px-6 py-2.5 text-sm">
              Post a property listing
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.slice(0, 6).map((p) => {
              const emoji = PROPERTY_EMOJI[p.property_type] ?? "🏠";
              const typeLabel = LISTING_LABEL[p.listing_type] ?? p.listing_type;
              const typeColor =
                p.listing_type === "sale" ? "bg-gold" : p.listing_type === "short" ? "bg-blue" : "bg-emerald-500";

              return (
                <Link key={p.id} href="/properties" className="card card-hover group overflow-hidden flex flex-col">
                  <div className="relative h-44 bg-gradient-to-br from-blue/20 to-navy/20 flex items-center justify-center">
                    <span className="text-5xl opacity-70">{emoji}</span>
                    <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${typeColor}`}>
                      {typeLabel}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="font-bold text-navy leading-tight">{p.title}</h3>
                    <p className="text-xs text-muted mt-0.5">
                      {p.city}
                      {p.country ? `, ${p.country}` : ""}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                      {p.beds != null && p.beds > 0 ? <span>🛏 {p.beds} BR</span> : <span>🏠 Studio</span>}
                      {p.area_sqft != null && p.area_sqft > 0 && (
                        <>
                          <span>·</span>
                          <span>📐 {p.area_sqft} sqft</span>
                        </>
                      )}
                    </div>

                    <div className="mt-auto flex items-end justify-between border-t border-soft-200 pt-4 mt-4">
                      <div>
                        <p className="text-xl font-extrabold text-navy">
                          {formatPrice(p.price, p.price_period, p.listing_type)}
                        </p>
                        <p className="text-xs text-muted capitalize">{p.property_type}</p>
                      </div>
                      <span className="text-xs font-semibold text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Disclaimer className="mt-6">
          Globe Travel Voyage is not a real estate broker or agent. Property listings are provided by independent hosts. Always conduct proper due diligence before any transaction.
        </Disclaimer>
      </div>
    </section>
  );
}
