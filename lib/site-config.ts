export const SITE_CONFIG = {
  name: "Globe Travel Voyage",
  domain: "globetravelvoyage.com",
  supportEmail: "support@globetravelvoyage.com",
} as const;

export const FORM_SUBMIT_SUCCESS_MESSAGE =
  "Thank you! Your request has been received. Our Globe Travel Voyage support team will review it and contact you shortly.";

export const supportMailto = `mailto:${SITE_CONFIG.supportEmail}`;

export function supportFromAddress(name = SITE_CONFIG.name): string {
  return `${name} <${SITE_CONFIG.supportEmail}>`;
}
