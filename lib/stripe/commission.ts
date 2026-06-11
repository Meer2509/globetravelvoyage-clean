/** Platform commission on provider marketplace transactions (15%). */
export const PLATFORM_COMMISSION_RATE = 0.15;

export function splitPaymentAmount(total: number): {
  platformFee: number;
  providerAmount: number;
} {
  const platformFee = Math.round(total * PLATFORM_COMMISSION_RATE * 100) / 100;
  const providerAmount = Math.round((total - platformFee) * 100) / 100;
  return { platformFee, providerAmount };
}
