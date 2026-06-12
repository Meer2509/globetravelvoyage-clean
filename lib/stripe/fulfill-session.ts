import type Stripe from "stripe";
import { fulfillStripePaymentComplete, type FulfillResult } from "./fulfill-payment";

export async function fulfillStripeCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<FulfillResult | { ok: false; error: string }> {
  return fulfillStripePaymentComplete(session);
}
