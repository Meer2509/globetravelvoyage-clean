import type Stripe from "stripe";
import { fulfillPaymentFromCheckoutSession } from "./payment-records";

export async function fulfillStripeCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (session.payment_status !== "paid") {
    return { ok: false, error: "Session is not paid." };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const email =
    session.customer_details?.email ??
    session.customer_email ??
    session.metadata?.email ??
    null;

  return fulfillPaymentFromCheckoutSession({
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    amount: session.amount_total != null ? session.amount_total / 100 : undefined,
    currency: session.currency ?? undefined,
    email,
  });
}
