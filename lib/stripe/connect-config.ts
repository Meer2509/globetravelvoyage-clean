import { isStripeServerConfigured } from "@/lib/stripe/server";

/** Stripe Connect OAuth client id (optional for Express; used for setup completeness checks). */
export function getStripeConnectClientId(): string | null {
  const id = process.env.STRIPE_CONNECT_CLIENT_ID?.trim();
  return id || null;
}

/** Platform commission percent (default 15). Safe for client via NEXT_PUBLIC_ prefix. */
export function getPlatformFeePercent(): number {
  const raw = process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT?.trim();
  const parsed = raw ? Number.parseFloat(raw) : 15;
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return 15;
  return parsed;
}

export function getPlatformFeeRate(): number {
  return getPlatformFeePercent() / 100;
}

/** Minimum: secret key. Express onboarding works without Connect client id. */
export function isStripeConnectConfigured(): boolean {
  return isStripeServerConfigured();
}

/** Full marketplace Connect setup (client id documented for operators). */
export function isStripeConnectFullyConfigured(): boolean {
  return isStripeConnectConfigured() && Boolean(getStripeConnectClientId());
}

export const PROVIDER_PAYOUT_ROLES = [
  "visa_agent",
  "travel_agency",
  "tour_guide",
  "property_host",
] as const;

export type ProviderPayoutRole = (typeof PROVIDER_PAYOUT_ROLES)[number];

export function isProviderPayoutRole(role: string | null | undefined): role is ProviderPayoutRole {
  return PROVIDER_PAYOUT_ROLES.includes(role as ProviderPayoutRole);
}
