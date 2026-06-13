/** Shown beside sample flight, hotel, and travel catalog prices. */
export const PRICE_ESTIMATE_LABEL = "Sample estimate — confirm before booking.";

export const PROVIDER_ONBOARDING_HEADLINE =
  "Become one of the first verified providers.";

/** Referral commission payouts — separate from Stripe Connect provider payouts. */
export function areReferralRewardsLive(): boolean {
  return process.env.NEXT_PUBLIC_REFERRAL_REWARDS_LIVE === "true";
}

export const REFERRAL_LAUNCHING_SOON = "Referral rewards launching soon";
