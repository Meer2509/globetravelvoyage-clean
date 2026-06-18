export const PUBLIC_GROUP_TOUR_STATUSES = ["approved", "active"] as const;

export const GROUP_TOUR_STATUSES = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "active",
  "closed",
] as const;

export type GroupTourStatus = (typeof GROUP_TOUR_STATUSES)[number];

export type GroupTourRow = {
  id: string;
  agent_profile_id: string;
  user_id: string;
  title: string;
  destination: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  price: number | null;
  currency: string;
  seat_limit: number;
  seats_booked: number;
  itinerary: string | null;
  included_items: string[];
  excluded_items: string[];
  cancellation_policy: string | null;
  status: GroupTourStatus;
  featured: boolean;
  rating: number | null;
  review_count: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
  agent_name?: string | null;
  agency_name?: string | null;
};

export type GroupTourRequestRow = {
  id: string;
  tour_id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  traveler_count: number;
  traveler_info: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
};

export const GROUP_TOUR_SELECT =
  "id, agent_profile_id, user_id, title, destination, description, start_date, end_date, price, currency, seat_limit, seats_booked, itinerary, included_items, excluded_items, cancellation_policy, status, featured, rating, review_count, admin_notes, created_at, updated_at";

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const REVIEW_TARGET_TYPES = [
  "travel_agent",
  "property",
  "group_tour",
  "visa_agent",
] as const;

export type ReviewTargetType = (typeof REVIEW_TARGET_TYPES)[number];
