"use server";

import { createAdminClient } from "./admin";
import { createServerSupabaseClient } from "./server";
import { requireAdmin, requireSession } from "@/lib/auth-server";
import { notifyIntakeSubmission } from "@/lib/email/intake-notifications";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";
import { enforceRateLimit } from "@/lib/rate-limit";
import { logAdminAudit } from "@/lib/admin/phase1-actions";
import { parseCommaList } from "./profile-utils";
import {
  GROUP_TOUR_SELECT,
  PUBLIC_GROUP_TOUR_STATUSES,
  type GroupTourRow,
  type GroupTourStatus,
} from "./group-tour-types";
import { fetchMyTravelAgentProfile } from "./travel-agent-actions";

export type GroupTourActionResult<T = { id: string }> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function adminDb() {
  return createAdminClient();
}

async function getOptionalUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function normalizeTour(row: Record<string, unknown>): GroupTourRow {
  return {
    ...(row as GroupTourRow),
    included_items: (row.included_items as string[]) ?? [],
    excluded_items: (row.excluded_items as string[]) ?? [],
    featured: Boolean(row.featured),
    price: row.price != null ? Number(row.price) : null,
    rating: row.rating != null ? Number(row.rating) : 0,
    review_count: row.review_count != null ? Number(row.review_count) : 0,
    seat_limit: Number(row.seat_limit ?? 0),
    seats_booked: Number(row.seats_booked ?? 0),
  };
}

async function attachAgentNames(tours: GroupTourRow[]): Promise<GroupTourRow[]> {
  const admin = adminDb();
  if (!admin || !tours.length) return tours;

  const profileIds = [...new Set(tours.map((t) => t.agent_profile_id))];
  const { data } = await admin
    .from("travel_agent_profiles")
    .select("id, full_name, agency_name")
    .in("id", profileIds);

  const map = new Map<string, { full_name: string; agency_name: string | null }>();
  for (const p of data ?? []) {
    const row = p as { id: string; full_name: string; agency_name: string | null };
    map.set(row.id, row);
  }

  return tours.map((t) => {
    const agent = map.get(t.agent_profile_id);
    return {
      ...t,
      agent_name: agent?.full_name ?? null,
      agency_name: agent?.agency_name ?? null,
    };
  });
}

// ── Public ────────────────────────────────────────────────────────────────────

export async function fetchPublicGroupTours(): Promise<GroupTourRow[]> {
  const admin = adminDb();
  if (!admin) return [];

  const { data, error } = await admin
    .from("group_tours")
    .select(GROUP_TOUR_SELECT)
    .in("status", [...PUBLIC_GROUP_TOUR_STATUSES])
    .order("featured", { ascending: false })
    .order("start_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[group-tours] fetch public failed", error.message);
    return [];
  }

  const tours = (data ?? []).map((r) => normalizeTour(r as Record<string, unknown>));
  return attachAgentNames(tours.filter((t) => t.seat_limit > t.seats_booked));
}

export async function fetchPublicGroupTourById(id: string): Promise<GroupTourRow | null> {
  const admin = adminDb();
  if (!admin) return null;

  const { data, error } = await admin
    .from("group_tours")
    .select(GROUP_TOUR_SELECT)
    .eq("id", id)
    .in("status", [...PUBLIC_GROUP_TOUR_STATUSES])
    .maybeSingle();

  if (error || !data) return null;
  const tour = normalizeTour(data as Record<string, unknown>);
  if (tour.seat_limit <= tour.seats_booked) return null;
  const [withAgent] = await attachAgentNames([tour]);
  return withAgent;
}

// ── Agent ─────────────────────────────────────────────────────────────────────

export async function fetchMyGroupTours(): Promise<{ tours: GroupTourRow[]; error?: string }> {
  const session = await requireSession();
  if (!session.ok) return { tours: [], error: session.error };

  const admin = adminDb();
  if (!admin) return { tours: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("group_tours")
    .select(GROUP_TOUR_SELECT)
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) return { tours: [], error: error.message };
  return { tours: (data ?? []).map((r) => normalizeTour(r as Record<string, unknown>)) };
}

