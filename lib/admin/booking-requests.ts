import type { BookingRequest } from "@/lib/supabase/types";

export const BOOKING_STATUSES = [
  "new",
  "reviewing",
  "contacted",
  "confirmed",
  "closed",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface AdminBookingRequest {
  id: string;
  service: string;
  subject: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  route: string | null;
  passengerCount: number | null;
  travelDate: string | null;
  returnDate: string | null;
  cabinClass: string | null;
  status: string;
  createdAt: string;
}

type BookingRow = BookingRequest & Record<string, unknown>;

export function normalizeBookingStatus(status: string | null | undefined): string {
  const value = (status ?? "new").toLowerCase();
  if (value === "pending") return "new";
  return BOOKING_STATUSES.includes(value as BookingStatus) ? value : "new";
}

export function normalizeAdminBookingRow(row: BookingRow): AdminBookingRequest {
  const from = (row.from_location as string | null) ?? null;
  const to = (row.to_location as string | null) ?? null;
  const legacyFrom = row.from as string | undefined;
  const legacyTo = row.to as string | undefined;

  return {
    id: row.id,
    service: row.service ?? (row.service_type as string | undefined) ?? "—",
    subject: row.subject ?? (row.service_name as string | undefined) ?? null,
    customerName: row.customer_name ?? (row.full_name as string | undefined) ?? "—",
    customerEmail: row.customer_email ?? (row.email as string | undefined) ?? "—",
    customerPhone: row.customer_phone ?? (row.phone as string | undefined) ?? null,
    route:
      from && to
        ? `${from} → ${to}`
        : legacyFrom && legacyTo
          ? `${legacyFrom} → ${legacyTo}`
          : null,
    passengerCount: row.passenger_count ?? (row.travelers as number | undefined) ?? null,
    travelDate: row.travel_date ?? (row.start_date as string | undefined) ?? null,
    returnDate: row.return_date ?? (row.end_date as string | undefined) ?? null,
    cabinClass: row.cabin_class ?? null,
    status: normalizeBookingStatus(row.status),
    createdAt: row.created_at,
  };
}

export function formatAdminDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatAdminDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue/10 text-blue border-blue/25",
  reviewing: "bg-gold/15 text-navy border-gold/35",
  contacted: "bg-violet-50 text-violet-700 border-violet-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-soft text-charcoal/55 border-soft-200",
};
