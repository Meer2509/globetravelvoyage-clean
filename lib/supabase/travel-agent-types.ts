export const PUBLIC_TRAVEL_AGENT_STATUS = "verified" as const;

export const TRAVEL_AGENT_STATUSES = [
  "pending",
  "under_review",
  "verified",
  "rejected",
] as const;

export type TravelAgentProfileRow = {
  id: string;
  user_id: string;
  agency_name: string | null;
  full_name: string;
  bio: string | null;
  specialties: string[];
  countries_served: string[];
  languages: string[];
  years_experience: number | null;
  profile_photo: string | null;
  verification_status: string;
  rating: number | null;
  review_count: number | null;
  featured: boolean;
  is_active: boolean;
  admin_notes: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string | null;
};

export type TravelAgentServiceRow = {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  price: number | null;
  price_unit: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

export type TravelAgentInquiryRow = {
  id: string;
  profile_id: string;
  user_id: string | null;
  service_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
  updated_at: string | null;
};

export const TRAVEL_AGENT_PROFILE_SELECT =
  "id, user_id, agency_name, full_name, bio, specialties, countries_served, languages, years_experience, profile_photo, verification_status, rating, review_count, featured, is_active, admin_notes, verified_at, created_at, updated_at";

export const TRAVEL_AGENT_SERVICE_SELECT =
  "id, profile_id, title, description, price, price_unit, is_active, created_at, updated_at";
