"use server";

// =============================================================================
// Globe Travel Voyage — Supabase Server Actions
// =============================================================================

import { createServerSupabaseClient } from "./server";
import { createAdminClient, isAdminClientConfigured } from "./admin";
import type { UserRole } from "./types";
import { enforceRateLimit } from "@/lib/rate-limit";
import { requireAdmin, requireSession, SELF_ASSIGNABLE_ROLES } from "@/lib/auth-server";
import { applyUserRole } from "./role-sync";
import { sendEmail } from "@/lib/email/send-email";
import { SITE_CONFIG } from "@/lib/site-config";

export type ActionResult<T = { id: string }> =
  | { ok: true; data: T }
  | { ok: false; error: string; demo?: boolean };

async function getOptionalUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function dbClient() {
  return createAdminClient() ?? null;
}

function notConfigured<T = { id: string }>(): ActionResult<T> {
  return { ok: false, error: "Supabase is not configured.", demo: true };
}

async function guardFormRateLimit(userId: string | null): Promise<{ ok: false; error: string } | null> {
  const limited = await enforceRateLimit("form", userId);
  if (!limited.ok) return { ok: false, error: limited.error };
  return null;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function syncUserRole(userId: string, role: UserRole): Promise<ActionResult<{ role: UserRole }>> {
  if (role === "admin") {
    const adminAuth = await requireAdmin();
    if (!adminAuth.ok) return { ok: false, error: adminAuth.error };
  } else {
    const session = await requireSession();
    if (!session.ok) return { ok: false, error: session.error };
    if (session.userId !== userId) {
      const adminAuth = await requireAdmin();
      if (!adminAuth.ok) return { ok: false, error: adminAuth.error };
    } else if (!SELF_ASSIGNABLE_ROLES.includes(role)) {
      return { ok: false, error: "Not authorized to assign this role." };
    }
  }

  const result = await applyUserRole(userId, role);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: { role } };
}

export async function getProfileRole(userId: string): Promise<UserRole | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();

  const row = data as { role: UserRole } | null;
  return row?.role ?? null;
}

// ── Visa request ────────────────────────────────────────────────────────────

export interface VisaRequestInput {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  nationality: string;
  currentCountry: string;
  destination: string;
  purpose: string;
  travelDate?: string;
  previousRefusals?: string;
  message?: string;
}

