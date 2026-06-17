"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BOOKING_STATUSES,
  STATUS_STYLES,
  formatAdminDate,
  formatAdminDateTime,
  type AdminBookingRequest,
} from "@/lib/admin/booking-requests";
import { updateBookingRequestStatus } from "@/lib/supabase/mvp-actions";

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.new;
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}>
      {status}
    </span>
  );
}

function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (status: string) => void;
  disabled?: boolean;
}) {
  return (
    <select
      className="input select min-w-[8.5rem] py-1.5 text-xs font-semibold"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {BOOKING_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}

function BookingCard({
  booking,
  updating,
  onStatusChange,
}: {
  booking: AdminBookingRequest;
  updating: boolean;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div className="card space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/45">{booking.service}</p>
          <p className="mt-0.5 font-bold text-navy truncate">{booking.subject ?? "Booking request"}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-charcoal/45">Customer</dt>
          <dd className="font-semibold text-navy">{booking.customerName}</dd>
        </div>
        <div>
          <dt className="text-xs text-charcoal/45">Passengers</dt>
          <dd className="font-semibold text-navy">{booking.passengerCount ?? "—"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-charcoal/45">Email</dt>
          <dd className="text-navy break-all">
            <a href={`mailto:${booking.customerEmail}`} className="text-blue hover:underline">
              {booking.customerEmail}
            </a>
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-charcoal/45">Phone</dt>
          <dd className="text-navy">{booking.customerPhone ?? "—"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-charcoal/45">Route</dt>
          <dd className="font-semibold text-navy">{booking.route ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-charcoal/45">Travel date</dt>
          <dd className="text-navy">{formatAdminDate(booking.travelDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-charcoal/45">Created</dt>
          <dd className="text-navy">{formatAdminDateTime(booking.createdAt)}</dd>
        </div>
      </dl>

      <div className="flex items-center justify-between gap-3 border-t border-soft-200 pt-4">
        <span className="text-xs text-charcoal/45">Update status</span>
        <StatusSelect
          value={booking.status}
          disabled={updating}
          onChange={(status) => onStatusChange(booking.id, status)}
        />
      </div>
    </div>
  );
}

export function AdminBookingsDashboard({
  initialBookings,
  fetchError,
}: {
  initialBookings: AdminBookingRequest[];
  fetchError?: string;
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!q) return true;
      return (
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        (b.subject?.toLowerCase().includes(q) ?? false) ||
        (b.route?.toLowerCase().includes(q) ?? false) ||
        b.service.toLowerCase().includes(q)
      );
    });
  }, [bookings, query, statusFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: bookings.length };
    for (const s of BOOKING_STATUSES) map[s] = 0;
    for (const b of bookings) {
      map[b.status] = (map[b.status] ?? 0) + 1;
    }
    return map;
  }, [bookings]);

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    const result = await updateBookingRequestStatus(id, status);
    setUpdatingId(null);

    if (!result.ok) {
      setToast(result.error);
      setTimeout(() => setToast(null), 4000);
      return;
    }

    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    setToast(`Status updated to "${status}"`);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient px-5 py-10 text-white sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
            <Link href="/admin/setup" className="hover:text-white/80">← Setup</Link>
            <span>·</span>
            <Link href="/dashboard/admin" className="hover:text-white/80">Dashboard</Link>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Booking requests</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/65">
            Review concierge submissions, update pipeline status, and follow up with travelers.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        {fetchError && (
          <div className="rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-navy">
            {fetchError}
          </div>
        )}

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { key: "all", label: "All" },
            ...BOOKING_STATUSES.map((s) => ({ key: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key)}
              className={`card px-4 py-3 text-left transition-all ${
                statusFilter === item.key ? "ring-2 ring-gold/50 shadow-[var(--shadow-card)]" : "hover:shadow-[var(--shadow-card)]"
              }`}
            >
              <p className="text-xs text-charcoal/45">{item.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-navy">{counts[item.key] ?? 0}</p>
            </button>
          ))}
        </div>

        <div className="card p-4">
          <input
            className="input bg-soft/50"
            placeholder="Search name, email, route, or subject…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-navy/10 bg-navy px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-premium)]">
            {toast}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">📋</span>
            <p className="font-semibold text-navy">No booking requests found</p>
            <p className="mt-1 text-sm text-charcoal/45">
              {bookings.length === 0
                ? "New submissions from /booking/request will appear here."
                : "Try a different filter or search term."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-soft-200 bg-soft/50 text-xs uppercase tracking-wide text-charcoal/45">
                      <th className="px-4 py-3 font-semibold">Service</th>
                      <th className="px-4 py-3 font-semibold">Subject</th>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Contact</th>
                      <th className="px-4 py-3 font-semibold">Route</th>
                      <th className="px-4 py-3 font-semibold">Pax</th>
                      <th className="px-4 py-3 font-semibold">Travel</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-soft-200">
                    {filtered.map((b) => (
                      <tr key={b.id} className="hover:bg-soft/30 transition-colors">
                        <td className="px-4 py-3 capitalize font-medium text-navy">{b.service}</td>
                        <td className="px-4 py-3 max-w-[12rem] truncate text-charcoal/70">{b.subject ?? "—"}</td>
                        <td className="px-4 py-3 font-semibold text-navy">{b.customerName}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <a href={`mailto:${b.customerEmail}`} className="block text-blue hover:underline truncate max-w-[10rem]">
                              {b.customerEmail}
                            </a>
                            <span className="text-xs text-charcoal/45">{b.customerPhone ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-charcoal/70">{b.route ?? "—"}</td>
                        <td className="px-4 py-3 text-navy">{b.passengerCount ?? "—"}</td>
                        <td className="px-4 py-3 text-charcoal/70 whitespace-nowrap">{formatAdminDate(b.travelDate)}</td>
                        <td className="px-4 py-3">
                          <StatusSelect
                            value={b.status}
                            disabled={updatingId === b.id}
                            onChange={(status) => handleStatusChange(b.id, status)}
                          />
                        </td>
                        <td className="px-4 py-3 text-xs text-charcoal/50 whitespace-nowrap">
                          {formatAdminDateTime(b.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 lg:hidden">
              {filtered.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  updating={updatingId === b.id}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
