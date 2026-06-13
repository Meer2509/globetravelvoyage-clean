import { NextResponse } from "next/server";
import { isStripeConnectConfigured } from "@/lib/stripe/connect-config";
import { getAuthenticatedProvider } from "@/lib/stripe/connect-auth";
import {
  createExpressConnectAccount,
  createConnectOnboardingLink,
} from "@/lib/stripe/connect-accounts";

export async function POST() {
  if (!isStripeConnectConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe Connect is not configured. Add STRIPE_SECRET_KEY (and STRIPE_CONNECT_CLIENT_ID for marketplace mode) to your environment.",
      },
      { status: 503 }
    );
  }

  const auth = await getAuthenticatedProvider();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const created = await createExpressConnectAccount({
    userId: auth.provider.id,
    email: auth.provider.email,
    providerRole: auth.provider.role,
  });

  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 500 });
  }

  const link = await createConnectOnboardingLink(created.stripeAccountId);
  if (!link.ok) {
    return NextResponse.json({ error: link.error }, { status: 500 });
  }

  return NextResponse.json({ url: link.url, stripeAccountId: created.stripeAccountId });
}
