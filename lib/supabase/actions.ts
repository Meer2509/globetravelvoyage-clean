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
import { notifyIntakeSubmission } from "@/lib/email/intake-notifications";
import type { EmailField } from "@/lib/email/templates";
import { FORM_SUBMIT_ERROR_MESSAGE, formSubmitErrorWithCode } from "@/lib/site-config";
import { isSupabaseConfigured } from "./client";

export type ActionResult<T = { id: string }> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string; debug?: string };

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
  return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
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

  if (error) {
    console.error("[visa] insert failed", error.message);
    return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
  }

  notifyIntakeSubmission({
    kind: "visa_request",
    requestId: data.id,
    customerName: input.name,
    customerEmail: input.email,
    userId,
    fields: [
      { label: "Phone", value: input.phone },
      { label: "WhatsApp", value: input.whatsapp },
      { label: "Nationality", value: input.nationality },
      { label: "Current country", value: input.currentCountry },
      { label: "Destination", value: input.destination },
      { label: "Purpose", value: input.purpose },
      { label: "Travel date", value: input.travelDate },
      { label: "Previous refusals", value: input.previousRefusals },
      { label: "Message", value: input.message },
    ],
  });

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

/** Columns that exist on public.booking_requests (production concierge schema). */
export interface BookingRequestInsert {
  service: string;
  subject: string | null;
  from_location: string | null;
  to_location: string | null;
  details: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  passenger_count: number;
  travel_date: string | null;
  return_date: string | null;
  cabin_class: string | null;
  message: string | null;
  status: string;
}

function logBookingInsertError(
  context: string,
  row: BookingRequestInsert,
  error: { message: string; code?: string; details?: string; hint?: string }
): void {
  console.error(`[booking] ${context} Supabase insert failed`, {
    message: error.message,
    code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
    row: {
      service: row.service,
      subject: row.subject,
      from_location: row.from_location,
      to_location: row.to_location,
      customer_email: row.customer_email,
      passenger_count: row.passenger_count,
      travel_date: row.travel_date,
      return_date: row.return_date,
      cabin_class: row.cabin_class,
    },
  });
}

function buildBookingRequestRow(input: {
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
}): BookingRequestInsert {
  const passengers = Math.min(9, Math.max(1, input.passengerCount ?? 1));
  return {
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
  };
}

function flightBookingEmailFields(input: FlightBookingRequestInput): EmailField[] {
  const priceLine =
    input.price && input.currency
      ? `${input.currency} ${input.price}`
      : input.price;

  return [
    { label: "Route", value: `${input.fromLocation} → ${input.toLocation}` },
    { label: "Subject", value: input.subject },
    ...(input.airline ? [{ label: "Airline", value: input.airline }] : []),
    { label: "Quoted fare", value: priceLine },
    ...(input.offerId ? [{ label: "Duffel offer ID", value: input.offerId }] : []),
    { label: "Travel date", value: input.travelDate },
    { label: "Return date", value: input.returnDate },
    { label: "Cabin class", value: input.cabinClass },
    { label: "Passengers", value: String(input.passengerCount) },
    { label: "Phone", value: input.customerPhone },
    ...(input.details ? [{ label: "Details", value: input.details }] : []),
    ...(input.message ? [{ label: "Notes", value: input.message }] : []),
  ];
}

function bookingRequestEmailFields(
  input: BookingRequestInput,
  row: BookingRequestInsert
): EmailField[] {
  return [
    { label: "Service", value: input.serviceType },
    { label: "Subject", value: input.serviceName },
    { label: "From", value: row.from_location },
    { label: "To", value: row.to_location },
    { label: "Details", value: row.details },
    { label: "Phone", value: row.customer_phone },
    { label: "Passengers", value: String(row.passenger_count) },
    { label: "Travel date", value: row.travel_date },
    { label: "Return date", value: row.return_date },
    { label: "Cabin class", value: row.cabin_class },
    { label: "Budget", value: input.budget },
    { label: "Message", value: row.message },
  ];
}

export async function submitFlightBookingRequest(
  input: FlightBookingRequestInput
): Promise<ActionResult> {
  const admin = dbClient();
  if (!admin) {
    console.error("[booking] flight submit failed: Supabase admin client not configured");
    return notConfigured();
  }

  const userId = await getOptionalUserId();
  const rateBlocked = await guardFormRateLimit(userId);
  if (rateBlocked) return rateBlocked;

  const row = buildBookingRequestRow({
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
  });

  console.log("[booking] flight insert attempt", {
    service: row.service,
    from_location: row.from_location,
    to_location: row.to_location,
    customer_email: row.customer_email,
    passenger_count: row.passenger_count,
  });

  const { data, error } = await admin
    .from("booking_requests")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    logBookingInsertError("flight", row, error);
    return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
  }

  console.log("[booking] flight insert success", { id: data.id });

  notifyIntakeSubmission({
    kind: "flight_booking",
    requestId: data.id,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    userId,
    supportSubject: `Flight booking request: ${input.fromLocation} → ${input.toLocation}`,
    fields: flightBookingEmailFields(input),
  });

  return { ok: true, data: { id: data.id } };
}

