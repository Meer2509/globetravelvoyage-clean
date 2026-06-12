import { getSiteUrl } from "@/lib/site-url";

function shell(content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;background:#f4f6f9;font-family:Georgia,serif;">
  <table width="100%" style="background:#081c3a;padding:32px 20px;"><tr><td align="center">
    <p style="color:#c9a227;font-size:11px;letter-spacing:3px;margin:0;">GLOBE TRAVEL VOYAGE</p>
  </td></tr></table>
  <table width="100%" style="max-width:600px;margin:0 auto;background:#fff;"><tr><td style="padding:36px;">${content}</td></tr></table>
  <p style="text-align:center;color:#8896a8;font-size:11px;margin:24px;">Not a government agency. No visa approval guarantee.</p>
</body></html>`;
}

export function welcomeEmail(name: string): { subject: string; html: string } {
  const site = getSiteUrl();
  return {
    subject: "Welcome to Globe Travel Voyage",
    html: shell(`
      <h2 style="color:#081c3a;">Welcome${name ? `, ${name}` : ""}</h2>
      <p style="color:#4a5568;line-height:1.7;">Your account is ready. Explore free visa guides, save trips, and upgrade to premium services when you need expert help.</p>
      <p><a href="${site}/dashboard/customer" style="color:#c9a227;">Open your dashboard →</a></p>
    `),
  };
}

export function paymentConfirmationEmail(input: {
  name?: string;
  serviceName: string;
  amount: string;
  invoiceNumber: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  return {
    subject: "Payment confirmed — Globe Travel Voyage",
    html: shell(`
      <h2 style="color:#081c3a;">Payment confirmed</h2>
      <p style="color:#4a5568;">Thank you${input.name ? `, ${input.name}` : ""}. Your order is saved to your account.</p>
      <p><strong>${input.serviceName}</strong><br>${input.amount}<br>Invoice ${input.invoiceNumber}</p>
      <p><a href="${input.dashboardUrl}" style="color:#c9a227;">View dashboard →</a></p>
    `),
  };
}

export function visaCaseCreatedEmail(input: {
  caseNumber: string;
  serviceName: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Visa case ${input.caseNumber} created`,
    html: shell(`
      <h2 style="color:#081c3a;">Your visa case is open</h2>
      <p style="color:#4a5568;">Case <strong>${input.caseNumber}</strong> for ${input.serviceName}.</p>
      <p>Upload documents from your dashboard when ready. Visa approval is never guaranteed.</p>
      <p><a href="${input.dashboardUrl}" style="color:#c9a227;">Open My Visa Case →</a></p>
    `),
  };
}

export function documentReminderEmail(dashboardUrl: string): { subject: string; html: string } {
  return {
    subject: "Documents needed for your visa case",
    html: shell(`
      <h2 style="color:#081c3a;">Document reminder</h2>
      <p style="color:#4a5568;">Please upload remaining documents for your visa case.</p>
      <p><a href="${dashboardUrl}" style="color:#c9a227;">Upload documents →</a></p>
    `),
  };
}

export function expertAssignedEmail(expertName: string, dashboardUrl: string): { subject: string; html: string } {
  return {
    subject: "Expert assigned to your visa case",
    html: shell(`
      <h2 style="color:#081c3a;">Expert assigned</h2>
      <p style="color:#4a5568;">${expertName} has been assigned to your case. Message support through your dashboard.</p>
      <p><a href="${dashboardUrl}" style="color:#c9a227;">View case →</a></p>
    `),
  };
}

export function bookingConfirmationEmail(input: {
  serviceName: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  return {
    subject: "Booking confirmed — Globe Travel Voyage",
    html: shell(`
      <h2 style="color:#081c3a;">Booking confirmed</h2>
      <p style="color:#4a5568;">${input.serviceName} is confirmed. Track details in your dashboard.</p>
      <p><a href="${input.dashboardUrl}" style="color:#c9a227;">View bookings →</a></p>
    `),
  };
}
