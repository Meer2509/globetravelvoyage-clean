/** Shown beside catalog flight, hotel, and travel prices that require provider confirmation. */
export const PRICE_ESTIMATE_LABEL =
  "Request verified quote — provider confirmation required.";

/** Secondary line on catalog browse banners. */
export const CATALOG_BANNER_DETAIL =
  "Illustrative listings for planning only. Submit a request for a verified quote from a confirmed provider.";

/** Default badge on marketplace listing cards. */
export const QUOTE_BADGE_LABEL = "Request quote";

/** When referral payouts are not yet live. */
export const REFERRAL_LAUNCHING_SOON = "Referral rewards — early member onboarding";

export const PROVIDER_ONBOARDING_HEADLINE =
  "Become one of the first verified providers.";

/** Document checker and visa case upload messaging. */
export const SECURE_UPLOAD_AFTER_CASE =
  "Secure upload available after case creation.";

/** FAQ and legal copy for non-live catalog pricing. */
export const NO_LIVE_PRICING_NOTICE =
  "Live pricing is not displayed on browse pages. Request a verified quote — provider confirmation required before booking.";

/** Referral commission payouts — separate from Stripe Connect provider payouts. */
export function areReferralRewardsLive(): boolean {
  return process.env.NEXT_PUBLIC_REFERRAL_REWARDS_LIVE === "true";
}
