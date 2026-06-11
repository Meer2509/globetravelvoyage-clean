"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/auth";
import { fetchGuideTours, fetchRoleDashboardSummary } from "@/lib/supabase/queries";
import { fetchProviderPayments, type PaymentRow } from "@/lib/supabase/queries";
import { fetchProviderBookings, type BookingRequestRow } from "@/lib/supabase/mvp-queries";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { DashboardProfileSection } from "@/components/DashboardProfileSection";
import { DatabaseStatusBanner } from "@/components/DatabaseStatusBanner";
import { DashboardEmpty } from "@/components/DashboardEmpty";
import { ProviderServicesPanel } from "@/components/ProviderServicesPanel";
import { PayoutSetupPanel } from "@/components/PayoutSetupPanel";
import { MessagesInbox } from "@/components/MessagesInbox";
import { formatPaymentAmount } from "@/lib/payments-display";
import {
  DashboardLayout,
  StatCard,
  Panel,
  TableRow,
  type DashboardTab,
} from "@/components/DashboardLayout";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function GuideDashboard() {
  const user = useDashboardUser();
  const [tours, setTours] = useState<Array<{ id: string; title: string; city: string | null; tour_type: string | null; price: number | null; status: string; created_at: string }>>([]);
  const [bookings, setBookings] = useState<BookingRequestRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [summary, setSummary] = useState<{ bookingRequests: number; leadRequests: number } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const userId = user.result?.ok ? user.result.profile.id : "";

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoaded(true);
      return;
    }
    Promise.all([
      fetchGuideTours(),
      userId ? fetchProviderBookings(userId) : Promise.resolve([]),
      fetchProviderPayments(),
      fetchRoleDashboardSummary(),
    ]).then(([t, b, p, s]) => {
      setTours(t);
      setBookings(b);
      setPayments(p);
      if (s) setSummary({ bookingRequests: s.bookingRequests, leadRequests: s.leadRequests });
      setLoaded(true);
    });
  }, [userId]);

  const paidTotal = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);

  const tabs: DashboardTab[] = useMemo(
    () => [
      { key: "overview", label: "Overview", icon: "globe" },
      { key: "services", label: "Services & Pricing", icon: "visa" },
      { key: "tours", label: "My Tours", icon: "ticket", badge: tours.length || undefined },
      { key: "requests", label: "Booking Requests", icon: "users", badge: bookings.length || undefined },
      { key: "earnings", label: "Earnings", icon: "users" },
      { key: "messages", label: "Messages", icon: "shield" },
    ],
    [tours.length, bookings.length]
  );

  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <DatabaseStatusBanner health={user.databaseHealth} />
        <DashboardProfileSection user={user} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Tour listings" value={String(tours.length)} icon="ticket" color="blue" />
          <StatCard label="Booking requests" value={String(bookings.length)} icon="users" color="gold" />
          <StatCard label="Your requests" value={summary ? String(summary.bookingRequests) : "0"} icon="doc" hint="As customer" color="green" />
          <StatCard label="Earnings" value={formatPaymentAmount(paidTotal)} icon="star" color="navy" />
        </div>
        {!loaded ? (
          <p className="text-sm text-charcoal/50">Loading…</p>
        ) : tours.length === 0 && bookings.length === 0 ? (
          <DashboardEmpty
            title="No tours or bookings yet"
            message="Add services and tour listings to start receiving booking requests."
            action={<Link href="/tours" className="btn-primary px-5 py-2.5 text-sm">Explore tours marketplace</Link>}
          />
        ) : null}
      </div>
    ),

    services: <ProviderServicesPanel role="tour_guide" roleLabel="Tour guide" />,

    tours: (
      <div className="space-y-4">
        {tours.length === 0 ? (
          <DashboardEmpty
            title="No tour listings"
            message="Submit your tour through the platform intake. Listings appear here after submission."
            action={<Link href="/booking/request" className="btn-primary px-5 py-2.5 text-sm">Submit tour listing</Link>}
          />
        ) : (
          tours.map((t) => (
            <div key={t.id} className="card p-5 flex justify-between items-center">
              <div>
                <p className="font-bold text-navy">{t.title}</p>
                <p className="text-sm text-charcoal/55">{t.city ?? "—"} · {t.tour_type ?? "Tour"}</p>
              </div>
              <span className="chip text-xs bg-soft text-navy">{t.status}</span>
            </div>
          ))
        )}
      </div>
    ),

    requests: (
      <Panel title="Booking requests" subtitle="Live from Supabase">
        {bookings.length === 0 ? (
          <DashboardEmpty title="No booking requests" message="Travelers who request your tours appear here." />
        ) : (
          bookings.map((b) => (
            <TableRow key={b.id} cells={[b.service_name ?? b.service_type, b.full_name, formatDate(b.created_at)]} badge={b.status} badgeColor="blue" />
          ))
        )}
      </Panel>
    ),

    earnings: (
      <div className="space-y-5">
        <StatCard label="Total earnings" value={formatPaymentAmount(paidTotal)} icon="star" hint={`${payments.filter((p) => p.status === "paid").length} paid`} color="gold" />
        <PayoutSetupPanel />
        {payments.length > 0 ? (
          <Panel title="Payment history">
            {payments.map((p) => (
              <TableRow key={p.id} cells={[p.description ?? "Payment", formatDate(p.paid_at ?? p.created_at), formatPaymentAmount(Number(p.amount), p.currency)]} badge={p.status} badgeColor={p.status === "paid" ? "green" : "blue"} />
            ))}
          </Panel>
        ) : (
          <DashboardEmpty title="$0 earnings" message="Payments for platform services and bookings appear here." />
        )}
      </div>
    ),

    messages: <MessagesInbox title="Guide messages" />,
  };

  return (
    <DashboardLayout
      role={user.roleLabel}
      name={user.displayName}
      initials={user.initials}
      email={user.email}
      profileCompletion={user.completion}
      tabs={tabs}
      sections={sections}
      verified={user.verified}
      roleColor="bg-purple-50 text-purple-700"
      avatarColor="bg-purple-700 text-white"
    />
  );
}