export async function submitBookingRequest(input: BookingRequestInput): Promise<ActionResult> {
  const admin = dbClient();
  if (!admin) {
    console.error("[booking] submit failed: Supabase admin client not configured");
    return notConfigured();
  }

  const userId = await getOptionalUserId();
  const rateBlocked = await guardFormRateLimit(userId);
  if (rateBlocked) return rateBlocked;

  const messageParts = [input.message, input.budget ? `Budget: ${input.budget}` : ""].filter(Boolean);
  const row = buildBookingRequestRow({
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
    message: messageParts.length > 0 ? messageParts.join("\n") : null,
  });

  console.log("[booking] insert attempt", {
    service: row.service,
    customer_email: row.customer_email,
  });

  const { data, error } = await admin
    .from("booking_requests")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    logBookingInsertError("generic", row, error);
    return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
  }

  console.log("[booking] insert success", { id: data.id });

  const isFlight = input.serviceType === "flight";
  notifyIntakeSubmission({
    kind: isFlight ? "flight_booking" : "booking_request",
    requestId: data.id,
    customerName: input.name,
    customerEmail: input.email,
    userId,
    fields: bookingRequestEmailFields(input, row),
  });

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

  if (error) {
    console.error("[lead] insert failed", error.message);
    return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
  }

  const extraFields: EmailField[] = input.extra
    ? Object.entries(input.extra).map(([key, value]) => ({
        label: key.replace(/_/g, " "),
        value,
      }))
    : [];

  notifyIntakeSubmission({
    kind: "contact",
    requestId: data.id,
    customerName: input.name,
    customerEmail: input.email,
    userId,
    supportSubject:
      input.leadType === "general_contact"
        ? `New contact form message${input.purpose ? `: ${input.purpose}` : ""}`
        : `New inquiry: ${input.leadType ?? "contact"}`,
    fields: [
      { label: "Phone", value: input.phone },
      { label: "Inquiry type", value: input.leadType },
      { label: "Expert type", value: input.expertType },
      { label: "Purpose / topic", value: input.purpose },
      { label: "Preferred time", value: input.preferredTime },
      { label: "Subject", value: input.subjectName },
      { label: "Context", value: input.subjectMeta },
      { label: "Message", value: input.message },
      ...extraFields,
    ],
  });

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

  if (error) {
    console.error("[support] insert failed", error.message);
    return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
  }
  return { ok: true, data: { id: data.id } };
}

// ── Property listing ────────────────────────────────────────────────────────

const PROPERTY_LISTING_TABLE = "property_listings" as const;

function propertyListingFailure(
  code: string,
  debug: string,
  extra?: Record<string, unknown>
): ActionResult {
  console.error("[property listing]", { code, debug, ...extra });
  return { ok: false, error: formSubmitErrorWithCode(code), code, debug };
}

function parseListingInteger(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  if (value.toLowerCase() === "studio") return 0;
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : null;
}

function parseListingPrice(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function mapPropertyListingInsertError(error: {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}): ActionResult {
  const debug = [error.code, error.message, error.details, error.hint].filter(Boolean).join(" | ");
  let code = "GTV-PL-003";
  if (error.code === "42P01") code = "GTV-PL-010";
  else if (error.code === "23502") code = "GTV-PL-011";
  else if (error.code === "22P02") code = "GTV-PL-012";
  else if (error.code === "23503") code = "GTV-PL-013";
  return propertyListingFailure(code, debug, { supabase: error });
}

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
  if (!admin) {
    const debug = !isSupabaseConfigured
      ? "NEXT_PUBLIC_SUPABASE_URL or anon key is missing"
      : !isAdminClientConfigured
        ? "SUPABASE_SERVICE_ROLE_KEY is missing"
        : "Supabase admin client unavailable";
    return propertyListingFailure("GTV-PL-001", debug);
  }

  const userId = await getOptionalUserId();
  const rateBlocked = await guardFormRateLimit(userId);
  if (rateBlocked) {
    return propertyListingFailure("GTV-PL-002", rateBlocked.error);
  }

  const row = {
    user_id: userId,
    listing_type: input.listingType,
    property_type: input.propertyType,
    title: input.title.trim(),
    city: input.city.trim(),
    country: input.country?.trim() || null,
    address: input.address?.trim() || null,
    price: parseListingPrice(input.price),
    price_period: input.pricePeriod ?? "month",
    beds: parseListingInteger(input.beds),
    baths: parseListingInteger(input.baths),
    area_sqft: parseListingInteger(input.area),
    description: input.description?.trim() || null,
    contact_name: input.name.trim(),
    contact_email: input.email.trim(),
    contact_phone: input.phone?.trim() || null,
    status: "pending" as const,
  };

  console.info("[property listing] inserting", {
    table: PROPERTY_LISTING_TABLE,
    columns: Object.keys(row),
    userId,
  });

  const { data, error } = await admin
    .from(PROPERTY_LISTING_TABLE)
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return mapPropertyListingInsertError(error);
  }

  if (!data?.id) {
    return propertyListingFailure("GTV-PL-004", "Insert succeeded but no id was returned");
  }

  console.info("[property listing] saved", { table: PROPERTY_LISTING_TABLE, id: data.id });

  notifyIntakeSubmission({
    kind: "contact",
    requestId: data.id,
    customerName: input.name,
    customerEmail: input.email,
    userId,
    supportSubject: `Property listing request: ${input.title}`,
    fields: [
      { label: "Property", value: input.title },
      { label: "City", value: input.city },
      { label: "Type", value: `${input.listingType} / ${input.propertyType}` },
      { label: "Phone", value: input.phone ?? "—" },
    ],
  }).catch((e) => console.error("[property] email failed", e));

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

    if (error) {
      console.error("[referral] lead insert failed", error.message);
      return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
    }
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

  if (error) {
    console.error("[referral] insert failed", error.message);
    return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
  }
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
