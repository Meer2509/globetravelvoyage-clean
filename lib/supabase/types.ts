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
  specializations: string[] | null;
  languages: string[] | null;
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

// ── Database type map (used with Supabase generic client) ─────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      user_roles: { Row: UserRoleRow; Insert: Partial<UserRoleRow>; Update: Partial<UserRoleRow> };
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
    };
  };
}
