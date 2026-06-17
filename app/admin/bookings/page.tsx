import type { Metadata } from "next";
import Link from "next/link";
import { AdminBookingsDashboard } from "@/components/admin/AdminBookingsDashboard";
import { fetchAllBookingRequestsForAdmin } from "@/lib/admin/fetch-bookings";
import { requireAdmin } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Booking Requests — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminBookingsPage() {
  const adminAuth = await requireAdmin();

  if (!adminAuth.ok) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center px-5">
        <div className="card max-w-md p-8 text-center">
          <p className="text-4xl mb-4">🔐</p>
          <h1 className="text-xl font-extrabold text-navy">Administrator access required</h1>
          <p className="mt-2 text-sm text-charcoal/55">{adminAuth.error}</p>
          <Link href="/login" className="btn-primary mt-6 inline-flex px-6 py-3 text-sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const { bookings, error } = await fetchAllBookingRequestsForAdmin();

  return <AdminBookingsDashboard initialBookings={bookings} fetchError={error} />;
}
