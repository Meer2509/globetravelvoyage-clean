// =============================================================================
// Globe Travel Voyage — Stripe client helpers
// =============================================================================

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";

/** Browser-safe: publishable key present */
export const isStripeConfigured = Boolean(STRIPE_PUBLISHABLE_KEY);

export { STRIPE_PRICE_IDS, type StripePriceKey } from "./stripe/legacy-prices";
