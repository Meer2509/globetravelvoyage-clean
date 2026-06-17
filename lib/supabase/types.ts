// =============================================================================
// Globe Travel Voyage — Supabase Database Types
// =============================================================================
// Generated from supabase/schema.sql
// When you connect real Supabase, replace this file with the auto-generated
// types from: npx supabase gen types typescript --project-id <your-project-id>
// =============================================================================

// ── Enum types ────────────────────────────────────────────────────────────────

export type UserRole =
  | "customer"
  | "visa_agent"
  | "travel_agency"
  | "tour_guide"
  | "property_host"
  | "admin";

export type VerificationStatus =
  | "pending"
  | "under_review"
  | "verified"
  | "rejected";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "refunded";

export type VisaStatus =
  | "draft"
  | "submitted"
  | "documents_pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired";

export type PropertyType =
  | "apartment"
  | "villa"
  | "house"
  | "studio"
  | "hotel_room"
  | "other";

export type ListingType = "short_stay" | "long_term" | "for_sale";

export type SupportStatus = "open" | "in_progress" | "resolved" | "closed";

export type NotificationType =
  | "booking"
  | "visa_update"
  | "message"
  | "review"
  | "referral"
  | "system"
  | "payment";

// ── Row types (mirror DB columns) ─────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  nationality: string | null;
  passport_country: string | null;
  preferred_currency: string;
  preferred_language: string;
  bio: string | null;
  role: string | null;
  company_name: string | null;
  business_type: string | null;
  travel_interests: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: UserRole;
  is_primary: boolean;
  granted_at: string;
}

