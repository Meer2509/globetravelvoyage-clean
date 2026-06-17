import type { AdminIntakeTable } from "./admin-intake-actions";

export const ADMIN_INTAKE_STATUSES = [
  "new",
  "pending",
  "reviewing",
  "contacted",
  "approved",
  "rejected",
  "confirmed",
  "closed",
  "paid",
  "converted",
] as const;

export const SUPPORT_TICKET_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
] as const;

export const REFERRAL_STATUSES = ["pending", "converted", "paid"] as const;

export type AdminIntakeStatus = (typeof ADMIN_INTAKE_STATUSES)[number];

export function getIntakeStatusesForTable(table: AdminIntakeTable): readonly string[] {
  if (table === "support_messages") return SUPPORT_TICKET_STATUSES;
  if (table === "referrals") return REFERRAL_STATUSES;
  return ADMIN_INTAKE_STATUSES;
}

export const INTAKE_STATUS_STYLES: Record<string, string> = {
  new: "bg-blue/10 text-blue border-blue/20",
  pending: "bg-gold/10 text-gold border-gold/30",
  reviewing: "bg-purple-50 text-purple-700 border-purple-200",
  contacted: "bg-navy/5 text-navy border-navy/15",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-soft text-charcoal/55 border-soft-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  converted: "bg-blue/10 text-blue border-blue/20",
  open: "bg-gold/10 text-gold border-gold/30",
  in_progress: "bg-blue/10 text-blue border-blue/20",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function rowsToCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}
