"use server";

import { sendEmail } from "@/lib/email/send-email";
import { renderBrandedEmail } from "@/lib/email/templates";
import { SITE_CONFIG } from "@/lib/site-config";
import { ROLE_LABELS } from "@/lib/auth";
import { ROLE_ONBOARDING } from "@/lib/auth";
import type { ProviderAcquisitionRole } from "./types";

function providerRegisterUrl(role: ProviderAcquisitionRole, refCode?: string): string {
  const paramMap: Record<ProviderAcquisitionRole, string> = {
    visa_agent: "agent",
    travel_agency: "agency",
    tour_guide: "guide",
    property_host: "host",
  };
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://globetravelvoyage.com";
  const ref = refCode ? `&ref=${encodeURIComponent(refCode)}` : "";
  return `${base}/register?role=${paramMap[role]}${ref}`;
}

export async function sendProviderOnboardingWelcome(input: {
  to: string;
  userId?: string;
  providerRole: ProviderAcquisitionRole;
  fullName?: string;
}): Promise<void> {
  const roleLabel = ROLE_LABELS[input.providerRole];
  const onboardingUrl = `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://globetravelvoyage.com"}${ROLE_ONBOARDING[input.providerRole]}`;

  const html = renderBrandedEmail({
    title: `Welcome, ${roleLabel}!`,
    intro: `Hi ${input.fullName ?? "there"}, thanks for joining ${SITE_CONFIG.name} as a ${roleLabel.toLowerCase()}. Complete your onboarding to start receiving verified traveler inquiries.`,
    bodyHtml: `<p style="margin:20px 0 0;text-align:center;">
      <a href="${onboardingUrl}" style="display:inline-block;background:#072B61;color:#F8FAFC;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">
        Continue onboarding →
      </a>
    </p>`,
    footerNote: `Questions? Email ${SITE_CONFIG.supportEmail}`,
  });

  await sendEmail({
    to: input.to,
    subject: `${SITE_CONFIG.name} — complete your ${roleLabel} onboarding`,
    html,
    type: "intake_confirmation",
    userId: input.userId,
  });
}

export async function sendProviderOnboardingRecovery(input: {
  to: string;
  userId?: string;
  providerRole: ProviderAcquisitionRole;
  completionScore: number;
}): Promise<void> {
  const roleLabel = ROLE_LABELS[input.providerRole];
  const onboardingUrl = `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://globetravelvoyage.com"}${ROLE_ONBOARDING[input.providerRole]}`;

  const html = renderBrandedEmail({
    title: "Finish your provider application",
    intro: `You're ${input.completionScore}% through ${roleLabel} onboarding on ${SITE_CONFIG.name}. Complete your profile to join the verified marketplace and start receiving leads.`,
    bodyHtml: `<p style="margin:20px 0 0;text-align:center;">
      <a href="${onboardingUrl}" style="display:inline-block;background:#D4AF37;color:#072B61;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">
        Resume onboarding
      </a>
    </p>`,
    footerNote: `Need help? ${SITE_CONFIG.supportEmail}`,
  });

  await sendEmail({
    to: input.to,
    subject: `${SITE_CONFIG.name} — your provider application is ${input.completionScore}% complete`,
    html,
    type: "intake_confirmation",
    userId: input.userId,
  });
}

export async function sendProviderApprovalNotification(input: {
  to: string;
  userId?: string;
  providerRole: ProviderAcquisitionRole;
  fullName?: string;
}): Promise<void> {
  const roleLabel = ROLE_LABELS[input.providerRole];
  const dashboardMap: Record<ProviderAcquisitionRole, string> = {
    visa_agent: "/dashboard/agent",
    travel_agency: "/dashboard/agency",
    tour_guide: "/dashboard/guide",
    property_host: "/dashboard/host",
  };
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://globetravelvoyage.com"}${dashboardMap[input.providerRole]}`;

  const html = renderBrandedEmail({
    title: "You're verified!",
    intro: `Congratulations${input.fullName ? `, ${input.fullName}` : ""}! Your ${roleLabel.toLowerCase()} profile on ${SITE_CONFIG.name} has been approved. You're now live on the marketplace.`,
    fields: [
      { label: "Status", value: "Verified provider" },
      { label: "Next step", value: "Add services and connect Stripe payouts" },
    ],
    bodyHtml: `<p style="margin:20px 0 0;text-align:center;">
      <a href="${dashboardUrl}" style="display:inline-block;background:#072B61;color:#F8FAFC;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">
        Open dashboard
      </a>
    </p>`,
    footerNote: `Welcome to the ${SITE_CONFIG.name} provider network.`,
  });

  await sendEmail({
    to: input.to,
    subject: `${SITE_CONFIG.name} — your ${roleLabel} profile is approved`,
    html,
    type: "intake_confirmation",
    userId: input.userId,
  });
}

export async function sendProviderInviteEmail(input: {
  to: string;
  referrerCode: string;
  providerRole: ProviderAcquisitionRole;
  message?: string;
}): Promise<void> {
  const roleLabel = ROLE_LABELS[input.providerRole];
  const joinUrl = providerRegisterUrl(input.providerRole, input.referrerCode);

  const html = renderBrandedEmail({
    title: `Join ${SITE_CONFIG.name} as a ${roleLabel}`,
    intro: `You've been invited to list your services on ${SITE_CONFIG.name}${input.message ? `: "${input.message}"` : "."}`,
    fields: [{ label: "Provider type", value: roleLabel }],
    bodyHtml: `<p style="margin:20px 0 0;text-align:center;">
      <a href="${joinUrl}" style="display:inline-block;background:#072B61;color:#F8FAFC;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">
        Accept invitation
      </a>
    </p>`,
    footerNote: `Referral code: ${input.referrerCode}`,
  });

  await sendEmail({
    to: input.to,
    subject: `You're invited to join ${SITE_CONFIG.name} as a ${roleLabel}`,
    html,
    type: "intake_confirmation",
  });
}

export async function sendIncompleteOnboardingRecoveryBatch(limit = 20): Promise<number> {
  const { fetchIncompleteProviderOnboardings } = await import("./onboarding-progress");
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  if (!admin) return 0;

  const rows = await fetchIncompleteProviderOnboardings(limit);
  let sent = 0;

  for (const row of rows) {
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", row.user_id)
      .maybeSingle();

    if (!profile) continue;
    const p = profile as { email: string; full_name: string };
    if (!p.email) continue;

    const { data: progress } = await admin
      .from("provider_onboarding_progress")
      .select("recovery_sent_at")
      .eq("user_id", row.user_id)
      .eq("provider_role", row.provider_role)
      .maybeSingle();

    if ((progress as { recovery_sent_at?: string } | null)?.recovery_sent_at) continue;

    await sendProviderOnboardingRecovery({
      to: p.email,
      userId: row.user_id,
      providerRole: row.provider_role as ProviderAcquisitionRole,
      completionScore: row.completion_score,
    });

    await admin
      .from("provider_onboarding_progress")
      .update({ recovery_sent_at: new Date().toISOString() })
      .eq("user_id", row.user_id)
      .eq("provider_role", row.provider_role);

    sent += 1;
  }

  return sent;
}
