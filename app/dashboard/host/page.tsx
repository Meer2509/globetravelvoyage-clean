"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/auth";
import { fetchHostListings, fetchRoleDashboardSummary } from "@/lib/supabase/queries";
import { fetchProviderPayments, type PaymentRow } from "@/lib/supabase/queries";
import { fetchProviderLeads, fetchProviderBookings, type LeadRequestRow, type BookingRequestRow } from "@/lib/supabase/mvp-queries";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { DashboardProfileSection } from "@/components/DashboardProfileSection";
import { DatabaseStatusBanner } from "@/components/DatabaseStatusBanner";
import { DashboardEmpty } from "@/components/DashboardEmpty";
import { ProviderServicesPanel } from "@/components/ProviderServicesPanel";
import { PayoutSetupPanel } from "@/components/PayoutSetupPanel";
import { ProviderEarningsSummary } from "@/components/ProviderEarningsSummary";
import { MessagesInbox } from "@/components/MessagesInbox";
import { Disclaimer } from "@/components/Disclaimer";
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

export default function HostDashboard() {
  const user = useDashboardUser();
  const [listings, setListings] = useState<Array<{ id: string; title: string; city: string; listing_type: string; price: number | null; status: string; created_at: string }>>([]);
  const [bookings, setBookings] = useState<BookingRequestRow[]>([]);
  const [leads, setLeads] = useState<LeadRequestRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const userId = user.result?.ok ? user.result.profile.id : "";

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoaded(true);
      return;
    }
    Promise.all([
      fetchHostListings(),
      userId ? fetchProviderBookings(userId) : Promise.resolve([]),
      userId ? fetchProviderLeads(userId) : Promise.resolve([]),
      fetchProviderPayments(),
    ]).then(([l, b, ld, p]) => {
      setListings(l);
      setBookings(b);
      setLeads(ld);
      setPayments(p);
      setLoaded(true);
    });
  }, [userId]);

  const paidTotal = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);

  const tabs: DashboardTab[] = useMemo(
    () => [
      { key: "overview", label: "Overview", icon: "globe" },
      { key: "services", label: "Services & Pricing", icon: "visa" },
      { key: "listings", label: "My Listings", icon: "property", badge: listings.length || undefined },
      { key: "requests", label: "Booking Requests", icon: "doc", badge: bookings.length || undefined },
      { key: "leads", label: "Buyer / Renter Leads", icon: "users", badge: leads.length || undefined },
      { key: "revenue", label: "Revenue", icon: "star" },
      { key: "messages", label: "Messages", icon: "shield" },
    ],
    [listings.length, bookings.length, leads.length]
  );

  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <DatabaseStatusBanner health={user.databaseHealth} />
        <DashboardProfileSection user={user} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Listings" value={String(listings.length)} icon="property" color="blue" />
          <StatCard label="Booking requests" value={String(bookings.length)} icon="doc" color="gold" />
          <StatCard label="Leads" value={String(leads.length)} icon="users" color="green" />
          <StatCard label="Revenue" value={formatPaymentAmount(paidTotal)} icon="star" color="navy" />
        </div>
        {!loaded ? (
          <p className="text-sm text-charcoal/50">Loading…</p>
        ) : listings.length === 0 ? (
          <DashboardEmpty
            title="No property listings"
            message="Post your first property to start receiving leads and booking requests."
            action={<Link href="/properties/post" className="btn-primary px-5 py-2.5 text-sm">Post a listing</Link>}
          />
        ) : null}
      </div>
    ),

    services: <ProviderServicesPanel role="property_host" roleLabel="Property host" />,

    listings: (
      <div className="space-y-4">
        {listings.length === 0 ? (
          <DashboardEmpty
            title="No listings"
            message="Property listings you submit appear here with live status from Supabase."
            action={<Link href="/properties/post" className="btn-primary px-5 py-2.5 text-sm">Post listing</Link>}
          />
        ) : (
          listings.map((l) => (
            <div key={l.id} className="card p-5 flex justify-between">
              <div>
                <p className="font-bold text-navy">{l.title}</p>
                <p className="text-sm text-charcoal/55">{l.city} · {l.listing_type} · {formatDate(l.created_at)}</p>
              </div>
              <span className="chip text-xs">{l.status}</span>
            </div>
          ))
        )}
      </div>
    ),

    requests: (
      <Panel title="Booking requests">
        {bookings.length === 0 ? (
          <DashboardEmpty title="No booking requests" message="Stay booking enquiries appear here." />
        ) : (
          bookings.map((b) => (
            <TableRow key={b.id} cells={[b.service_name ?? b.service_type, b.full_name, formatDate(b.created_at)]} badge={b.status} badgeColor="blue" />
          ))
        )}
      </Panel>
    ),

    leads: (
      <Panel title="Buyer / renter leads" noPad>
        {leads.length === 0 ? (
          <div className="p-8"><DashboardEmpty title="No leads" message="Property inquiry leads appear here." action={<Link href="/properties" className="btn-outline px-4 py-2 text-sm">Browse properties</Link>} /></div>
        ) : (
          <div className="divide-y divide-soft-200">
            {leads.map((l) => (
              <div key={l.id} className="p-5">
                <p className="font-bold text-navy">{l.full_name}</p>
                <p className="text-sm text-charcoal/55">{l.email} · {formatDate(l.created_at)}</p>
                {l.message && <p className="mt-1 text-xs text-charcoal/50">{l.message}</p>}
              </div>
            ))}
          </div>
        )}
      </Panel>
    ),

    revenue: (
      <div className="space-y-5">
        <ProviderEarningsSummary compact />
        <StatCard label="Total paid" value={formatPaymentAmount(paidTotal)} icon="star" color="gold" />
        <PayoutSetupPanel />
        <Disclaimer>We do not guarantee rental outcomes, tenant quality, or property valuations.</Disclaimer>
      </div>
    ),

    messages: <MessagesInbox title="Host messages" />,
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
      roleColor="bg-amber-50 text-amber-800"
      avatarColor="bg-amber-700 text-white"
    />
  );
}
