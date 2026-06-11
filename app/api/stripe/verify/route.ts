import { NextResponse } from "next/server";
import { getStripe, isStripeServerConfigured } from "@/lib/stripe/server";
import { fulfillStripeCheckoutSession } from "@/lib/stripe/fulfill-session";
import { getCheckoutProduct } from "@/lib/stripe/products";

export async function GET(request: Request) {
  if (!isStripeServerConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe client could not be initialized." }, { status: 503 });
  }

  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid = session.payment_status === "paid";
    const amount = session.amount_total ? session.amount_total / 100 : null;
    const productKey = session.metadata?.product_key ?? "";
    const product = productKey ? getCheckoutProduct(productKey) : undefined;

    if (paid) {
      await fulfillStripeCheckoutSession(session);
    }

    return NextResponse.json({
      ok: true,
      paid,
      sessionId: session.id,
      productName: product?.name ?? session.metadata?.product_key ?? "Your purchase",
      serviceType: productKey || null,
      amount,
      currency: session.currency?.toUpperCase() ?? "USD",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not verify payment session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
