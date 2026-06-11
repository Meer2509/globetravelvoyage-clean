import type Stripe from "stripe";
import { fulfillStripePaymentComplete } from "./fulfill-payment";

export async function fulfillStripeCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<{ ok: true; bookingId?: string } | { ok: false; error: string }> {
  return fulfillStripePaymentComplete(session);
}
