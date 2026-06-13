import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatPaymentAmount, formatPaymentDate, paymentServiceLabel } from "@/lib/payments-display";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;
  const admin = createAdminClient();
  if (!admin) {
    return new NextResponse("Service unavailable", { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  const authUser = supabase ? (await supabase.auth.getUser()).data.user : null;

  const { data: payment, error } = await admin
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();

  if (error || !payment) {
    return new NextResponse("Receipt not found", { status: 404 });
  }

  const row = payment as {
    id: string;
    user_id: string | null;
    email: string | null;
    amount: number;
    currency: string;
    status: string;
    description: string | null;
    service_type: string | null;
    invoice_number: string | null;
    paid_at: string | null;
    created_at: string;
    stripe_payment_intent_id: string | null;
  };

  const isOwner =
    authUser &&
    (row.user_id === authUser.id ||
      (row.email && authUser.email && row.email.toLowerCase() === authUser.email.toLowerCase()));

  if (!isOwner) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const serviceName = paymentServiceLabel(row.service_type, row.description);
  const amountStr = formatPaymentAmount(Number(row.amount), row.currency ?? "USD");
  const dateStr = formatPaymentDate(row.paid_at ?? row.created_at);
  const invoice = row.invoice_number ?? `GTV-${row.id.slice(0, 8).toUpperCase()}`;
  const siteUrl = getSiteUrl();

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt ${invoice} — Globe Travel Voyage</title>
  <style>
    body { font-family: Georgia, serif; background: #f4f6f9; margin: 0; padding: 40px 20px; color: #081c3a; }
    .receipt { max-width: 640px; margin: 0 auto; background: #fff; border: 1px solid #e8ecf0; border-radius: 12px; overflow: hidden; }
    .header { background: #081c3a; color: #fff; padding: 32px 36px; }
    .gold { color: #c9a227; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; }
    .body { padding: 36px; }
    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f2f5; font-size: 14px; }
    .label { color: #8896a8; }
    .total { font-size: 24px; font-weight: 600; color: #081c3a; margin-top: 20px; }
    .footer { padding: 24px 36px; background: #f8f9fb; font-size: 12px; color: #8896a8; }
    @media print { body { background: #fff; padding: 0; } .receipt { border: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <p class="gold">Globe Travel Voyage</p>
      <h1 style="margin:8px 0 0;font-size:28px;font-weight:400;">Payment Receipt</h1>
    </div>
    <div class="body">
      <div class="row"><span class="label">Invoice</span><strong>${invoice}</strong></div>
      <div class="row"><span class="label">Date</span><span>${dateStr}</span></div>
      <div class="row"><span class="label">Service</span><span>${serviceName}</span></div>
      <div class="row"><span class="label">Status</span><span style="color:#059669;font-weight:600;text-transform:capitalize;">${row.status}</span></div>
      ${row.stripe_payment_intent_id ? `<div class="row"><span class="label">Payment ref</span><span style="font-family:monospace;font-size:12px;">${row.stripe_payment_intent_id}</span></div>` : ""}
      <p class="total">${amountStr}</p>
    </div>
    <div class="footer">
      Paid via secure Stripe Checkout. Globe Travel Voyage is an independent marketplace — not a government agency.<br>
      <a href="${siteUrl}/dashboard/customer?tab=payments">View payment history</a>
    </div>
  </div>
  <script>window.onload = function() { /* user can Ctrl+P to print */ }</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="receipt-${invoice}.html"`,
    },
  });
}
