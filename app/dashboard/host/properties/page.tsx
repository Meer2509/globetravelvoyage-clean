import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchHostPropertyListings } from "@/lib/supabase/property-actions";
import type { PropertyListingRow } from "@/lib/supabase/property-types";

export const metadata: Metadata = {
  title: "My properties — Globe Travel Voyage",
  robots: { index: false, follow: false },
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold/10 text-gold",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
  reviewing: "bg-blue/10 text-blue",
  new: "bg-blue/10 text-blue",
};

function formatPrice(property: PropertyListingRow): string {
  if (property.price == null) return "Contact for price";
  const formatted = `$${property.price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (property.listing_type === "sale") return formatted;
  const per =
    property.price_period === "night"
      ? "/night"
      : property.price_period === "week"
        ? "/week"
        : property.price_period === "year"
          ? "/year"
          : "/month";
  return `${formatted}${per}`;
}

export default async function HostPropertiesPage() {
  const { rows, error } = await fetchHostPropertyListings();

  if (error?.toLowerCase().includes("sign in")) {
    redirect("/login?next=/dashboard/host/properties");
  }

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/host" className="text-xs font-semibold text-blue hover:underline">
            ← Host dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">My property listings</h1>
          <p className="mt-1 text-sm text-muted">
            Live listings from your Supabase account. Approved listings appear on the public marketplace.
          </p>
          <Link href="/properties/post" className="btn-primary mt-4 inline-flex px-5 py-2.5 text-sm">
            Post a new listing
          </Link>
        </div>
      </div>

      <div className="container-px py-8">
        {error && !error.toLowerCase().includes("sign in") && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {rows.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">🏠</p>
            <p className="font-bold text-navy">No property listings yet</p>
            <p className="mt-2 text-sm text-muted max-w-md mx-auto">
              Submit your first listing for admin review. Once approved, it will appear on the public properties page.
            </p>
            <Link href="/properties/post" className="btn-primary mt-6 inline-flex px-6 py-3 text-sm">
              Post your first listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((property) => (
              <div key={property.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-navy">{property.title}</p>
                    {property.is_featured && property.status === "approved" && (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">Featured</span>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    {property.city}
                    {property.country ? `, ${property.country}` : ""} · {formatPrice(property)}
                  </p>
                  <p className="mt-1 text-xs text-charcoal/45">
                    Submitted {new Date(property.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      STATUS_STYLE[property.status] ?? "bg-soft text-charcoal/50"
                    }`}
                  >
                    {property.status}
                  </span>
                  {property.status === "approved" && (
                    <Link
                      href={`/properties/${property.id}`}
                      className="text-xs font-semibold text-blue hover:underline"
                    >
                      View live →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
