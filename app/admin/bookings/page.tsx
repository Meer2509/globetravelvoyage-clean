import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { requireAdmin } from "@/lib/auth-server";
import { AdminBookingsDashboard } from "@/components/admin/AdminBookingsDashboard";
import { fetchAllBookingRequestsForAdmin } from "@/lib/admin/fetch-bookings";

export const metadata: Metadata = {
  title: "Booking Requests — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminBookingsPage() {
  const adminAuth = await requireAdmin();

  if (!adminAuth.ok) {
    return <AdminAccessRequired message={adminAuth.error} />;
  }

  const { bookings, error } = await fetchAllBookingRequestsForAdmin();

  return <AdminBookingsDashboard initialBookings={bookings} fetchError={error} />;
}
