import { createAdminClient } from "@/lib/supabase/admin";

/** Generate invoice number GTV-YYYYMMDD-XXXX */
export async function generateInvoiceNumber(): Promise<string> {
  const admin = createAdminClient();
  const date = new Date();
  const ymd =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");

  let seq = 1;
  if (admin) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    const { count } = await admin
      .from("payments")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay);
    seq = (count ?? 0) + 1;
  } else {
    seq = Math.floor(Math.random() * 9000) + 1000;
  }

  return `GTV-${ymd}-${String(seq).padStart(4, "0")}`;
}

export function formatInvoiceNumberFromPaymentId(paymentId: string): string {
  return `GTV-${paymentId.slice(0, 8).toUpperCase()}`;
}
