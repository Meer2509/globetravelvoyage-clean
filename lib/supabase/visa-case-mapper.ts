"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { VISA_DOCUMENT_CHECKLIST } from "@/lib/visa-case-checklist";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";

export async function mapVisaCaseRow(
  row: Record<string, unknown>,
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>
): Promise<VisaCaseData | null> {
  if (!supabase) return null;

  const caseId = row.id as string;
  let payment: Record<string, unknown> | null = null;

  if (row.payment_id) {
    const { data } = await supabase
      .from("payments")
      .select("status, amount, currency, invoice_number, service_type, description")
      .eq("id", row.payment_id as string)
      .maybeSingle();
    payment = data as Record<string, unknown> | null;
  }

  const { data: docs } = await supabase
    .from("case_documents")
    .select("id, document_type, file_name, file_url, status, is_required, notes")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });

  let checklist: VisaCaseData["checklist"] = (docs ?? []).map((d) => {
    const doc = d as {
      id: string;
      document_type: string;
      status: string;
      is_required: boolean | null;
      notes: string | null;
    };
    return {
      id: doc.id,
      name: doc.document_type,
      status: doc.status ?? "pending",
      documentId: doc.id,
      required: doc.is_required ?? true,
      notes: doc.notes,
    };
  });

  if (checklist.length === 0) {
    checklist = VISA_DOCUMENT_CHECKLIST.map((item) => ({
      name: item.documentType,
      status: "pending",
      required: item.required,
      notes: null as string | null,
    }));
  }

  return {
    id: caseId,
    caseNumber: (row.case_number as string) ?? caseId.slice(0, 12),
    visaType: (row.visa_type as string) ?? (row.service_name as string) ?? "Visa Service",
    destinationCountry: (row.visa_country as string) ?? "—",
    status: (row.status as string) ?? "documents_needed",
    progressPercent: (row.progress_percent as number) ?? 15,
    currentStep: (row.current_step as string) ?? "Upload required documents",
    assignedExpert: row.provider_user_id ? "Expert assigned" : null,
    serviceProductKey: (payment?.service_type as string) ?? null,
    serviceName: (row.service_name as string) ?? null,
    paymentStatus: (payment?.status as string) ?? "paid",
    paymentId: (row.payment_id as string) ?? null,
    amount: payment?.amount != null ? Number(payment.amount) : null,
    currency: (payment?.currency as string) ?? "USD",
    invoiceNumber: (payment?.invoice_number as string) ?? null,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    checklist,
  };
}