export async function saveGroupTour(input: {
  id?: string;
  title: string;
  destination: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  price?: number | null;
  currency?: string;
  seatLimit: number;
  itinerary?: string;
  includedItems?: string[];
  excludedItems?: string[];
  cancellationPolicy?: string;
  status?: "draft" | "pending";
}): Promise<GroupTourActionResult> {
  const session = await requireSession();
  if (!session.ok) return { ok: false, error: session.error };

  const profileResult = await fetchMyTravelAgentProfile();
  if (!profileResult.profile) {
    return { ok: false, error: "Create your travel agent profile before listing group tours." };
  }

  const nextStatus = input.status ?? "draft";
  if (nextStatus === "pending" && profileResult.profile.verification_status !== "verified") {
    return { ok: false, error: "Only verified travel agents can submit tours for review." };
  }

  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const payload = {
    agent_profile_id: profileResult.profile.id,
    user_id: session.userId,
    title: input.title.trim(),
    destination: input.destination.trim(),
    description: input.description?.trim() || null,
    start_date: input.startDate || null,
    end_date: input.endDate || null,
    price: input.price ?? null,
    currency: input.currency?.trim() || "USD",
    seat_limit: Math.max(1, input.seatLimit),
    itinerary: input.itinerary?.trim() || null,
    included_items: input.includedItems ?? [],
    excluded_items: input.excludedItems ?? [],
    cancellation_policy: input.cancellationPolicy?.trim() || null,
    status: input.status ?? "draft",
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data: existing } = await admin
      .from("group_tours")
      .select("id, user_id, status")
      .eq("id", input.id)
      .maybeSingle();

    if (!existing || (existing as { user_id: string }).user_id !== session.userId) {
      return { ok: false, error: "Tour not found." };
    }

    const currentStatus = (existing as { status: string }).status;
    if (!["draft", "pending", "rejected"].includes(currentStatus) && input.status === "pending") {
      return { ok: false, error: "This tour cannot be re-submitted in its current status." };
    }

    const { data, error } = await admin
      .from("group_tours")
      .update(payload)
      .eq("id", input.id)
      .select("id")
      .single();

    if (error) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
    return { ok: true, data: { id: (data as { id: string }).id } };
  }

  const { data, error } = await admin
    .from("group_tours")
    .insert({ ...payload, seats_booked: 0 })
    .select("id")
    .single();

  if (error) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function submitGroupTourForReview(tourId: string): Promise<GroupTourActionResult> {
  const session = await requireSession();
  if (!session.ok) return { ok: false, error: session.error };

  const profileResult = await fetchMyTravelAgentProfile();
  if (!profileResult.profile || profileResult.profile.verification_status !== "verified") {
    return { ok: false, error: "Only verified travel agents can submit tours for review." };
  }

  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const { data, error } = await admin
    .from("group_tours")
    .update({ status: "pending", updated_at: new Date().toISOString() })
    .eq("id", tourId)
    .eq("user_id", session.userId)
    .in("status", ["draft", "rejected"])
    .select("id")
    .maybeSingle();

  if (error || !data) return { ok: false, error: "Could not submit tour for review." };
  return { ok: true, data: { id: tourId } };
}

export async function fetchMyGroupTourRequests(): Promise<{
  rows: Array<Record<string, unknown>>;
  error?: string;
}> {
  const session = await requireSession();
  if (!session.ok) return { rows: [], error: session.error };

  const admin = adminDb();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data: myTours } = await admin
    .from("group_tours")
    .select("id")
    .eq("user_id", session.userId);

  const tourIds = (myTours ?? []).map((t) => (t as { id: string }).id);
  if (!tourIds.length) return { rows: [] };

  const { data, error } = await admin
    .from("group_tour_requests")
    .select("*")
    .in("tour_id", tourIds)
    .order("created_at", { ascending: false });

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as Array<Record<string, unknown>> };
}

// ── Customer join request ─────────────────────────────────────────────────────

