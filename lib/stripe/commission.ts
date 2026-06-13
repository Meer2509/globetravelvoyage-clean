import { getPlatformFeeRate } from "@/lib/stripe/connect-config";

/** Platform commission rate (from NEXT_PUBLIC_PLATFORM_FEE_PERCENT, default 15%). */
export function getPlatformCommissionRate(): number {
  return getPlatformFeeRate();
}

/** @deprecated Use getPlatformCommissionRate() — kept for existing imports. */
export const PLATFORM_COMMISSION_RATE = 0.15;

export function splitPaymentAmount(total: number): {
  platformFee: number;
  providerAmount: number;
} {
  const rate = getPlatformCommissionRate();
  const platformFee = Math.round(total * rate * 100) / 100;
  const providerAmount = Math.round((total - platformFee) * 100) / 100;
  return { platformFee, providerAmount };
}

/** Application fee in cents for Stripe destination charges. */
export function applicationFeeCents(totalCents: number): number {
  const rate = getPlatformCommissionRate();
  return Math.round(totalCents * rate);
}