export interface VisaExpert {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  specializations: string[] | null;
  languages: string[] | null;
  services: string[] | null;
  bio: string | null;
  years_experience: number | null;
  price_from: number | null;
  price_to: number | null;
  turnaround_days: number | null;
  claimed_success_rate: number | null;
  offers_consultation: boolean;
  consultation_fee: number;
  license_number: string | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  total_clients: number;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: string;
  user_id: string;
  agency_name: string;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  founded_year: number | null;
  team_size: string | null;
  services: string[] | null;
  top_destinations: string[] | null;
  annual_bookings: string | null;
  license_number: string | null;
  registration_country: string | null;
  iata_number: string | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  total_packages: number;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourGuide {
  id: string;
  user_id: string;
  guide_city: string | null;
  guide_country: string | null;
  languages: string[] | null;
  tour_categories: string[] | null;
  max_group_size: string | null;
  advance_booking: string | null;
  available_days: string[] | null;
  start_times: string[] | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  total_tours_led: number;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyHost {
  id: string;
  user_id: string;
  verification_status: VerificationStatus;
  verified_at: string | null;
  total_listings: number;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tour {
  id: string;
  guide_id: string;
  title: string;
  description: string | null;
  city: string | null;
  country: string | null;
  categories: string[] | null;
  duration_text: string | null;
  duration_hours: number | null;
  price_per_person: number;
  max_group_size: number | null;
  languages: string[] | null;
  includes: string[] | null;
  excludes: string[] | null;
  meeting_point: string | null;
  images: string[] | null;
  is_active: boolean;
  total_bookings: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  agency_id: string | null;
  from_city: string;
  from_country: string;
  to_city: string;
  to_country: string;
  airlines: string[] | null;
  price_from: number | null;
  price_to: number | null;
  cheapest_month: string | null;
  duration_text: string | null;
  travel_tips: string[] | null;
  is_trending: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  property_type: PropertyType;
  listing_type: ListingType;
  city: string;
  country: string;
  neighborhood: string | null;
  beds: number | null;
  baths: number | null;
  max_guests: number | null;
  sqft: number | null;
  price_per_night: number | null;
  price_per_month: number | null;
  asking_price: number | null;
  amenities: string[] | null;
  images: string[] | null;
  check_in_time: string | null;
  check_out_time: string | null;
  min_stay_nights: number;
  pet_friendly: boolean;
  smoking_allowed: boolean;
  instant_book: boolean;
  is_active: boolean;
  total_bookings: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface VisaApplication {
  id: string;
  applicant_id: string;
  agent_id: string | null;
  visa_type: string;
  destination_country: string;
  origin_country: string;
  status: VisaStatus;
  submitted_at: string | null;
  appointment_date: string | null;
  decision_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  documents: Array<{ name: string; url: string; status: string }>;
  ai_checklist: Array<{ item: string; done: boolean }>;
  agent_fee: number | null;
  agent_fee_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface TripPlan {
  id: string;
  user_id: string;
  title: string;
  destination: string | null;
  days: number | null;
  budget_usd: number | null;
  travelers: number;
  travel_style: string | null;
  group_type: string | null;
  special_needs: string | null;
  ai_itinerary: Record<string, unknown> | null;
  is_saved: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  booking_type: string;
  tour_id: string | null;
  property_id: string | null;
  agent_id: string | null;
  agency_id: string | null;
  status: BookingStatus;
  start_date: string | null;
  end_date: string | null;
  guests: number;
  total_amount: number | null;
  currency: string;
  stripe_payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  referral_code: string;
  status: string;
  commission_usd: number;
  paid_at: string | null;
  converted_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  booking_id: string | null;
  target_type: string;
  target_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  user_id: string | null;
  subject: string;
  body: string;
  category: string | null;
  status: SupportStatus;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface VisaRequest {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  nationality: string | null;
  current_country: string | null;
  destination: string;
  purpose: string | null;
  travel_date: string | null;
  previous_refusals: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  id: string;
  user_id: string | null;
  service: string | null;
  subject: string | null;
  from_location: string | null;
  to_location: string | null;
  details: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  passenger_count: number | null;
  travel_date: string | null;
  return_date: string | null;
  cabin_class: string | null;
  service_type: string;
  service_name: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  budget: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export interface LeadRequest {
  id: string;
  user_id: string | null;
  expert_type: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  purpose: string | null;
  message: string | null;
  preferred_time: string | null;
  lead_type: string;
  subject_name: string | null;
  subject_meta: string | null;
  extra_data: Record<string, unknown>;
  status: string;
  created_at: string;
}

export interface PropertyListing {
  id: string;
  user_id: string | null;
  listing_type: string;
  property_type: string;
  title: string;
  city: string;
  country: string | null;
  address: string | null;
  price: number | null;
  price_period: string | null;
  beds: number | null;
  baths: number | null;
  area_sqft: number | null;
  description: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  status: string;
  created_at: string;
}

export interface TourListing {
  id: string;
  user_id: string | null;
  title: string;
  city: string | null;
  country: string | null;
  tour_type: string | null;
  duration: string | null;
  price: number | null;
  description: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  status: string;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string | null;
  booking_id: string | null;
  email: string | null;
  service_type: string | null;
  amount: number;
  currency: string;
  status: string;
  stripe_payment_id: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  payee_name: string | null;
  description: string | null;
  created_at: string;
  paid_at: string | null;
}

// ── Convenience alias ─────────────────────────────────────────────────────────
export type TableName = keyof Database["public"]["Tables"];

// ── Database type map (used with Supabase generic client) ─────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      user_roles: {
        Row: UserRoleRow;
        Insert: { id?: string; user_id: string; role: UserRole; is_primary?: boolean; granted_at?: string };
        Update: Partial<UserRoleRow>;
      };
      visa_experts: { Row: VisaExpert; Insert: Partial<VisaExpert>; Update: Partial<VisaExpert> };
      agencies: { Row: Agency; Insert: Partial<Agency>; Update: Partial<Agency> };
      tour_guides: { Row: TourGuide; Insert: Partial<TourGuide>; Update: Partial<TourGuide> };
      property_hosts: { Row: PropertyHost; Insert: Partial<PropertyHost>; Update: Partial<PropertyHost> };
      tours: { Row: Tour; Insert: Partial<Tour>; Update: Partial<Tour> };
      tickets: { Row: Ticket; Insert: Partial<Ticket>; Update: Partial<Ticket> };
      properties: { Row: Property; Insert: Partial<Property>; Update: Partial<Property> };
      visa_applications: { Row: VisaApplication; Insert: Partial<VisaApplication>; Update: Partial<VisaApplication> };
      trip_plans: { Row: TripPlan; Insert: Partial<TripPlan>; Update: Partial<TripPlan> };
      bookings: { Row: Booking; Insert: Partial<Booking>; Update: Partial<Booking> };
      referrals: { Row: Referral; Insert: Partial<Referral>; Update: Partial<Referral> };
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> };
      support_messages: { Row: SupportMessage; Insert: Partial<SupportMessage>; Update: Partial<SupportMessage> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      visa_requests: {
        Row: VisaRequest;
        Insert: Omit<VisaRequest, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<VisaRequest>;
      };
      booking_requests: {
        Row: BookingRequest;
        Insert: Omit<BookingRequest, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<BookingRequest>;
      };
      lead_requests: {
        Row: LeadRequest;
        Insert: Omit<LeadRequest, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<LeadRequest>;
      };
      property_listings: {
        Row: PropertyListing;
        Insert: Omit<PropertyListing, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<PropertyListing>;
      };
      tour_listings: {
        Row: TourListing;
        Insert: Omit<TourListing, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<TourListing>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Payment>;
      };
      catalog_entries: {
        Row: {
          id: string;
          collection: string;
          item_key: string | null;
          sort_order: number;
          payload: unknown;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          collection: string;
          item_key?: string | null;
          sort_order?: number;
          payload: unknown;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          collection: string;
          item_key: string | null;
          sort_order: number;
          payload: unknown;
          is_published: boolean;
          updated_at: string;
        }>;
      };
      seo_pages: {
        Row: {
          slug: string;
          page_group: "visa" | "travel";
          config: unknown;
          is_published: boolean;
          updated_at: string;
        };
        Insert: {
          slug: string;
          page_group: "visa" | "travel";
          config: unknown;
          is_published?: boolean;
          updated_at?: string;
        };
        Update: Partial<{
          page_group: "visa" | "travel";
          config: unknown;
          is_published: boolean;
          updated_at: string;
        }>;
      };
      pricing_plans: {
        Row: { id: string; sort_order: number; payload: unknown; is_published: boolean; updated_at: string };
        Insert: { id: string; sort_order?: number; payload: unknown; is_published?: boolean; updated_at?: string };
        Update: Partial<{ sort_order: number; payload: unknown; is_published: boolean; updated_at: string }>;
      };
      pricing_bundles: {
        Row: { id: string; sort_order: number; payload: unknown; is_published: boolean; updated_at: string };
        Insert: { id: string; sort_order?: number; payload: unknown; is_published?: boolean; updated_at?: string };
        Update: Partial<{ sort_order: number; payload: unknown; is_published: boolean; updated_at: string }>;
      };
      pricing_commission_rates: {
        Row: { id: string; sort_order: number; payload: unknown; is_published: boolean; updated_at: string };
        Insert: { id?: string; sort_order?: number; payload: unknown; is_published?: boolean; updated_at?: string };
        Update: Partial<{ sort_order: number; payload: unknown; is_published: boolean; updated_at: string }>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      verification_status: VerificationStatus;
      booking_status: BookingStatus;
      visa_status: VisaStatus;
      property_type: PropertyType;
      listing_type: ListingType;
      support_status: SupportStatus;
      notification_type: NotificationType;
    };
    CompositeTypes: Record<string, never>;
  };
}
