"use server";

import { getSiteUrl } from "@/lib/site-url";
import { formatPaymentAmount } from "@/lib/payments-display";
import { paymentServiceLabel } from "@/lib/payments-display";
import { sendEmail } from "@/lib/email/send-email";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "admin@globetravelvoyage.com";

interface PaymentEmailPayload {
  customerEmail: string;
  customerName?: string | null;
  userId?: string | null;
  serviceType: string;
  description: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  paymentId: string;
  bookingId?: string;
  visaApplicationId?: string;
  visaCaseId?: string;
  caseNumber?: string;
}

function luxuryEmailShell(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#081c3a;padding:40px 20px;">
    <tr><td align="center">
      <p style="color:#c9a227;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Globe Travel Voyage</p>
      <h1 style="color:#ffffff;font-size:28px;font-weight:400;margin:0;">Premium Travel Marketplace</h1>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <tr><td style="padding:40px 36px;">${content}</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:16px auto 40px;">
    <tr><td align="center" style="color:#8896a8;font-size:12px;line-height:1.6;">
      Globe Travel Voyage · Independent travel marketplace<br>
      Not a government agency. Visa decisions are made by embassies only.
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendCustomerPaymentConfirmation(
  payload: PaymentEmailPayload
): Promise<boolean> {
  const siteUrl = getSiteUrl();
  const serviceName = paymentServiceLabel(payload.serviceType, payload.description);
  const amountStr = formatPaymentAmount(payload.amount, payload.currency);
  const receiptUrl = `${siteUrl}/api/receipt/${payload.paymentId}`;
  const dashboardUrl = `${siteUrl}/dashboard/customer?tab=billing`;
  const visaCaseUrl = payload.visaCaseId
    ? `${siteUrl}/dashboard/visa-cases/${payload.visaCaseId}`
    : payload.visaApplicationId
      ? `${siteUrl}/dashboard/customer?tab=visa-case`
      : dashboardUrl;

  const html = luxuryEmailShell(`
    <p style="color:#c9a227;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">Order Confirmed</p>
    <h2 style="color:#081c3a;font-size:24px;font-weight:600;margin:0 0 8px;">Thank you, ${payload.customerName ?? "valued traveler"}</h2>
    <p style="color:#4a5568;font-size:15px;line-height:1.7;margin:0 0 28px;">
      Your Globe Travel Voyage order has been confirmed. Our team is preparing your premium service.
    </p>
    <table width="100%" style="background:#f8f9fb;border:1px solid #e8ecf0;border-radius:8px;margin-bottom:28px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 4px;color:#8896a8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Service</p>
        <p style="margin:0 0 16px;color:#081c3a;font-size:18px;font-weight:600;">${serviceName}</p>
        <p style="margin:0 0 4px;color:#8896a8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Amount</p>
        <p style="margin:0 0 16px;color:#081c3a;font-size:22px;font-weight:600;">${amountStr}</p>
        <p style="margin:0 0 4px;color:#8896a8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Invoice</p>
        <p style="margin:0;color:#081c3a;font-size:14px;font-family:monospace;">${payload.invoiceNumber}</p>
      </td></tr>
    </table>
    <p style="color:#4a5568;font-size:14px;line-height:1.7;margin:0 0 20px;"><strong>Next steps</strong></p>
    <ol style="color:#4a5568;font-size:14px;line-height:1.8;padding-left:20px;margin:0 0 28px;">
      <li>Access your dashboard to track your service</li>
      ${payload.visaCaseId || payload.visaApplicationId ? `<li>Your visa case${payload.caseNumber ? ` (${payload.caseNumber})` : ""} is open — upload documents when ready</li>` : ""}
      <li>Download your receipt for your records</li>
      <li>Our team will contact you within 24–48 hours for premium services</li>
    </ol>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="background:#081c3a;border-radius:6px;padding:14px 28px;">
          <a href="${dashboardUrl}" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Go to Dashboard</a>
        </td>
        <td width="12"></td>
        <td style="border:1px solid #081c3a;border-radius:6px;padding:14px 28px;">
          <a href="${receiptUrl}" style="color:#081c3a;text-decoration:none;font-size:14px;font-weight:600;">Download Receipt</a>
        </td>
      </tr>
    </table>
    ${payload.visaCaseId || payload.visaApplicationId ? `<p style="margin-top:20px;"><a href="${visaCaseUrl}" style="color:#c9a227;font-size:14px;">View My Visa Case →</a></p>` : ""}
  `);

  return sendEmail({
    to: payload.customerEmail,
    subject: "Your Globe Travel Voyage order is confirmed",
    html,
    type: "payment_confirmation",
    userId: payload.userId,
  });
}

export async function sendAdminPaymentNotification(
  payload: PaymentEmailPayload
): Promise<boolean> {
  const serviceName = paymentServiceLabel(payload.serviceType, payload.description);
  const amountStr = formatPaymentAmount(payload.amount, payload.currency);
  const siteUrl = getSiteUrl();

  const html = luxuryEmailShell(`
    <p style="color:#c9a227;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">New Paid Booking</p>
    <h2 style="color:#081c3a;font-size:22px;margin:0 0 20px;">New paid booking received</h2>
    <table width="100%" style="font-size:14px;color:#4a5568;line-height:2;">
      <tr><td><strong>Customer</strong></td><td>${payload.customerEmail}</td></tr>
      <tr><td><strong>Service</strong></td><td>${serviceName}</td></tr>
      <tr><td><strong>Amount</strong></td><td>${amountStr}</td></tr>
      <tr><td><strong>Invoice</strong></td><td>${payload.invoiceNumber}</td></tr>
      <tr><td><strong>Payment ID</strong></td><td style="font-family:monospace;font-size:12px;">${payload.paymentId}</td></tr>
      ${payload.bookingId ? `<tr><td><strong>Booking ID</strong></td><td style="font-family:monospace;font-size:12px;">${payload.bookingId}</td></tr>` : ""}
    </table>
    <p style="margin-top:24px;"><a href="${siteUrl}/dashboard/admin/payments" style="color:#081c3a;">View in admin dashboard →</a></p>
  `);

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: "New paid booking received — Globe Travel Voyage",
    html,
    type: "payment_confirmation",
  });
}