export async function submitGroupTourRequest(input: {
  tourId: string;
  fullName: string;
  email: string;
  phone?: string;
  travelerCount: number;
  travelerInfo?: string;
  message?: string;
}): Promise<GroupTourActionResult> {
  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const userId = await getOptionalUserId();
  const rateBlocked = await enforceRateLimit("form", userId);
  if (!rateBlocked.ok) return { ok: false, error: rateBlocked.error };

  const { data: tour } = await admin
    .from("group_tours")
    .select("id, title, destination, status, seat_limit, seats_booked, start_date, price, currency")
    .eq("id", input.tourId)
    .in("status", [...PUBLIC_GROUP_TOUR_STATUSES])
    .maybeSingle();

  if (!tour) return { ok: false, error: "This group tour is not available." };

  const row = tour as {
    title: string;
    destination: string;
    seat_limit: number;
    seats_booked: number;
    start_date: string | null;
    price: number | null;
    currency: string;
  };

  const seatsRemaining = row.seat_limit - row.seats_booked;
  const travelers = Math.max(1, input.travelerCount);
  if (travelers > seatsRemaining) {
    return { ok: false, error: `Only ${seatsRemaining} seat(s) remaining.` };
  }

  const { data, error } = await admin
    .from("group_tour_requests")
    .insert({
      tour_id: input.tourId,
      user_id: userId,
      full_name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      traveler_count: travelers,
      traveler_info: input.travelerInfo?.trim() || null,
      message: input.message?.trim() || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const priceLabel =
    row.price != null ? `${row.currency} ${Number(row.price).toLocaleString()}` : "Quote on request";

  notifyIntakeSubmission({
    kind: "booking_request",
    requestId: data.id,
    customerName: input.fullName,
    customerEmail: input.email,
    userId,
    supportSubject: `Group tour join request: ${row.title}`,
    fields: [
      { label: "Tour", value: row.title },
      { label: "Destination", value: row.destination },
      { label: "Departure", value: row.start_date ?? "—" },
      { label: "Price", value: priceLabel },
      { label: "Travelers", value: String(travelers) },
      { label: "Phone", value: input.phone ?? "—" },
      { label: "Traveler info", value: input.travelerInfo ?? "—" },
      { label: "Message", value: input.message ?? "—" },
      { label: "Payment", value: "Booking request — pay later" },
    ],
  }).catch((e) => console.error("[group-tour-request] email failed", e));

  return { ok: true, data: { id: (data as { id: string }).id } };
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function fetchAllGroupToursForAdmin(): Promise<{
  rows: GroupTourRow[];
  error?: string;
}> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { rows: [], error: adminAuth.error };

  const admin = adminDb();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("group_tours")
    .select(GROUP_TOUR_SELECT)
    .order("created_at", { ascending: false });

  if (error) return { rows: [], error: error.message };
  const tours = (data ?? []).map((r) => normalizeTour(r as Record<string, unknown>));
  return { rows: await attachAgentNames(tours) };
}

export async function fetchGroupTourRequestsForAdmin(): Promise<{
  rows: Array<Record<string, unknown>>;
  error?: string;
}> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { rows: [], error: adminAuth.error };

  const admin = adminDb();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("group_tour_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as Array<Record<string, unknown>> };
}

async function adminPatchTour(
  tourId: string,
  patch: Record<string, unknown>,
  auditAction: string
): Promise<GroupTourActionResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { error } = await admin
    .from("group_tours")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", tourId);

  if (error) return { ok: false, error: error.message };

  await logAdminAudit({
    action: auditAction,
    entityType: "group_tours",
    entityId: tourId,
    metadata: patch,
  });

  return { ok: true, data: { id: tourId } };
}

export async function adminApproveGroupTour(tourId: string): Promise<GroupTourActionResult> {
  return adminPatchTour(tourId, { status: "active" }, "group_tour.approve");
}

export async function adminRejectGroupTour(tourId: string): Promise<GroupTourActionResult> {
  return adminPatchTour(tourId, { status: "rejected", featured: false }, "group_tour.reject");
}

export async function adminFeatureGroupTour(
  tourId: string,
  featured: boolean
): Promise<GroupTourActionResult> {
  const admin = adminDb();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: tour } = await admin
    .from("group_tours")
    .select("status")
    .eq("id", tourId)
    .maybeSingle();

  if (!tour || !PUBLIC_GROUP_TOUR_STATUSES.includes((tour as { status: string }).status as "approved" | "active")) {
    return { ok: false, error: "Only approved or active tours can be featured." };
  }

  return adminPatchTour(tourId, { featured }, featured ? "group_tour.feature" : "group_tour.unfeature");
}

