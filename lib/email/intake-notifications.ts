"use server";

import { sendEmail } from "@/lib/email/send-email";
import { renderBrandedEmail, type EmailField } from "@/lib/email/templates";
import { SITE_CONFIG } from "@/lib/site-config";

export type IntakeKind =
  | "flight_booking"
  | "booking_request"
  | "visa_request"
  | "contact"
  | "provider_application";

const KIND_LABELS: Record<IntakeKind, string> = {
  flight_booking: "Flight booking request",
  booking_request: "Booking request",
  visa_request: "Visa request",
  contact: "Contact form",
  provider_application: "Provider application",
};

const CUSTOMER_INTROS: Record<IntakeKind, string> = {
  flight_booking:
    "Thank you. Your flight request has been received. A Globe Travel Voyage specialist will review the fare and contact you shortly before ticketing.",
  booking_request:
    "Thank you. Your booking request has been received. Our team will review the details and contact you shortly.",
  visa_request:
    "Thank you. Your visa request has been received. A member of our team will review your case and contact you shortly.",
  contact:
    "Thank you for contacting Globe Travel Voyage. We have received your message and will respond as soon as possible.",
  provider_application:
    "Thank you for applying to join Globe Travel Voyage as a verified provider. Our team will review your profile and contact you shortly.",
};

export interface IntakeNotificationInput {
  kind: IntakeKind;
  requestId?: string;
  customerName: string;
  customerEmail: string;
  fields: EmailField[];
  userId?: string | null;
  supportSubject?: string;
}

export async function sendIntakeNotifications(input: IntakeNotificationInput): Promise<void> {
  const kindLabel = KIND_LABELS[input.kind];
  const reference = input.requestId ? ` (Ref: ${input.requestId.slice(0, 8)})` : "";
  const supportSubject =
    input.supportSubject ?? `New ${kindLabel.toLowerCase()}${reference}`;

  const supportFields: EmailField[] = [
    { label: "Request type", value: kindLabel },
    ...(input.requestId ? [{ label: "Reference ID", value: input.requestId }] : []),
    { label: "Customer name", value: input.customerName },
    { label: "Customer email", value: input.customerEmail },
    ...input.fields,
  ];

  const supportHtml = renderBrandedEmail({
    title: `New ${kindLabel}`,
    intro: `A new ${kindLabel.toLowerCase()} was submitted on ${SITE_CONFIG.name}.`,
    fields: supportFields,
    footerNote: `Internal notification · ${SITE_CONFIG.supportEmail}`,
  });

  const customerHtml = renderBrandedEmail({
    title: "We received your request",
    intro: `Dear ${input.customerName}, ${CUSTOMER_INTROS[input.kind]}`,
    fields: input.fields.length > 0 ? input.fields : undefined,
    footerNote: `Need help sooner? Email us at ${SITE_CONFIG.supportEmail}.`,
  });

  try {
    const supportSent = await sendEmail({
      to: SITE_CONFIG.supportEmail,
      subject: supportSubject,
      html: supportHtml,
      type: "intake_support",
      userId: input.userId,
    });
    if (!supportSent) {
      console.warn("[email] intake support notification not sent", { kind: input.kind });
    }
  } catch (err) {
    console.error("[email] intake support notification failed", err);
  }

  try {
    const customerSent = await sendEmail({
      to: input.customerEmail,
      subject: `${SITE_CONFIG.name} — request received`,
      html: customerHtml,
      type: "intake_confirmation",
      userId: input.userId,
    });
    if (!customerSent) {
      console.warn("[email] intake customer confirmation not sent", {
        kind: input.kind,
        email: input.customerEmail,
      });
    }
  } catch (err) {
    console.error("[email] intake customer confirmation failed", err);
  }
}

/** Fire-and-forget wrapper — never blocks or fails the customer submission. */
export async function notifyIntakeSubmission(input: IntakeNotificationInput): Promise<void> {
  try {
    await sendIntakeNotifications(input);
  } catch (err) {
    console.error("[email] intake notification pipeline failed", err);
  }
}