export async function submitVisaRequest(input: VisaRequestInput): Promise<ActionResult> {
  const admin = dbClient();
  if (!admin) return notConfigured();

  const userId = await getOptionalUserId();
  const rateBlocked = await guardFormRateLimit(userId);
  if (rateBlocked) return rateBlocked;

  const { data, error } = await admin
    .from("visa_requests")
    .insert({
      user_id: userId,
      full_name: input.name,
      email: input.email,
      phone: input.phone,
      whatsapp: input.whatsapp ?? null,
      nationality: input.nationality,
      current_country: input.currentCountry,
      destination: input.destination,
      purpose: input.purpose,
      travel_date: input.travelDate || null,
      previous_refusals: input.previousRefusals ?? "no",
      message: input.message ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

// ── Booking request ─────────────────────────────────────────────────────────

export interface BookingRequestInput {
  serviceType: string;
  serviceName?: string;
  name: string;
  email: string;
  phone?: string;
  date?: string;
  endDate?: string;
  travelers?: string;
  budget?: string;
  message?: string;
  providerUserId?: string;
  fromLocation?: string;
  toLocation?: string;
  details?: string;
  cabinClass?: string;
}

export interface FlightBookingRequestInput {
  subject: string;
  fromLocation: string;
  toLocation: string;
  details?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  passengerCount: number;
  travelDate?: string;
  returnDate?: string;
  cabinClass?: string;
  message?: string;
  airline?: string;
  price?: string;
  currency?: string;
  offerId?: string;
}

function bookingInsertRow(
  input: {
    service: string;
    subject?: string | null;
    fromLocation?: string | null;
    toLocation?: string | null;
    details?: string | null;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    passengerCount?: number;
    travelDate?: string | null;
    returnDate?: string | null;
    cabinClass?: string | null;
    message?: string | null;
    budget?: string | null;
    providerUserId?: string;
  },
  userId: string | null
) {
  const passengers = Math.min(9, Math.max(1, input.passengerCount ?? 1));
  return {
    user_id: userId,
    customer_id: userId,
    service: input.service,
    subject: input.subject ?? null,
    from_location: input.fromLocation ?? null,
    to_location: input.toLocation ?? null,
    details: input.details ?? null,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone ?? null,
    passenger_count: passengers,
    travel_date: input.travelDate || null,
    return_date: input.returnDate || null,
    cabin_class: input.cabinClass ?? null,
    message: input.message ?? null,
    status: "pending",
    service_type: input.service,
    service_name: input.subject ?? null,
    title: input.subject ?? null,
    full_name: input.customerName,
    email: input.customerEmail,
    phone: input.customerPhone ?? null,
    start_date: input.travelDate || null,
    end_date: input.returnDate || null,
    travelers: passengers,
    budget: input.budget ?? null,
    provider_user_id: input.providerUserId ?? null,
  };
}

async function notifySupportFlightBooking(
  input: FlightBookingRequestInput,
  requestId: string,
  userId: string | null
): Promise<void> {
  const priceLine =
    input.price && input.currency
      ? `${input.currency} ${input.price}`
      : input.price ?? "—";

  const html = `
    <h2>New flight booking request</h2>
    <p><strong>Request ID:</strong> ${requestId}</p>
    <p><strong>Route:</strong> ${input.fromLocation} → ${input.toLocation}</p>
    <p><strong>Subject:</strong> ${input.subject}</p>
    ${input.airline ? `<p><strong>Airline:</strong> ${input.airline}</p>` : ""}
    <p><strong>Quoted fare:</strong> ${priceLine}</p>
    ${input.offerId ? `<p><strong>Duffel offer ID:</strong> ${input.offerId}</p>` : ""}
    <p><strong>Travel date:</strong> ${input.travelDate ?? "—"}</p>
    <p><strong>Return date:</strong> ${input.returnDate ?? "—"}</p>
    <p><strong>Cabin:</strong> ${input.cabinClass ?? "—"}</p>
    <p><strong>Passengers:</strong> ${input.passengerCount}</p>
    <hr />
    <p><strong>Customer:</strong> ${input.customerName}</p>
    <p><strong>Email:</strong> ${input.customerEmail}</p>
    <p><strong>Phone:</strong> ${input.customerPhone}</p>
    ${input.details ? `<p><strong>Details:</strong> ${input.details}</p>` : ""}
    ${input.message ? `<p><strong>Notes:</strong> ${input.message}</p>` : ""}
  `;

  try {
    await sendEmail({
      to: SITE_CONFIG.supportEmail,
      subject: `Flight booking request: ${input.fromLocation} → ${input.toLocation}`,
      html,
      type: "booking_confirmation",
      userId,
    });
  } catch (err) {
    console.error("[booking] support notification failed", err);
  }
}

export async function submitFlightBookingRequest(
  input: FlightBookingRequestInput
): Promise<ActionResult> {
  const admin = dbClient();
  if (!admin) return notConfigured();

  const userId = await getOptionalUserId();
  const rateBlocked = await guardFormRateLimit(userId);
  if (rateBlocked) return rateBlocked;

  const row = bookingInsertRow(
    {
      service: "flight",
      subject: input.subject,
      fromLocation: input.fromLocation,
      toLocation: input.toLocation,
      details: input.details,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      passengerCount: input.passengerCount,
      travelDate: input.travelDate,
      returnDate: input.returnDate,
      cabinClass: input.cabinClass,
      message: input.message,
    },
    userId
  );

  const { data, error } = await admin
    .from("booking_requests")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("[booking] flight insert failed", error.message);
    return { ok: false, error: "submit_failed" };
  }

  await notifySupportFlightBooking(input, data.id, userId);
  return { ok: true, data: { id: data.id } };
}

export async function submitBookingRequest(input: BookingRequestInput): Promise<ActionResult> {
  const admin = dbClient();
  if (!admin) return notConfigured();

  const userId = await getOptionalUserId();
  const rateBlocked = await guardFormRateLimit(userId);
  if (rateBlocked) return rateBlocked;

  const row = bookingInsertRow(
    {
      service: input.serviceType,
      subject: input.serviceName,
      fromLocation: input.fromLocation,
      toLocation: input.toLocation,
      details: input.details,
      customerName: input.name,
      customerEmail: input.email,
      customerPhone: input.phone,
      passengerCount: parseInt(input.travelers ?? "1", 10) || 1,
      travelDate: input.date,
      returnDate: input.endDate,
      cabinClass: input.cabinClass,
      message: input.message,
      budget: input.budget,
      providerUserId: input.providerUserId,
    },
    userId
  );

  const { data, error } = await admin
    .from("booking_requests")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("[booking] insert failed", error.message);
    return { ok: false, error: "submit_failed" };
  }
  return { ok: true, data: { id: data.id } };
}

// ── Lead / contact expert ───────────────────────────────────────────────────

export interface LeadRequestInput {
  expertType?: string;
  name: string;
  email: string;
  phone?: string;
  purpose?: string;
  message?: string;
  preferredTime?: string;
  leadType?: string;
  subjectName?: string;
  subjectMeta?: string;
  extra?: Record<string, string>;
  providerUserId?: string;
}

export async function submitLeadRequest(input: LeadRequestInput): Promise<ActionResult> {
  const admin = dbClient();
  if (!admin) return notConfigured();

  const userId = await getOptionalUserId();
  const rateBlocked = await guardFormRateLimit(userId);
  if (rateBlocked) return rateBlocked;

  const { data, error } = await admin
    .from("lead_requests")
    .insert({
      user_id: userId,
      customer_id: userId,
      provider_user_id: input.providerUserId ?? null,
      expert_type: input.expertType ?? null,
      full_name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      purpose: input.purpose ?? null,
      message: input.message ?? null,
      preferred_time: input.preferredTime ?? null,
      lead_type: input.leadType ?? "contact_expert",
      subject_name: input.subjectName ?? null,
      subject_meta: input.subjectMeta ?? null,
      extra_data: input.extra ?? {},
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

// ── Support ticket ──────────────────────────────────────────────────────────

export interface SupportTicketInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: string;
}

export async function submitSupportTicket(input: SupportTicketInput): Promise<ActionResult> {
  const admin = dbClient();
  if (!admin) return notConfigured();

  const userId = await getOptionalUserId();
  const rateBlocked = await guardFormRateLimit(userId);
  if (rateBlocked) return rateBlocked;

  const { data, error } = await admin
    .from("support_messages")
    .insert({
      user_id: userId,
      subject: input.subject,
      body: `${input.message}\n\n— ${input.name} <${input.email}>`,
      category: input.category ?? "other",
      status: "open",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

// ── Property listing ────────────────────────────────────────────────────────

export interface PropertyListingInput {
  listingType: string;
  propertyType: string;
  title: string;
  city: string;
  country?: string;
  address?: string;
  price?: string;
  pricePeriod?: string;
  beds?: string;
  baths?: string;
  area?: string;
  description?: string;
  name: string;
  email: string;
  phone?: string;
}

export async function submitPropertyListing(input: PropertyListingInput): Promise<ActionResult> {
  const admin = dbClient();
  if (!admin) return notConfigured();

  const userId = await getOptionalUserId();
  const rateBlocked = await guardFormRateLimit(userId);
  if (rateBlocked) return rateBlocked;

  const { data, error } = await admin
    .from("property_listings")
    .insert({
      user_id: userId,
      listing_type: input.listingType,
      property_type: input.propertyType,
      title: input.title,
      city: input.city,
      country: input.country ?? null,
      address: input.address ?? null,
      price: input.price ? parseFloat(input.price.replace(/[^0-9.]/g, "")) || null : null,
      price_period: input.pricePeriod ?? "month",
      beds: input.beds ? parseInt(input.beds, 10) : null,
      baths: input.baths ? parseInt(input.baths, 10) : null,
      area_sqft: input.area ? parseInt(input.area, 10) : null,
      description: input.description ?? null,
      contact_name: input.name,
      contact_email: input.email,
      contact_phone: input.phone ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

// ── Referral signup ─────────────────────────────────────────────────────────

export interface ReferralSignupInput {
  name: string;
  email: string;
}

export async function submitReferralSignup(input: ReferralSignupInput): Promise<ActionResult<{ id: string; code: string }>> {
  const admin = dbClient();
  if (!admin) return notConfigured();

  const userId = await getOptionalUserId();
  const rateBlocked = await guardFormRateLimit(userId);
  if (rateBlocked) return rateBlocked;
  const codeBase = input.name.split(" ")[0]?.toUpperCase().slice(0, 6) ?? "USER";
  const code = `GTV-${codeBase}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  if (!userId) {
    const { data, error } = await admin
      .from("lead_requests")
      .insert({
        full_name: input.name,
        email: input.email,
        lead_type: "referral_signup",
        message: `Referral program signup. Assigned code: ${code}`,
        status: "pending",
        extra_data: { referral_code: code },
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { id: data.id, code } };
  }

  const { data, error } = await admin
    .from("referrals")
    .insert({
      referrer_id: userId,
      referral_code: code,
      status: "pending",
      commission_usd: 0,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id, code } };
}

// ── General contact form ────────────────────────────────────────────────────

export interface ContactFormInput {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export async function submitContactForm(input: ContactFormInput): Promise<ActionResult> {
  return submitLeadRequest({
    name: input.name,
    email: input.email,
    purpose: input.topic,
    message: input.message,
    leadType: "general_contact",
  });
}

// ── Contact modal (property inquiry, book tour, etc.) ─────────────────────────

export async function submitContactModal(
  mode: string,
  values: Record<string, string>,
  subjectName?: string,
  subjectMeta?: string
): Promise<ActionResult> {
  const name = values.name ?? values.full_name ?? "";
  const email = values.email ?? "";

  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }

  const bookingModes = ["book_tour", "book_stay", "buy_ticket", "request_quote"];

  if (bookingModes.includes(mode)) {
    return submitBookingRequest({
      serviceType: mode,
      serviceName: subjectName,
      name,
      email,
      phone: values.phone,
      date: values.date ?? values.checkin,
      endDate: values.checkout,
      travelers: values.travelers ?? values.guests,
      message: values.message,
    });
  }

  return submitLeadRequest({
    name,
    email,
    phone: values.phone,
    purpose: values.purpose ?? mode,
    message: values.message,
    leadType: mode,
    subjectName,
    subjectMeta,
    extra: values,
  });
}

export async function isDatabaseLive(): Promise<boolean> {
  return isAdminClientConfigured;
}
