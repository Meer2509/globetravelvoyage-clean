"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { SITE_CONFIG, supportFromAddress } from "@/lib/site-config";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || supportFromAddress();

export type EmailType =
  | "welcome"
  | "payment_confirmation"
  | "visa_case_created"
  | "document_reminder"
  | "expert_assigned"
  | "booking_confirmation";

async function logEmailEvent(input: {
  userId?: string | null;
  email: string;
  subject: string;
  type: EmailType;
  status: "sent" | "logged" | "failed";
}): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  const { error } = await admin.from("email_logs").insert({
    user_id: input.userId ?? null,
    email: input.email,
    subject: input.subject,
    type: input.type,
    status: input.status,
  });
  if (error && !isMissingTableError(error)) {
    console.error("email_logs insert failed:", error.message);
  }
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
  userId?: string | null;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    await logEmailEvent({
      userId: input.userId,
      email: input.to,
      subject: input.subject,
      type: input.type,
      status: "logged",
    });
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
    });

    const ok = res.ok;
    await logEmailEvent({
      userId: input.userId,
      email: input.to,
      subject: input.subject,
      type: input.type,
      status: ok ? "sent" : "failed",
    });
    return ok;
  } catch {
    await logEmailEvent({
      userId: input.userId,
      email: input.to,
      subject: input.subject,
      type: input.type,
      status: "failed",
    });
    return false;
  }
}
