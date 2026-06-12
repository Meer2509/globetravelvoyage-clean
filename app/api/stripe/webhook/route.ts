import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeWebhookConfigured } from "@/lib/stripe/server";
import { fulfillStripeCheckoutSession } from "@/lib/stripe/fulfill-session";
import { markPaymentStatusBySession } from "@/lib/stripe/payment-records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isStripeWebhookConfigured()) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured. Add STRIPE_WEBHOOK_SECRET." },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const result = await fulfillStripeCheckoutSession(session);
      if (!result.ok) {
        console.error("Webhook payment fulfill failed:", result.error);
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      await markPaymentStatusBySession(session.id, "expired");
    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const sessionId = intent.metadata?.checkout_session_id;
      if (sessionId) await markPaymentStatusBySession(sessionId, "failed");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler failed.";
    console.error("Stripe webhook error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
