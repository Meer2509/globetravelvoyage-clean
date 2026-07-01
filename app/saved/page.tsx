import Link from "next/link";
import type { Metadata } from "next";
import { fetchUserSavedItems } from "@/lib/supabase/saved-actions";

export const metadata: Metadata = {
  title: "Saved Items",
  description: "Your saved properties, tours, travel agents, and visa guides on Globe Travel Voyage.",
};

const TYPE_META: Record<string, { label: string; emoji: string; browseHref: string }> = {
  property: { label: "Properties", emoji: "🏠", browseHref: "/properties" },
  tour: { label: "Tours", emoji: "🗺️", browseHref: "/tours" },
  hotel: { label: "Stays", emoji: "🏨", browseHref: "/hotels" },
  agent: { label: "Experts", emoji: "👔", browseHref: "/agents" },
  listing: { label: "Listings", emoji: "📌", browseHref: "/search" },
};

export default async function SavedPage() {
  const items = await fetchUserSavedItems();

  return (
    <div className="min-h-screen bg-soft/30">
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link
            href="/dashboard/customer"
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-dark hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
          <span className="eyebrow-white mb-3">Saved</span>
          <h1 className="text-3xl font-extrabold text-white">Your saved items</h1>
          <p className="mt-2 text-muted-dark text-sm">
            Items you save while browsing sync here when signed in.
          </p>
        </div>
      </div>

      <div className="container-px py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 bg-white py-20 text-center">
            <span className="text-5xl mb-4">💾</span>
            <p className="font-bold text-navy text-lg">No saved items yet</p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Tap the heart on property listings, tours, or experts while browsing to save them here.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/properties" className="btn-primary px-5 py-2.5 text-sm">Browse properties</Link>
              <Link href="/agents" className="btn-outline px-5 py-2.5 text-sm">Find experts</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const meta = TYPE_META[item.item_type] ?? TYPE_META.listing;
              return (
                <Link
                  key={item.id}
                  href={item.item_type === "property" ? `/properties/${item.item_id}` : meta.browseHref}
                  className="card card-hover flex items-start gap-4 p-5"
                >
                  <span className="text-3xl">{meta.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gold">{meta.label}</p>
                    <p className="font-bold text-navy truncate">{item.title ?? item.item_id}</p>
                    <p className="mt-1 text-xs text-muted">
                      Saved {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
