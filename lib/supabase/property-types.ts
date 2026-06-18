export const PUBLIC_PROPERTY_STATUS = "approved" as const;

export const PROPERTY_LISTING_STATUSES = [
  "new",
  "pending",
  "reviewing",
  "approved",
  "rejected",
  "published",
  "closed",
] as const;

export type PropertyListingRow = {
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
  is_featured: boolean;
  admin_notes: string | null;
  rating: number | null;
  review_count: number | null;
  created_at: string;
  updated_at: string | null;
};

export const PROPERTY_LISTING_SELECT =
  "id, user_id, listing_type, property_type, title, city, country, address, price, price_period, beds, baths, area_sqft, description, contact_name, contact_email, contact_phone, status, is_featured, admin_notes, rating, review_count, created_at, updated_at";
