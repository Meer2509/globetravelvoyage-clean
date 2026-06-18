import { CATALOG_BANNER_DETAIL, PRICE_ESTIMATE_LABEL } from "@/lib/launch-trust";

/** Trust banner for catalog browse pages (flights, hotels, tours). */
export function CatalogQuoteBanner() {
  return (
    <div className="rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-charcoal/70">
      <span className="font-semibold text-navy">{PRICE_ESTIMATE_LABEL}</span>
      {" "}
      {CATALOG_BANNER_DETAIL}
    </div>
  );
}

/** @deprecated Use CatalogQuoteBanner */
export const SampleCatalogBanner = CatalogQuoteBanner;
