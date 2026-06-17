"use server";

import { requireAdmin } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizeAdminBookingRow,
  type AdminBookingRequest,
} from "@/lib/admin/booking-requests";
import type { BookingRequest } from "@/lib/supabase/types";

export async function fetchAllBookingRequestsForAdmin(): Promise<{
  bookings: AdminBookingRequest[];
  error?: string;
}> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) {
    return { bookings: [], error: adminAuth.error };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { bookings: [], error: "Supabase is not configured." };
  }

  const { data, error } = await admin
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) {
    console.error("[admin/bookings] fetch failed", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return { bookings: [], error: error.message };
  }

  return {
    bookings: (data ?? []).map((row) =>
      normalizeAdminBookingRow(row as BookingRequest & Record<string, unknown>)
    ),
  };
}
