"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { requireAdmin } from "@/lib/auth-server";
import { sendEmail } from "@/lib/email/send-email";
import { renderBrandedEmail } from "@/lib/email/templates";
import { SITE_CONFIG } from "@/lib/site-config";
import { trackGrowthEvent } from "./track-event";
import type { AbandonedInquiryType } from "./types";

export type AbandonedResult = { ok: true; id: string } | { ok: false; error: string };

async function getOptionalUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function saveAbandonedInquiry(input: {
  inquiryType: AbandonedInquiryType;
  email?: string;
  draftData: Record<string, unknown>;
  sourcePath?: string;
  utmSource?: string;
  sessionId?: string;
}): Promise<AbandonedResult> {
  if (!input.email?.includes("@")) {
    return { ok: false, error: "Email required to save draft." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const userId = await getOptionalUserId();

  const { data: existing } = await admin
    .from("abandoned_inquiries")
    .select("id")
    .eq("email", input.email.trim())
    .eq("inquiry_type", input.inquiryType)
    .eq("status", "draft")
    .maybeSingle();

  const payload = {
    inquiry_type: input.inquiryType,
    email: input.email.trim(),
    user_id: userId,
    session_id: input.sessionId ?? null,
    draft_data: input.draftData,
    source_path: input.sourcePath ?? null,
    utm_source: input.utmSource ?? null,
    status: "draft",
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await admin
      .from("abandoned_inquiries")
      .update(payload)
      .eq("id", (existing as { id: string }).id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: (existing as { id: string }).id };
  }

  const { data, error } = await admin
    .from("abandoned_inquiries")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error)) return { ok: false, error: "Abandoned inquiry tracking is not available." };
    return { ok: false, error: error.message };
  }

  return { ok: true, id: (data as { id: string }).id };
}

export async function markAbandonedInquirySubmitted(
  email: string,
  inquiryType: AbandonedInquiryType,
  submittedRecordId: string
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("abandoned_inquiries")
    .update({
      status: "submitted",
      submitted_record_id: submittedRecordId,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email.trim())
    .eq("inquiry_type", inquiryType)
    .in("status", ["draft", "recovery_sent"]);
}

const RECOVERY_LINKS: Record<AbandonedInquiryType, string> = {
  visa: "/visa/start",
  flight: "/flights",
  booking: "/booking/request",
  property: "/properties",
  agent: "/travel-agents",
  tour: "/group-tours",
  concierge: "/concierge",
  lead: "/lead/contact",
};

export async function sendAbandonedInquiryRecovery(inquiryId: string): Promise<AbandonedResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: row, error } = await admin
    .from("abandoned_inquiries")
    .select("id, inquiry_type, email, draft_data, status")
    .eq("id", inquiryId)
    .maybeSingle();

  if (error || !row) return { ok: false, error: "Inquiry not found." };

  const inquiry = row as {
    id: string;
    inquiry_type: AbandonedInquiryType;
    email: string;
    draft_data: Record<string, unknown>;
    status: string;
  };

  if (!inquiry.email) return { ok: false, error: "No email on record." };

  const resumePath = RECOVERY_LINKS[inquiry.inquiry_type] ?? "/";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://globetravelvoyage.com";
  const resumeUrl = `${siteUrl}${resumePath}`;

  const html = renderBrandedEmail({
    title: "Complete your travel request",
    intro: `You started a ${inquiry.inquiry_type.replace(/_/g, " ")} request on ${SITE_CONFIG.name} but didn't finish. Our team saved your progress — pick up where you left off.`,
    fields: Object.entries(inquiry.draft_data ?? {})
      .slice(0, 6)
      .map(([label, value]) => ({ label: label.replace(/_/g, " "), value: String(value ?? "") })),
    bodyHtml: `<p style="margin:20px 0 0;text-align:center;">
      <a href="${resumeUrl}" style="display:inline-block;background:#072B61;color:#F8FAFC;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">
        Complete my request
      </a>
    </p>`,
    footerNote: `Questions? Email ${SITE_CONFIG.supportEmail}`,
  });

  await sendEmail({
    to: inquiry.email,
    subject: `${SITE_CONFIG.name} — complete your travel request`,
    html,
    type: "intake_confirmation",
  });

  await admin
    .from("abandoned_inquiries")
    .update({
      status: "recovery_sent",
      recovery_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", inquiryId);

  return { ok: true, id: inquiryId };
}

export async function dismissAbandonedInquiry(inquiryId: string): Promise<AbandonedResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { error } = await admin
    .from("abandoned_inquiries")
    .update({ status: "dismissed", updated_at: new Date().toISOString() })
    .eq("id", inquiryId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: inquiryId };
}

export async function captureEmailLead(input: {
  email: string;
  name?: string;
  source: string;
  pagePath?: string;
}): Promise<AbandonedResult> {
  if (!input.email.includes("@")) return { ok: false, error: "Valid email required." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const userId = await getOptionalUserId();

  const { data, error } = await admin
    .from("lead_requests")
    .insert({
      user_id: userId,
      customer_id: userId,
      full_name: input.name?.trim() || "Subscriber",
      email: input.email.trim(),
      lead_type: "email_capture",
      message: `Email capture: ${input.source}`,
      extra_data: { source: input.source, page_path: input.pagePath ?? null },
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error)) return { ok: false, error: "Lead capture is not available." };
    return { ok: false, error: error.message };
  }

  const id = (data as { id: string }).id;

  trackGrowthEvent({
    eventType: "email_capture",
    userId,
    email: input.email.trim(),
    relatedId: id,
    metadata: { source: input.source, page_path: input.pagePath },
  });

  return { ok: true, id };
}
