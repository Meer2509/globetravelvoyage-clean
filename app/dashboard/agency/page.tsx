"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/auth";
import { fetchAgencyBookings, fetchAgencyLeads, fetchGuideTours, fetchProviderPayments, type PaymentRow } from "@/lib/supabase/queries";
import type { LeadRequestRow } from "@/lib/supabase/mvp-queries";
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

export default function AgencyDashboard() {
  const user = useDashboardUser();
  const [bookings, setBookings] = useState<Array<Record<string, unknown>>>([]);
  const [leads, setLeads] = useState<LeadRequestRow[]>([]);
  const [tours, setTours] = useState<Array<{ id: string; title: string; city: string | null; tour_type: string | null; price: number | null; status: string; created_at: string }>>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loaded, setLoaded] = useState(!isSupabaseConfigured);

  const userId = user.result?.ok ? user.result.profile.id : "";

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (!userId) return;
    Promise.all([
      fetchAgencyBookings(userId),
      fetchAgencyLeads(userId),
      fetchGuideTours(),
      fetchProviderPayments(),
    ]).then(([b, l, t, p]) => {
      setBookings(b as Array<Record<string, unknown>>);
      setLeads(l as LeadRequestRow[]);
      setTours(t);
      setPayments(p);
      setLoaded(true);
    });
  }, [userId]);

  const paidTotal = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);

  const tabs: DashboardTab[] = useMemo(
    () => [
      { key: "overview", label: "Overview", icon: "globe" },
      { key: "services", label: "Services & Pricing", icon: "visa" },
      { key: "tours", label: "Tours & Tickets", icon: "ticket", badge: tours.length || undefined },
      { key: "bookings", label: "Bookings", icon: "doc", badge: bookings.length || undefined },
      { key: "leads", label: "Leads", icon: "users", badge: leads.length || undefined },
      { key: "revenue", label: "Revenue", icon: "star" },
      { key: "messages", label: "Messages", icon: "shield" },
      { key: "verification", label: "Verification", icon: "shield" },
    ],
    [bookings.length, leads.length, tours.length]
  );

  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <DatabaseStatusBanner health={user.databaseHealth} />
        <DashboardProfileSection user={user} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Booking requests" value={String(bookings.length)} icon="doc" hint="Live from Supabase" color="blue" />
          <StatCard label="Leads" value={String(leads.length)} icon="users" hint="Live intake" color="gold" />
          <StatCard label="Tour listings" value={String(tours.length)} icon="ticket" hint="Your submissions" color="green" />
          <StatCard label="Paid on account" value={formatPaymentAmount(paidTotal)} icon="star" hint={`${payments.length} transaction(s)`} color="navy" />
        </div>
        {!loaded ? (
          <p className="text-sm text-charcoal/50">Loading dashboard…</p>
        ) : bookings.length === 0 && leads.length === 0 ? (
          <DashboardEmpty
            title="No activity yet"
            message="Booking requests and leads appear here when travelers submit enquiries through the platform."
            action={<Link href="/booking/request" className="btn-primary px-5 py-2.5 text-sm">View booking form</Link>}
          />
        ) : (
          <Panel title="Recent intake" subtitle="Latest booking requests and leads">
            {bookings.slice(0, 3).map((b) => (
              <TableRow key={String(b.id)} cells={[String(b.service_name ?? b.service_type), String(b.full_name), formatDate(String(b.created_at))]} badge={String(b.status)} badgeColor="blue" />
            ))}
            {leads.slice(0, 3).map((l) => (
              <TableRow key={l.id} cells={[l.title ?? l.lead_type, l.full_name, formatDate(l.created_at)]} badge={l.status} badgeColor="gold" />
            ))}
          </Panel>
        )}
      </div>
    ),

    services: <ProviderServicesPanel role="agency" roleLabel="Agency" />,

    tours: (
      <div className="space-y-4">
        {tours.length === 0 ? (
          <DashboardEmpty
            title="No tour listings"
            message="Submit tour or ticket listings through intake forms. Approved listings appear here."
            action={<Link href="/tours" className="btn-primary px-5 py-2.5 text-sm">Browse tours marketplace</Link>}
          />
        ) : (
          tours.map((t) => (
            <div key={t.id} className="card flex items-center justify-between p-5">
              <div>
                <p className="font-bold text-navy">{t.title}</p>
                <p className="text-sm text-charcoal/55">{t.city ?? "—"} · {t.tour_type ?? "Tour"} · {formatDate(t.created_at)}</p>
              </div>
              <span className={`chip text-xs ${t.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-gold/15 text-navy"}`}>{t.status}</span>
            </div>
          ))
        )}
        <Link href="/booking/request" className="btn-outline inline-flex px-5 py-2.5 text-sm">+ Submit tour listing request</Link>
      </div>
    ),

    bookings: (
      <Panel title="Booking requests" subtitle="Live from Supabase booking_requests">
        {bookings.length === 0 ? (
          <DashboardEmpty title="No bookings yet" message="Traveler booking requests will appear here when submitted." />
        ) : (
          bookings.map((b) => (
            <TableRow
              key={String(b.id)}
              cells={[String(b.service_name ?? b.service_type), String(b.full_name), formatDate(String(b.created_at))]}
              badge={String(b.status)}
              badgeColor={b.status === "confirmed" ? "green" : "blue"}
            />
          ))
        )}
      </Panel>
    ),

    leads: (
      <Panel title="Lead inbox" subtitle="Live from Supabase lead_requests" noPad>
        {leads.length === 0 ? (
          <div className="p-8"><DashboardEmpty title="No leads yet" message="Qualified leads from travelers appear here." action={<Link href="/lead/contact" className="btn-primary px-5 py-2.5 text-sm">Lead contact form</Link>} /></div>
        ) : (
          <div className="divide-y divide-soft-200">
            {leads.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-bold text-navy">{l.full_name}</p>
                  <p className="text-sm text-charcoal/55">{l.email} · {formatDate(l.created_at)}</p>
                  {l.message && <p className="mt-1 text-xs text-charcoal/50 line-clamp-2">{l.message}</p>}
                </div>
                <span className={`chip text-xs ${l.status === "pending" ? "bg-gold/15 text-navy" : "bg-emerald-50 text-emerald-700"}`}>{l.status}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    ),

    revenue: (
      <div className="space-y-5">
        <ProviderEarningsSummary compact />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total paid" value={formatPaymentAmount(paidTotal)} icon="star" color="gold" />
          <StatCard label="Transactions" value={String(payments.length)} icon="doc" color="blue" />
          <StatCard label="Pending" value={String(payments.filter((p) => p.status === "pending").length)} icon="users" color="navy" />
        </div>
        <PayoutSetupPanel />
        {payments.length > 0 && (
          <Panel title="Payment history">
            {payments.map((p) => (
              <TableRow key={p.id} cells={[p.description ?? p.service_type ?? "Payment", formatDate(p.paid_at ?? p.created_at), formatPaymentAmount(Number(p.amount), p.currency)]} badge={p.status} badgeColor={p.status === "paid" ? "green" : "blue"} />
            ))}
          </Panel>
        )}
      </div>
    ),

    messages: <MessagesInbox title="Agency messages" />,

    verification: (
      <div className="space-y-4">
        <Panel title="Verification status" subtitle="Complete your profile and upload documents to get verified">
          <div className="space-y-3 text-sm text-charcoal/65">
            <p>Profile completion: <strong className="text-navy">{user.completion}%</strong></p>
            <p>Verified status: <strong className="text-navy">{user.verified ? "Verified" : "Not verified yet"}</strong></p>
          </div>
          <Link href="/dashboard/profile" className="mt-4 inline-block btn-outline px-4 py-2 text-sm">Complete profile</Link>
        </Panel>
        <Disclaimer>
          Verification confirms business identity only. Globe Travel Voyage is not a government agency, embassy, immigration lawyer, airline, cruise company, travel supplier, real estate broker, or official visa authority.
        </Disclaimer>
      </div>
    ),
  };

  return (
    <DashboardLayout
      role={user.roleLabel}
      name={user.result?.ok && user.result.profile.company_name ? user.result.profile.company_name : user.displayName}
      initials={user.initials}
      email={user.email}
      profileCompletion={user.completion}
      tabs={tabs}
      sections={sections}
      verified={user.verified}
      roleColor="bg-emerald-50 text-emerald-700"
      avatarColor="bg-emerald-700 text-white"
    />
  );
}
