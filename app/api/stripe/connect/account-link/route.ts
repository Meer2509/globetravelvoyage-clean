import { NextResponse } from "next/server";
import { isStripeConnectConfigured } from "@/lib/stripe/connect-config";
import { getAuthenticatedProvider } from "@/lib/stripe/connect-auth";
import {
  createConnectOnboardingLink,
  fetchPayoutAccountByUserId,
} from "@/lib/stripe/connect-accounts";

export async function POST() {
  if (!isStripeConnectConfigured()) {
    return NextResponse.json(
      { error: "Stripe Connect is not configured. Add STRIPE_SECRET_KEY to your environment." },
      { status: 503 }
    );
  }

  const auth = await getAuthenticatedProvider();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const row = await fetchPayoutAccountByUserId(auth.provider.id);
  if (!row?.stripe_account_id) {
    return NextResponse.json(
      { error: "No Stripe Connect account found. Start payout setup first." },
      { status: 404 }
    );
  }

  const link = await createConnectOnboardingLink(row.stripe_account_id);
  if (!link.ok) {
    return NextResponse.json({ error: link.error }, { status: 500 });
  }

  return NextResponse.json({ url: link.url });
}