export async function adminCloseGroupTour(tourId: string): Promise<GroupTourActionResult> {
  return adminPatchTour(tourId, { status: "closed", featured: false }, "group_tour.close");
}

export async function adminUpdateGroupTourStatus(
  tourId: string,
  status: GroupTourStatus
): Promise<GroupTourActionResult> {
  const patch: Record<string, unknown> = { status };
  if (status !== "active" && status !== "approved") patch.featured = false;
  return adminPatchTour(tourId, patch, "group_tour.status");
}

export async function adminUpdateGroupTourNotes(
  tourId: string,
  notes: string
): Promise<GroupTourActionResult> {
  return adminPatchTour(tourId, { admin_notes: notes.trim() || null }, "group_tour.notes");
}

export async function adminUpdateGroupTourRequestStatus(
  requestId: string,
  status: string
): Promise<GroupTourActionResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: requestRow, error: fetchError } = await admin
    .from("group_tour_requests")
    .select("id, status, tour_id, traveler_count, full_name, email, phone, message")
    .eq("id", requestId)
    .maybeSingle();

  if (fetchError) return { ok: false, error: fetchError.message };
  if (!requestRow) return { ok: false, error: "Request not found." };

  const request = requestRow as {
    id: string;
    status: string;
    tour_id: string;
    traveler_count: number;
    full_name: string;
    email: string;
    phone: string | null;
    message: string | null;
  };

  if (request.status === status) {
    return { ok: true, data: { id: requestId } };
  }

  if (status === "confirmed") {
    if (request.status === "confirmed") {
      return { ok: true, data: { id: requestId } };
    }

    const travelers = Math.max(1, request.traveler_count ?? 1);

    const { data: tourRow, error: tourError } = await admin
      .from("group_tours")
      .select("id, title, destination, start_date, price, currency, seat_limit, seats_booked")
      .eq("id", request.tour_id)
      .maybeSingle();

    if (tourError) return { ok: false, error: tourError.message };
    if (!tourRow) return { ok: false, error: "Group tour not found." };

    const tour = tourRow as {
      id: string;
      title: string;
      destination: string;
      start_date: string | null;
      price: number | null;
      currency: string;
      seat_limit: number;
      seats_booked: number;
    };

    const seatsRemaining = tour.seat_limit - tour.seats_booked;
    if (travelers > seatsRemaining) {
      return {
        ok: false,
        error: `Cannot confirm — only ${Math.max(0, seatsRemaining)} seat(s) remaining.`,
      };
    }

    const newSeatsBooked = tour.seats_booked + travelers;
    const { data: seatUpdate, error: seatError } = await admin
      .from("group_tours")
      .update({
        seats_booked: newSeatsBooked,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tour.id)
      .eq("seats_booked", tour.seats_booked)
      .select("id")
      .maybeSingle();

    if (seatError) return { ok: false, error: seatError.message };
    if (!seatUpdate) {
      return {
        ok: false,
        error: "Could not reserve seats — tour capacity changed. Refresh and try again.",
      };
    }

    const { error: statusError } = await admin
      .from("group_tour_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (statusError) {
      await admin
        .from("group_tours")
        .update({
          seats_booked: tour.seats_booked,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tour.id);
      return { ok: false, error: statusError.message };
    }

    const priceLabel =
      tour.price != null
        ? `${tour.currency} ${Number(tour.price).toLocaleString()}`
        : "Quote on request";

    notifyIntakeSubmission({
      kind: "booking_request",
      requestId,
      customerName: request.full_name,
      customerEmail: request.email,
      supportSubject: `Group tour confirmed: ${tour.title}`,
      fields: [
        { label: "Tour", value: tour.title },
        { label: "Destination", value: tour.destination },
        { label: "Departure", value: tour.start_date ?? "—" },
        { label: "Price", value: priceLabel },
        { label: "Travelers confirmed", value: String(travelers) },
        { label: "Status", value: "Confirmed — our team will follow up with payment details" },
        { label: "Phone", value: request.phone ?? "—" },
        { label: "Message", value: request.message ?? "—" },
      ],
    }).catch((e) => console.error("[group-tour-confirm] email failed", e));

    return { ok: true, data: { id: requestId } };
  }

  const { error } = await admin
    .from("group_tour_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: requestId } };
}

export { parseCommaList };
