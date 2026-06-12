import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { TierBadge } from "@/components/TierBadge";
import {
  formatProductPrice,
  getCheckoutProduct,
  type CheckoutProductKey,
} from "@/lib/stripe/products";

export function ServiceCard({
  productKey,
  compact = false,
}: {
  productKey: CheckoutProductKey;
  compact?: boolean;
}) {
  const product = getCheckoutProduct(productKey);
  if (!product) return null;

  const price = formatProductPrice(product);
  const cta = product.ctaLabel ?? "Upgrade";
  const tier = product.tier === "featured" ? "featured" : "premium";

  return (
    <div className={`card flex flex-col ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-2">
        <span className={compact ? "text-2xl" : "text-3xl"}>{product.emoji}</span>
        <TierBadge tier={tier} />
      </div>
      <div className="mt-3 min-w-0 flex-1">
        <p className={`font-bold text-navy ${compact ? "text-sm" : "text-base"}`}>{product.name}</p>
        {!compact && (
          <p className="mt-1 text-sm leading-relaxed text-muted">{product.description}</p>
        )}
      </div>
      <div className={`mt-auto flex items-center justify-between gap-3 border-t border-soft-200 ${compact ? "pt-3 mt-3" : "pt-4 mt-4"}`}>
        <span className={`font-extrabold text-navy ${compact ? "text-lg" : "text-xl"}`}>{price}</span>
        <StripeCheckoutButton
          productKey={product.key}
          label={cta}
          className={compact ? "btn-outline px-4 py-2 text-xs" : "btn-outline px-5 py-2.5 text-sm"}
        />
      </div>
    </div>
  );
}
