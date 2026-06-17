import { SITE_CONFIG } from "@/lib/site-config";

export interface EmailField {
  label: string;
  value?: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatValue(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? escapeHtml(trimmed) : "—";
}

export function renderFieldTable(fields: EmailField[]): string {
  const rows = fields
    .filter((f) => f.value !== undefined)
    .map(
      (f) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;color:#64748B;font-size:13px;width:38%;vertical-align:top;">
            ${escapeHtml(f.label)}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;color:#072B61;font-size:13px;font-weight:600;vertical-align:top;">
            ${formatValue(f.value)}
          </td>
        </tr>`
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:16px;">
      ${rows}
    </table>`;
}

export function renderBrandedEmail(input: {
  title: string;
  intro: string;
  fields?: EmailField[];
  bodyHtml?: string;
  footerNote?: string;
}): string {
  const fieldsBlock = input.fields?.length ? renderFieldTable(input.fields) : "";
  const extra = input.bodyHtml ?? "";
  const footer = input.footerNote ?? `Questions? Reply to ${SITE_CONFIG.supportEmail}.`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td style="background:linear-gradient(135deg,#072B61 0%,#041C43 100%);padding:28px 24px;text-align:center;">
        <p style="margin:0;color:#D4AF37;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;">Globe Travel Voyage</p>
        <h1 style="margin:8px 0 0;color:#F8FAFC;font-size:22px;font-weight:800;line-height:1.3;">${escapeHtml(input.title)}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:14px;border:1px solid #E2E8F0;overflow:hidden;box-shadow:0 8px 30px rgba(7,43,97,0.08);">
          <tr>
            <td style="padding:28px 24px;">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">${escapeHtml(input.intro)}</p>
              ${extra}
              ${fieldsBlock}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 20px 32px;text-align:center;">
        <p style="margin:0;color:#94A3B8;font-size:12px;line-height:1.5;">${escapeHtml(footer)}</p>
        <p style="margin:8px 0 0;color:#94A3B8;font-size:11px;">© ${new Date().getFullYear()} ${SITE_CONFIG.name}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function visaCaseCreatedEmail(input: {
  caseNumber: string;
  serviceName: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const dashboardUrl = escapeHtml(input.dashboardUrl);
  return {
    subject: `${SITE_CONFIG.name} — visa case ${input.caseNumber} created`,
    html: renderBrandedEmail({
      title: "Your visa case is open",
      intro: `Your ${input.serviceName} case (${input.caseNumber}) has been created. Track progress and upload documents from your dashboard.`,
      bodyHtml: `<p style="margin:20px 0 0;text-align:center;">
        <a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#072B61;color:#F8FAFC;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
          View your case
        </a>
      </p>`,
      footerNote: `Need help? Contact ${SITE_CONFIG.supportEmail}.`,
    }),
  };
}
