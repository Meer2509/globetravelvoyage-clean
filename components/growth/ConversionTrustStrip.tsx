import { MarketplaceTrustStrip } from "@/components/trust/MarketplaceTrustStrip";

export function ConversionTrustStrip({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <MarketplaceTrustStrip />
      <p className="mt-2 text-center text-[11px] text-charcoal/45">
        Independent marketplace — not a government agency. Visa approval is never guaranteed.
      </p>
    </div>
  );
}
