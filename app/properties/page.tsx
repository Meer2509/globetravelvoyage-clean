import Link from "next/link";
import { PropertiesCatalog } from "@/components/PropertiesCatalog";
import { fetchMarketplaceProperties } from "@/lib/supabase/mvp-queries";
import { fetchUserSavedIds } from "@/lib/supabase/saved-actions";

export default async function PropertiesPage() {
  const [properties, savedIds] = await Promise.all([
    fetchMarketplaceProperties(),
    fetchUserSavedIds("property"),
  ]);

  return (
    <>
      <div className="bg-hero-gradient py-14">
        <div className="container-px">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-dark hover:text-white transition-colors"
          >
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Properties</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Rent, buy/sell & travel stays</h1>
          <p className="mt-2 text-muted-dark text-sm max-w-2xl">
            Live property listings from verified hosts. New listings are reviewed by our admin team before publishing.
          </p>
        </div>
      </div>

      <PropertiesCatalog properties={properties} savedIds={savedIds} />
    </>
  );
}
