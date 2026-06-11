export function SampleCatalogBanner({ label = "Sample estimates" }: { label?: string }) {
  return (
    <div className="rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-charcoal/70">
      <span className="font-semibold text-navy">{label}</span>
      {" — "}
      Prices and listings shown are illustrative examples, not live inventory. Submit a request or contact a verified provider for real quotes.
    </div>
  );
}
