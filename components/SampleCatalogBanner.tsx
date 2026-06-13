import { PRICE_ESTIMATE_LABEL } from "@/lib/launch-trust";

export function SampleCatalogBanner() {
  return (
    <div className="rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-charcoal/70">
      <span className="font-semibold text-navy">{PRICE_ESTIMATE_LABEL}</span>
      {" "}
      Illustrative listings only — submit a request or contact a verified provider for confirmed quotes.
    </div>
  );
}
