"use client";

import { useState, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/auth";
import {
  fetchAdminCounts,
  fetchAdminVisaRequests,
  fetchAdminProfiles,
  fetchAdminPayments,
  fetchAdminBookingRequests,
  fetchAdminSupportTickets,
  fetchAdminVisaCases,
  fetchAdminStripeBookings,
  fetchAdminEmailLogs,
  type AdminDashboardCounts,
  type AdminProfileRow,
  type AdminPaymentRow,
  type AdminVisaCaseRow,
  type AdminStripeBookingRow,
  type AdminEmailLogRow,
} from "@/lib/supabase/queries";
import { fetchAdminProviders, fetchAdminProviderServices } from "@/lib/supabase/mvp-queries";
import {
  fetchAdminConnectStats,
  fetchAdminConnectProviders,
  type AdminConnectStats,
  type AdminConnectProviderRow,
} from "@/lib/supabase/connect-queries";
import { updateIntakeStatus } from "@/lib/supabase/mvp-actions";
import { SITE_CONFIG } from "@/lib/site-config";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { DatabaseStatusBanner } from "@/components/DatabaseStatusBanner";
import { ROLE_LABELS } from "@/lib/auth";
import type { UserRole } from "@/lib/supabase/types";
import Link from "next/link";
import { formatPaymentAmount, formatPaymentDate, paymentServiceLabel } from "@/lib/payments-display";
import { Icon } from "@/components/Icon";
import {
  DashboardLayout,
  StatCard,
  Panel,
  TableRow,
  type DashboardTab,
} from "@/components/DashboardLayout";

const tabs: DashboardTab[] = [
  { key: "overview",      label: "Overview",          icon: "globe" },
  { key: "users",         label: "Users & Roles",     icon: "users" },
  { key: "verification",  label: "Verification Queue",icon: "shield" },
  { key: "visarequests",  label: "Visa Requests",     icon: "visa" },
  { key: "agencies",      label: "Agencies",          icon: "agent" },
  { key: "visaexperts",   label: "Visa Experts",      icon: "visa" },
  { key: "guides",        label: "Tour Guides",       icon: "planner" },
  { key: "tours",         label: "Tours & Tickets",   icon: "ticket" },
  { key: "properties",    label: "Properties",        icon: "property" },
  { key: "bookings",      label: "Bookings",          icon: "doc" },
  { key: "payments",      label: "Payments",          icon: "star" },
  { key: "referrals",     label: "Referrals",         icon: "users" },
  { key: "reviews",       label: "Reviews",           icon: "star" },
  { key: "support",       label: "Support Tickets",   icon: "shield" },
  { key: "seo",           label: "SEO Pages",         icon: "globe" },
  { key: "settings",      label: "Settings",          icon: "agent" },
];

// ─── Mock data ─────────────────────────────────────────────────────────────────

const verificationQueue = [
  { name: "Global Visas Ltd.", type: "Agency", country: "🇦🇪 UAE", submitted: "Jun 10", docs: 4 },
  { name: "Rania Hassan", type: "Visa Expert", country: "🇪🇬 Egypt", submitted: "Jun 9", docs: 3 },
  { name: "Pearl Tours", type: "Agency", country: "🇵🇭 Philippines", submitted: "Jun 8", docs: 5 },
  { name: "Ahmed Travels", type: "Agency", country: "🇵🇰 Pakistan", submitted: "Jun 7", docs: 4 },
  { name: "Fatima Al-Ali", type: "Tour Guide", country: "🇦🇪 UAE", submitted: "Jun 7", docs: 2 },
  { name: "Nadia F.", type: "Visa Expert", country: "🇲🇦 Morocco", submitted: "Jun 6", docs: 3 },
  { name: "Dubai Luxury Stays", type: "Host", country: "🇦🇪 UAE", submitted: "Jun 5", docs: 6 },
];

const agencies = [
  { name: "Voyage Pro Travels", country: "🇦🇪 UAE", packages: 3, tours: 7, bookings: 42, revenue: "$28.4k", verified: true, status: "Active" },
  { name: "Orient Express Travel", country: "🇵🇰 Pakistan", packages: 5, tours: 12, bookings: 28, revenue: "$18.2k", verified: true, status: "Active" },
  { name: "Global Wings Agency", country: "🇵🇭 Philippines", packages: 2, tours: 4, bookings: 15, revenue: "$9.8k", verified: false, status: "Active" },
  { name: "Pearl of Asia Tours", country: "🇮🇳 India", packages: 4, tours: 9, bookings: 33, revenue: "$21.5k", verified: true, status: "Active" },
];

const referrals = [
  { code: "GLOBE-ALI-4821", user: "Ali Hassan", referred: 3, tier: "Silver", earned: "$45", payout: "$15 pending" },
  { code: "GLOBE-ZAI-2190", user: "Zainab R.", referred: 8, tier: "Gold", earned: "$180", payout: "$30 pending" },
  { code: "GLOBE-TAR-0041", user: "Tariq M.", referred: 12, tier: "Platinum", earned: "$360", payout: "Settled" },
];

type CommissionStatus = "pending" | "approved" | "paid" | "fraud_review";

interface AdminCommission {
  id: string;
  referrer: string;
  referrerEmail: string;
  referral: string;
  action: string;
  amount: number;
  status: CommissionStatus;
  date: string;
  fraudFlag?: string;
}

const adminCommissions: AdminCommission[] = [
  { id: "CM001", referrer: "Ali Hassan",  referrerEmail: "ali@example.com",    referral: "Sara Malik",   action: "AI Visa Guidance",  amount: 4.35,  status: "pending",      date: "Jun 10" },
  { id: "CM002", referrer: "Zainab R.",   referrerEmail: "zainab@example.com", referral: "Omar Hassan",  action: "First purchase",    amount: 7.50,  status: "pending",      date: "Jun 10" },
  { id: "CM003", referrer: "Tariq M.",    referrerEmail: "tariq@example.com",  referral: "Fatima Ali",   action: "Expert signup",     amount: 29.80, status: "approved",     date: "Jun 9"  },
  { id: "CM004", referrer: "Sara J.",     referrerEmail: "sara@example.com",   referral: "Bilal Ahmed",  action: "Bundle purchase",   amount: 17.88, status: "paid",         date: "Jun 8"  },
  { id: "CM005", referrer: "Omar F.",     referrerEmail: "omar@example.com",   referral: "Nadia Iqbal",  action: "User signup",       amount: 2.00,  status: "fraud_review", date: "Jun 7", fraudFlag: "Duplicate email detected" },
  { id: "CM006", referrer: "Khalid R.",   referrerEmail: "khalid@example.com", referral: "Khalid Raza",  action: "Trip plan",         amount: 1.90,  status: "pending",      date: "Jun 6"  },
  { id: "CM007", referrer: "Amira Y.",    referrerEmail: "amira@example.com",  referral: "Amira Yusuf",  action: "First purchase",    amount: 12.00, status: "paid",         date: "Jun 5"  },
  { id: "CM008", referrer: "Ali Hassan",  referrerEmail: "ali@example.com",    referral: "Rashid Ali",   action: "Agency lead",       amount: 9.90,  status: "fraud_review", date: "Jun 4", fraudFlag: "Unusual referral pattern" },
  { id: "CM009", referrer: "Zainab R.",   referrerEmail: "zainab@example.com", referral: "Layla M.",     action: "Property lead",     amount: 2.90,  status: "approved",     date: "Jun 3"  },
  { id: "CM010", referrer: "Tariq M.",    referrerEmail: "tariq@example.com",  referral: "David L.",     action: "Featured listing",  amount: 29.80, status: "paid",         date: "Jun 2"  },
];

const flaggedReviews = [
  { id: "REV-441", reviewer: "Anonymous", target: "Ahmed Travels", rating: 1, text: "Scam! Never delivered the package.", flag: "Spam/Fraud", date: "Jun 9" },
  { id: "REV-440", reviewer: "User4821", target: "Orient Express Travel", rating: 2, text: "Overcharged me.", flag: "Pricing dispute", date: "Jun 8" },
  { id: "REV-438", reviewer: "Maria L.", target: "Unknown Agent", rating: 1, text: "No response from agent.", flag: "Quality issue", date: "Jun 7" },
];

const seoPages = [
  { slug: "/visa/usa-from-pakistan", title: "USA Visa from Pakistan Guide", views: 12400, rank: "3", lastEdited: "Jun 5", status: "Published" },
  { slug: "/visa/usa", title: "USA Visa Information", views: 8900, rank: "8", lastEdited: "Jun 3", status: "Published" },
  { slug: "/visa/schengen", title: "Schengen Visa Guide", views: 5200, rank: "12", lastEdited: "May 28", status: "Published" },
  { slug: "/flights", title: "Cheap Flights — Comparison", views: 3100, rank: "—", lastEdited: "Jun 1", status: "Published" },
  { slug: "/guides/best-time-to-visit-dubai", title: "Best Time to Visit Dubai", views: 2800, rank: "5", lastEdited: "May 20", status: "Draft" },
];

// ─── Visa Requests data ───────────────────────────────────────────────────────

type VRStatus = "pending" | "reviewing" | "approved" | "rejected" | "submitted";

interface VisaRequestItem {
  id: string;
  name: string;
  nationality: string;
  destination: string;
  purpose: string;
  submitted: string;
  status: VRStatus;
  assignedTo: string;
  email: string;
}

const EXPERTS_LIST = ["Sana Malik", "Hassan Al-Qadi", "Priya Sharma", "Rania Hassan"];

// ─── Visa Requests Tab ────────────────────────────────────────────────────────

const VR_STATUS_STYLES: Record<VRStatus, string> = {
  pending:   "bg-gold/10 text-amber-700",
  reviewing: "bg-blue/10 text-blue",
  submitted: "bg-purple-50 text-purple-700",
  approved:  "bg-emerald-50 text-emerald-700",
  rejected:  "bg-red-50 text-red-600",
};

const VR_STATUS_LABELS: Record<VRStatus, string> = {
  pending:   "Pending",
  reviewing: "Under Review",
  submitted: "Submitted to Embassy",
  approved:  "Approved",
  rejected:  "Rejected",
};

function formatSubmittedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function mapDbVisaRequest(row: {
  id: string;
  full_name: string;
  email: string;
  nationality: string | null;
  destination: string;
  purpose: string | null;
  status: string;
  created_at: string;
}): VisaRequestItem {
  const status = (["pending", "reviewing", "submitted", "approved", "rejected"].includes(row.status)
    ? row.status
    : "pending") as VRStatus;

  return {
    id: `VR-${row.id.slice(0, 4).toUpperCase()}`,
    name: row.full_name,
    nationality: row.nationality ?? "—",
    destination: row.destination,
    purpose: row.purpose ?? "—",
    submitted: formatSubmittedDate(row.created_at),
    status,
    assignedTo: "—",
    email: row.email,
  };
}

function VisaRequestsTab() {
  const [requests, setRequests] = useState<VisaRequestItem[]>([]);
  const [filter, setFilter]     = useState<"all" | VRStatus>("all");
  const [search, setSearch]     = useState("");
  const [toast, setToast]       = useState<string | null>(null);
  const [liveLoaded, setLiveLoaded] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchAdminVisaRequests().then((rows) => {
      if (rows.length > 0) {
        setRequests(rows.map(mapDbVisaRequest));
        setLiveLoaded(true);
      }
    });
  }, []);

  function updateStatus(id: string, status: VRStatus) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    setToast(`Request ${id} updated to "${VR_STATUS_LABELS[status]}"`);
    setTimeout(() => setToast(null), 3000);
  }

  function assignExpert(id: string, expert: string) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, assignedTo: expert, status: "reviewing" } : r));
    setToast(`${id} assigned to ${expert}`);
    setTimeout(() => setToast(null), 3000);
  }

  const displayed = requests
    .filter((r) => filter === "all" || r.status === filter)
    .filter((r) =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.nationality.toLowerCase().includes(search.toLowerCase()) ||
      r.destination.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    pending:   requests.filter((r) => r.status === "pending").length,
    reviewing: requests.filter((r) => r.status === "reviewing").length,
    submitted: requests.filter((r) => r.status === "submitted").length,
    approved:  requests.filter((r) => r.status === "approved").length,
    rejected:  requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-premium)] animate-fade-up">
          ✓ {toast}
        </div>
      )}

      {liveLoaded && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ Showing live visa requests from Supabase ({requests.length} total).
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        <StatCard label="Pending" value={String(counts.pending)} icon="shield" color="gold" />
        <StatCard label="Under Review" value={String(counts.reviewing)} icon="doc" color="blue" />
        <StatCard label="Submitted" value={String(counts.submitted)} icon="visa" color="navy" />
        <StatCard label="Approved" value={String(counts.approved)} icon="check" color="green" />
        <StatCard label="Rejected" value={String(counts.rejected)} icon="globe" color="navy" />
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="input flex-1 text-sm"
          placeholder="Search by name, nationality, destination…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-1 rounded-xl border border-soft-200 bg-soft p-1 overflow-x-auto">
          {(["all", "pending", "reviewing", "submitted", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                filter === f ? "bg-white text-navy shadow-sm" : "text-charcoal/50 hover:text-navy"
              }`}
            >
              {f === "all" ? `All (${requests.length})` : `${VR_STATUS_LABELS[f]} (${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      <Panel title="Visa Applications" subtitle={`Showing ${displayed.length} of ${requests.length} requests`} noPad>
        {displayed.length === 0 ? (
          <div className="py-12 text-center text-charcoal/40 text-sm">No requests match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-soft-200 bg-soft/50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">ID</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Applicant</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Destination</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Purpose</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Assigned To</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-200">
                {displayed.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-soft/30">
                    <td className="px-5 py-4 text-xs font-mono text-charcoal/50">{r.id}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-navy">{r.name}</p>
                      <p className="text-xs text-charcoal/40">{r.nationality} · {r.submitted}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-charcoal/70">{r.destination}</td>
                    <td className="px-4 py-4">
                      <span className="chip text-xs">{r.purpose}</span>
                    </td>
                    <td className="px-4 py-4">
                      {r.assignedTo === "—" ? (
                        <select
                          className="rounded-lg border border-soft-200 bg-white px-2 py-1 text-xs text-charcoal/60 focus:outline-none focus:border-blue"
                          defaultValue=""
                          onChange={(e) => { if (e.target.value) assignExpert(r.id, e.target.value); }}
                        >
                          <option value="">Assign expert</option>
                          {EXPERTS_LIST.map((ex) => <option key={ex} value={ex}>{ex}</option>)}
                        </select>
                      ) : (
                        <span className="text-xs font-medium text-blue">{r.assignedTo}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${VR_STATUS_STYLES[r.status]}`}>
                        {VR_STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {r.status === "pending" && (
                          <button onClick={() => updateStatus(r.id, "reviewing")} className="rounded-lg border border-blue/30 bg-blue/5 px-2.5 py-1 text-[11px] font-semibold text-blue hover:bg-blue/10 transition-colors">
                            Review
                          </button>
                        )}
                        {(r.status === "pending" || r.status === "reviewing") && (
                          <>
                            <button onClick={() => updateStatus(r.id, "submitted")} className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 transition-colors">
                              Submit
                            </button>
                            <button onClick={() => updateStatus(r.id, "approved")} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                              ✓ Approve
                            </button>
                            <button onClick={() => updateStatus(r.id, "rejected")} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition-colors">
                              ✕ Reject
                            </button>
                          </>
                        )}
                        {r.status === "submitted" && (
                          <button onClick={() => updateStatus(r.id, "approved")} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                            ✓ Mark Approved
                          </button>
                        )}
                        {(r.status === "approved" || r.status === "rejected") && (
                          <button onClick={() => updateStatus(r.id, "pending")} className="rounded-lg border border-soft-300 bg-soft px-2.5 py-1 text-[11px] font-semibold text-charcoal/50 hover:bg-soft-200 transition-colors">
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-soft-200 px-5 py-3 text-xs text-charcoal/40">
          Showing {displayed.length} of {requests.length} visa applications
        </div>
      </Panel>
    </div>
  );
}

// ─── Tour Guides Tab ──────────────────────────────────────────────────────────

const INITIAL_GUIDES = [
  { id: "TG-01", name: "Khalid Raza",    city: "Dubai",     rating: 4.9, tours: 12, bookings: 84,  languages: "EN, AR", status: "Active",  verified: true },
  { id: "TG-02", name: "Priya Nair",     city: "Dubai",     rating: 4.8, tours: 8,  bookings: 61,  languages: "EN, HI", status: "Active",  verified: true },
  { id: "TG-03", name: "Hassan Salim",   city: "Istanbul",  rating: 4.7, tours: 6,  bookings: 45,  languages: "EN, TR", status: "Active",  verified: true },
  { id: "TG-04", name: "Ana Reyes",      city: "Manila",    rating: 4.6, tours: 5,  bookings: 32,  languages: "EN, TL", status: "Active",  verified: false },
  { id: "TG-05", name: "Omar Shaikh",    city: "Lahore",    rating: 4.5, tours: 4,  bookings: 18,  languages: "EN, UR", status: "Active",  verified: false },
  { id: "TG-06", name: "Sofia Costa",    city: "Lisbon",    rating: 0,   tours: 0,  bookings: 0,   languages: "EN, PT", status: "Pending", verified: false },
  { id: "TG-07", name: "Ali Abdullah",   city: "Riyadh",    rating: 4.8, tours: 9,  bookings: 70,  languages: "EN, AR", status: "Active",  verified: true },
];

type GuideStatus = "Active" | "Pending" | "Suspended";

function GuidesTab() {
  const [guides, setGuides] = useState(INITIAL_GUIDES);
  const [toast, setToast]   = useState<string | null>(null);

  function toggleStatus(id: string, current: GuideStatus) {
    const next: GuideStatus = current === "Active" ? "Suspended" : "Active";
    setGuides((prev) => prev.map((g) => g.id === id ? { ...g, status: next } : g));
    setToast(`Guide updated to "${next}"`);
    setTimeout(() => setToast(null), 3000);
  }

  function toggleVerify(id: string) {
    setGuides((prev) => prev.map((g) => g.id === id ? { ...g, verified: !g.verified } : g));
    setToast("Verification status updated");
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-premium)] animate-fade-up">
          ✓ {toast}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total guides" value={String(guides.length)} icon="planner" color="blue" />
        <StatCard label="Verified" value={String(guides.filter((g) => g.verified).length)} icon="check" color="green" />
        <StatCard label="Active" value={String(guides.filter((g) => g.status === "Active").length)} icon="globe" color="gold" />
        <StatCard label="Pending review" value={String(guides.filter((g) => g.status === "Pending").length)} icon="shield" color="navy" />
      </div>

      <Panel title="All Tour Guides" noPad>
        <div className="divide-y divide-soft-200">
          {guides.map((g) => (
            <div key={g.id} className="flex items-center justify-between gap-4 p-5 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy/8 text-sm font-bold text-navy">
                  {g.name[0]}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-navy">{g.name}</p>
                    {g.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-2 py-0.5 text-[11px] font-semibold text-blue">
                        <Icon name="check" className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal/50">
                    {g.city} · {g.languages} · {g.tours} tours · {g.bookings} bookings
                    {g.rating > 0 && ` · ⭐ ${g.rating}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`chip text-xs ${g.status === "Active" ? "bg-emerald-50 text-emerald-700" : g.status === "Pending" ? "bg-gold/15 text-amber-700" : "bg-red-50 text-red-600"}`}>
                  {g.status}
                </span>
                {!g.verified && g.status !== "Pending" && (
                  <button onClick={() => toggleVerify(g.id)} className="rounded-lg border border-blue/30 bg-blue/5 px-2.5 py-1 text-[11px] font-semibold text-blue hover:bg-blue/10">
                    Verify
                  </button>
                )}
                  {g.status === "Pending" && (
                  <button onClick={() => { setGuides((p) => p.map((x) => x.id === g.id ? { ...x, status: "Active", verified: true } : x)); setToast("Guide approved and verified"); setTimeout(() => setToast(null), 3000); }} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100">
                    ✓ Approve
                  </button>
                  )}
                <button
                  onClick={() => toggleStatus(g.id, g.status as GuideStatus)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${g.status === "Active" ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                >
                  {g.status === "Active" ? "Suspend" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ─── Verification Queue Tab ──────────────────────────────────────────────────

type VerifStatus = "pending" | "approved" | "rejected" | "reviewing";

interface VerifItem {
  name: string;
  type: string;
  country: string;
  submitted: string;
  docs: number;
  status: VerifStatus;
}

const INITIAL_VERIF: VerifItem[] = verificationQueue.map((v) => ({ ...v, status: "pending" as VerifStatus }));

function VerificationQueueTab() {
  const [items, setItems] = useState<VerifItem[]>(INITIAL_VERIF);
  const [filter, setFilter] = useState<"all" | VerifStatus>("all");

  function updateStatus(name: string, status: VerifStatus) {
    setItems((prev) => prev.map((v) => v.name === name ? { ...v, status } : v));
  }

  const filtered = filter === "all" ? items : items.filter((v) => v.status === filter);

  const counts = {
    pending:   items.filter((v) => v.status === "pending").length,
    approved:  items.filter((v) => v.status === "approved").length,
    rejected:  items.filter((v) => v.status === "rejected").length,
    reviewing: items.filter((v) => v.status === "reviewing").length,
  };

  const STATUS_STYLE: Record<VerifStatus, string> = {
    pending:   "bg-gold/10 text-gold",
    approved:  "bg-emerald-50 text-emerald-700",
    rejected:  "bg-red-50 text-red-600",
    reviewing: "bg-blue/10 text-blue",
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Awaiting review" value={String(counts.pending)} icon="shield" color="gold" />
        <StatCard label="Under review" value={String(counts.reviewing)} icon="doc" color="blue" />
        <StatCard label="Approved (session)" value={String(counts.approved)} icon="check" color="green" />
        <StatCard label="Rejected (session)" value={String(counts.rejected)} icon="globe" color="navy" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 w-fit rounded-xl bg-soft border border-soft-200 p-1">
        {(["all", "pending", "reviewing", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
              filter === f ? "bg-white text-navy shadow-sm" : "text-charcoal/50 hover:text-navy"
            }`}
          >
            {f === "all" ? `All (${items.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
          </button>
        ))}
      </div>

      <Panel title="Verification Queue" subtitle="Review and approve business verifications" noPad>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-charcoal/40 text-sm">No items in this category.</div>
        ) : (
          <div className="divide-y divide-soft-200">
            {filtered.map((v) => (
              <div key={v.name} className="flex items-center justify-between gap-4 p-5 flex-wrap">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy/5 text-sm font-bold text-navy">
                    {v.type[0]}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-navy">{v.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[v.status]}`}>
                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-charcoal/55">
                      {v.country} · {v.type} · {v.docs} docs · Submitted {v.submitted}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {v.status === "pending" && (
                    <button onClick={() => updateStatus(v.name, "reviewing")} className="btn-outline px-3 py-1.5 text-xs text-blue border-blue/30 hover:bg-blue/5">
                      Start review
                    </button>
                  )}
                  {(v.status === "pending" || v.status === "reviewing") && (
                    <>
                      <button onClick={() => updateStatus(v.name, "approved")} className="btn-outline px-3 py-1.5 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                        ✓ Approve
                      </button>
                      <button onClick={() => updateStatus(v.name, "rejected")} className="btn-outline px-3 py-1.5 text-xs text-red-500 border-red-200 hover:bg-red-50">
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {v.status === "approved" && (
                    <button onClick={() => updateStatus(v.name, "pending")} className="btn-outline px-3 py-1.5 text-xs text-charcoal/50">
                      Undo
                    </button>
                  )}
                  {v.status === "rejected" && (
                    <button onClick={() => updateStatus(v.name, "pending")} className="btn-outline px-3 py-1.5 text-xs text-gold border-gold/30">
                      Re-review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ─── Reviews Tab ─────────────────────────────────────────────────────────────

type ReviewAction = "pending" | "approved" | "removed" | "contacted";

interface AdminReview {
  id: string;
  reviewer: string;
  target: string;
  rating: number;
  text: string;
  flag: string;
  date: string;
  action: ReviewAction;
}

const INITIAL_REVIEWS: AdminReview[] = flaggedReviews.map((r) => ({ ...r, action: "pending" as ReviewAction }));

function ReviewsManagementTab() {
  const [reviews, setReviews] = useState<AdminReview[]>(INITIAL_REVIEWS);

  function updateAction(id: string, action: ReviewAction) {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, action } : r));
  }

  const ACTION_STYLE: Record<ReviewAction, string> = {
    pending:   "bg-gold/10 text-gold",
    approved:  "bg-emerald-50 text-emerald-700",
    removed:   "bg-red-50 text-red-500",
    contacted: "bg-blue/10 text-blue",
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total reviews" value="2,180" icon="star" color="blue" />
        <StatCard label="Avg platform rating" value="4.7 ★" icon="star" color="gold" />
        <StatCard label="Flagged / pending" value={String(reviews.filter((r) => r.action === "pending").length)} icon="shield" color="navy" />
      </div>

      <Panel title="Flagged Reviews — Requires Action" noPad>
        {reviews.length === 0 ? (
          <div className="py-12 text-center text-charcoal/40 text-sm">No flagged reviews.</div>
        ) : (
          <div className="divide-y divide-soft-200">
            {reviews.map((r) => (
              <div key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-navy">{r.reviewer}</p>
                      <span className="chip bg-red-50 text-red-500 text-xs">{r.flag}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ACTION_STYLE[r.action]}`}>
                        {r.action.charAt(0).toUpperCase() + r.action.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal/50">Target: {r.target} · {r.date}</p>
                    <p className="mt-2 text-sm text-charcoal/70 italic">&ldquo;{r.text}&rdquo;</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-sm ${i < r.rating ? "text-gold" : "text-soft-200"}`}>★</span>
                    ))}
                  </div>
                </div>
                {r.action === "pending" && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <button onClick={() => updateAction(r.id, "approved")} className="btn-outline px-3 py-1.5 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                      ✓ Approve review
                    </button>
                    <button onClick={() => updateAction(r.id, "removed")} className="btn-outline px-3 py-1.5 text-xs text-red-500 border-red-200 hover:bg-red-50">
                      ✕ Remove review
                    </button>
                    <button onClick={() => updateAction(r.id, "contacted")} className="btn-outline px-3 py-1.5 text-xs text-blue border-blue/30 hover:bg-blue/5">
                      📧 Contact reviewer
                    </button>
                  </div>
                )}
                {r.action !== "pending" && (
                  <div className="mt-2">
                    <button onClick={() => updateAction(r.id, "pending")} className="text-xs text-charcoal/40 hover:text-navy underline">
                      Undo action
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ─── Admin Commissions Tab ─────────────────────────────────────────────────────

const COMM_STATUS_STYLES: Record<CommissionStatus, { badge: string; dot: string; label: string }> = {
  pending:      { badge: "bg-gold/10 text-gold",          dot: "bg-gold",        label: "Pending"       },
  approved:     { badge: "bg-blue/10 text-blue",          dot: "bg-blue",        label: "Approved"      },
  paid:         { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", label: "Paid"          },
  fraud_review: { badge: "bg-red-50 text-red-600",        dot: "bg-red-500",     label: "Fraud Review"  },
};

function AdminCommissionsTab() {
  const [commissions, setCommissions] = useState<AdminCommission[]>(adminCommissions);
  const [filter, setFilter] = useState<"all" | CommissionStatus>("all");

  function updateStatus(id: string, newStatus: CommissionStatus) {
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  }

  const filtered = filter === "all" ? commissions : commissions.filter((c) => c.status === filter);

  const totals = {
    pending:      commissions.filter((c) => c.status === "pending").reduce((s, c) => s + c.amount, 0),
    approved:     commissions.filter((c) => c.status === "approved").reduce((s, c) => s + c.amount, 0),
    paid:         commissions.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0),
    fraud_review: commissions.filter((c) => c.status === "fraud_review").length,
  };

  const FILTERS: { key: "all" | CommissionStatus; label: string }[] = [
    { key: "all",          label: `All (${commissions.length})`                                    },
    { key: "pending",      label: `Pending (${commissions.filter((c) => c.status === "pending").length})` },
    { key: "approved",     label: `Approved (${commissions.filter((c) => c.status === "approved").length})` },
    { key: "paid",         label: `Paid (${commissions.filter((c) => c.status === "paid").length})` },
    { key: "fraud_review", label: `Fraud Review (${totals.fraud_review})`                          },
  ];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Pending payout"  value={`$${totals.pending.toFixed(2)}`}  icon="doc"    color="gold"  />
        <StatCard label="Approved"        value={`$${totals.approved.toFixed(2)}`} icon="check"  color="blue"  />
        <StatCard label="Total paid out"  value={`$${totals.paid.toFixed(2)}`}     icon="star"   color="green" />
        <StatCard label="Fraud review"    value={String(totals.fraud_review)}      icon="shield" color="navy"  />
      </div>

      {/* Fraud alerts */}
      {commissions.some((c) => c.status === "fraud_review") && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold text-red-700">Fraud review required</p>
              <p className="mt-0.5 text-sm text-red-600">
                {totals.fraud_review} commission{totals.fraud_review !== 1 ? "s" : ""} flagged for review. Investigate before approving.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Commission table */}
      <Panel title="Commission Approval Queue" subtitle="Review and approve referral commissions" noPad>
        {/* Filter tabs */}
        <div className="flex border-b border-soft-200 px-5 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`border-b-2 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "border-blue text-blue"
                  : "border-transparent text-charcoal/40 hover:text-navy"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-soft-200 bg-soft/50">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Referrer</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Referral</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Action</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Date</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Amount</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-200">
              {filtered.map((c) => {
                const st = COMM_STATUS_STYLES[c.status];
                return (
                  <tr key={c.id} className={`transition-colors hover:bg-soft/30 ${c.status === "fraud_review" ? "bg-red-50/40" : ""}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-navy">{c.referrer}</p>
                      <p className="text-xs text-charcoal/40">{c.referrerEmail}</p>
                    </td>
                    <td className="px-4 py-4 text-charcoal/65 text-sm">{c.referral}</td>
                    <td className="px-4 py-4 text-charcoal/65 text-sm">{c.action}</td>
                    <td className="px-4 py-4 text-charcoal/45 text-xs">{c.date}</td>
                    <td className="px-4 py-4 text-right font-bold text-navy">${c.amount.toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                        {c.fraudFlag && (
                          <span className="text-[10px] text-red-500 font-medium">⚠ {c.fraudFlag}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {c.status === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(c.id, "approved")}
                              className="rounded-lg bg-blue/10 px-2.5 py-1 text-xs font-semibold text-blue hover:bg-blue hover:text-white transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(c.id, "fraud_review")}
                              className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                            >
                              Flag fraud
                            </button>
                          </>
                        )}
                        {c.status === "approved" && (
                          <button
                            onClick={() => updateStatus(c.id, "paid")}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            Mark paid
                          </button>
                        )}
                        {c.status === "fraud_review" && (
                          <>
                            <button
                              onClick={() => updateStatus(c.id, "approved")}
                              className="rounded-lg bg-blue/10 px-2.5 py-1 text-xs font-semibold text-blue hover:bg-blue hover:text-white transition-colors"
                            >
                              Clear & approve
                            </button>
                            <button
                              onClick={() => updateStatus(c.id, "pending")}
                              className="rounded-lg bg-soft px-2.5 py-1 text-xs font-semibold text-charcoal/60 hover:bg-soft-200 transition-colors"
                            >
                              Reset
                            </button>
                          </>
                        )}
                        {c.status === "paid" && (
                          <span className="text-xs text-emerald-600 font-semibold">✓ Settled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-10 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold text-navy">No commissions in this view</p>
          </div>
        )}

        <div className="border-t border-soft-200 px-5 py-3 flex items-center justify-between text-xs text-charcoal/40">
          <span>Showing {filtered.length} of {commissions.length} commissions</span>
          <span>Stripe payments — updated via webhook</span>
        </div>
      </Panel>

      {/* Top referrers */}
      <Panel title="Top Referrers" noPad>
        <div className="divide-y divide-soft-200">
          {referrals.map((r) => (
            <div key={r.code} className="flex items-center justify-between p-5">
              <div>
                <p className="font-bold text-navy">{r.user}</p>
                <p className="text-sm text-charcoal/55">Code: {r.code} · {r.referred} referrals · {r.tier} tier</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-bold text-navy">{r.earned} earned</p>
                  <p className="text-xs text-charcoal/50">{r.payout}</p>
                </div>
                <button className="btn-outline px-3 py-1.5 text-xs">Process</button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

function formatRoleLabel(role: string | null): string {
  if (!role) return "Traveler";
  return ROLE_LABELS[role as UserRole] ?? role;
}

function formatJoinedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AdminDashboard() {
  const dashUser = useDashboardUser();
  const [userSearch, setUserSearch] = useState("");
  const [liveCounts, setLiveCounts] = useState<AdminDashboardCounts | null>(null);
  const [adminToast, setAdminToast] = useState<string | null>(null);
  const [liveProfiles, setLiveProfiles] = useState<AdminProfileRow[]>([]);
  const [livePayments, setLivePayments] = useState<AdminPaymentRow[]>([]);
  const [liveBookings, setLiveBookings] = useState<Array<{
    id: string;
    service_name: string | null;
    service_type: string;
    full_name: string;
    email: string;
    status: string;
    created_at: string;
  }>>([]);
  const [liveSupport, setLiveSupport] = useState<Array<{
    id: string;
    subject: string;
    status: string;
    created_at: string;
  }>>([]);
  const [liveExperts, setLiveExperts] = useState<Array<{ id: string; is_verified: boolean; is_active: boolean }>>([]);
  const [liveServices, setLiveServices] = useState<Array<{ id: string; title: string; category: string | null; price: number; is_active: boolean }>>([]);
  const [liveVisaCases, setLiveVisaCases] = useState<AdminVisaCaseRow[]>([]);
  const [liveStripeBookings, setLiveStripeBookings] = useState<AdminStripeBookingRow[]>([]);
  const [liveEmailLogs, setLiveEmailLogs] = useState<AdminEmailLogRow[]>([]);
  const [liveConnectStats, setLiveConnectStats] = useState<AdminConnectStats | null>(null);
  const [liveConnectProviders, setLiveConnectProviders] = useState<AdminConnectProviderRow[]>([]);
  const [dbWarnings, setDbWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const warnings: string[] = [];

    void Promise.all([
      fetchAdminCounts().then(setLiveCounts),
      fetchAdminProfiles().then((res) => {
        if (!res.tableMissing && res.profiles.length > 0) setLiveProfiles(res.profiles);
      }),
      fetchAdminPayments().then((res) => {
        if (!res.tableMissing) setLivePayments(res.payments);
        if (res.tableMissing && res.error) warnings.push(res.error);
      }),
      fetchAdminBookingRequests().then((rows) => setLiveBookings(rows as typeof liveBookings)),
      fetchAdminSupportTickets().then((rows) => setLiveSupport(rows as typeof liveSupport)),
      fetchAdminProviders().then((res) => setLiveExperts(res.experts as typeof liveExperts)),
      fetchAdminProviderServices().then((rows) => setLiveServices(rows as typeof liveServices)),
      fetchAdminVisaCases().then((res) => {
        if (!res.tableMissing) setLiveVisaCases(res.cases);
        else if (res.error) warnings.push(res.error);
      }),
      fetchAdminStripeBookings().then((res) => {
        if (!res.tableMissing) setLiveStripeBookings(res.bookings);
        else if (res.error) warnings.push(res.error);
      }),
      fetchAdminEmailLogs().then((res) => {
        if (!res.tableMissing) setLiveEmailLogs(res.logs);
        else if (res.error) warnings.push(res.error);
      }),
      fetchAdminConnectStats().then(setLiveConnectStats),
      fetchAdminConnectProviders().then(setLiveConnectProviders),
    ]).then(() => setDbWarnings([...warnings]));
  }, []);
  const [featureToggles, setFeatureToggles] = useState([
    { label: "AI Visa Assistant",           enabled: true  },
    { label: "AI Trip Planner",             enabled: true  },
    { label: "Referral Program",            enabled: true  },
    { label: "Property Listings (Buy/Sell)",enabled: true  },
    { label: "New user registrations",      enabled: true  },
    { label: "Maintenance mode",            enabled: false },
  ]);

  function showToast(msg: string) {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3000);
  }

  function toggleFeature(label: string) {
    setFeatureToggles((prev) => prev.map((f) => f.label === label ? { ...f, enabled: !f.enabled } : f));
    showToast(`Feature "${label}" toggled`);
  }

  function updateTicketStatus(id: string, status: string) {
    setLiveSupport((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    showToast(`Ticket updated to "${status}" (refresh to sync with Supabase)`);
  }

  async function updateBookingStatus(id: string, status: string) {
    const result = await updateIntakeStatus("booking_requests", id, status);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setLiveBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    showToast(`Booking updated to "${status}"`);
  }

  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <DatabaseStatusBanner health={dashUser.databaseHealth} />
        {dbWarnings.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-1">
            {dbWarnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        )}
        {liveCounts && (
          <div className="rounded-xl border border-soft-200 bg-white px-4 py-3 text-sm text-muted">
            Platform records — {liveCounts.users} profiles · {liveCounts.visaRequests} visa requests · {liveCounts.bookingRequests} booking requests · {liveCounts.supportTickets} support tickets
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Payments" value={String(livePayments.length)} icon="star" hint="Stripe checkout" color="gold" />
          <StatCard label="Visa cases" value={String(liveVisaCases.length)} icon="visa" hint="Paid visa services" color="green" />
          <StatCard label="Stripe bookings" value={String(liveStripeBookings.length)} icon="doc" hint="Confirmed bookings" color="blue" />
          <StatCard label="Email logs" value={String(liveEmailLogs.length)} icon="shield" hint="Sent or logged" color="navy" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value={liveCounts ? String(liveCounts.users) : "0"} icon="users" hint="Registered profiles" color="blue" />
          <StatCard label="Booking requests" value={liveCounts ? String(liveCounts.bookingRequests) : "0"} icon="doc" hint="Live intake table" color="gold" />
          <StatCard label="Visa requests" value={liveCounts ? String(liveCounts.visaRequests) : "0"} icon="visa" hint="Live intake table" color="green" />
          <StatCard label="Support tickets" value={liveCounts ? String(liveCounts.supportTickets) : "0"} icon="shield" hint="Live from DB" color="navy" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Platform activity">
            <div className="space-y-2">
              {[
                { label: "Lead requests", value: liveCounts?.leadRequests ?? 0 },
                { label: "Property listings", value: liveCounts?.propertyListings ?? 0 },
                { label: "Referrals", value: liveCounts?.referrals ?? 0 },
                { label: "Payments", value: liveCounts?.payments ?? 0 },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl bg-soft p-3 text-sm">
                  <span className="text-charcoal/65">{s.label}</span>
                  <span className="font-bold text-navy">{s.value}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Booking requests">
            <div className="space-y-2">
              {liveBookings.length === 0 ? (
                <p className="text-sm text-charcoal/50 py-4 text-center">No booking requests yet.</p>
              ) : (
                liveBookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="rounded-xl bg-soft p-3 text-sm">
                    <p className="font-semibold text-navy">{b.service_name ?? b.service_type}</p>
                    <p className="text-xs text-charcoal/50">{b.full_name} · {b.status}</p>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel title="Support Overview">
            <div className="space-y-2">
              {[
                { label: "Open", value: liveSupport.filter((t) => t.status === "open").length, color: "bg-red-400" },
                { label: "In progress", value: liveSupport.filter((t) => t.status === "in_progress").length, color: "bg-gold" },
                { label: "Resolved", value: liveSupport.filter((t) => t.status === "resolved").length, color: "bg-emerald-500" },
                { label: "Total tickets", value: liveSupport.length, color: "bg-blue" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl bg-soft p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                    <span className="text-charcoal/65">{s.label}</span>
                  </div>
                  <span className="font-bold text-navy">{s.value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Recent Bookings">
          {liveBookings.length === 0 ? (
            <p className="p-6 text-center text-sm text-charcoal/50">No booking requests in Supabase yet.</p>
          ) : (
            liveBookings.slice(0, 4).map((b) => (
              <TableRow
                key={b.id}
                cells={[b.id.slice(0, 8), b.service_name ?? b.service_type, b.full_name]}
                badge={b.status}
                badgeColor={b.status === "confirmed" ? "green" : "gold"}
                action={<span className="text-xs text-charcoal/50">{formatJoinedDate(b.created_at)}</span>}
              />
            ))
          )}
        </Panel>

        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Visa experts", value: String(liveExperts.length), color: "gold" as const },
            { label: "Provider services", value: String(liveServices.length), color: "blue" as const },
            { label: "Booking requests", value: String(liveBookings.length), color: "green" as const },
            { label: "Support tickets", value: String(liveSupport.length), color: "navy" as const },
          ].map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} icon="globe" color={s.color} />
          ))}
        </div>
      </div>
    ),

    users: (
      <div className="space-y-5">
        <DatabaseStatusBanner health={dashUser.databaseHealth} />

        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total users" value={liveProfiles.length > 0 ? String(liveProfiles.length) : liveCounts ? String(liveCounts.users) : "—"} icon="users" color="blue" />
          <StatCard label="Active" value={liveProfiles.length > 0 ? String(liveProfiles.filter((p) => p.is_active).length) : "—"} icon="globe" color="green" />
          <StatCard label="With company" value={liveProfiles.length > 0 ? String(liveProfiles.filter((p) => p.company_name).length) : "—"} icon="shield" color="gold" />
          <StatCard label="Countries" value={liveProfiles.length > 0 ? String(new Set(liveProfiles.map((p) => p.country).filter(Boolean)).size) : "—"} icon="check" color="navy" />
        </div>

        <Panel title="Registered users" subtitle={liveProfiles.length > 0 ? "Live profiles from Supabase" : "Preview data — connect Supabase to see live profiles"}>
          <div className="mb-4 flex gap-3">
            <input
              className="input flex-1 text-sm"
              placeholder="Search by name, email, or role..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
          <div className="divide-y divide-soft-200">
            {(liveProfiles.length > 0 ? liveProfiles : []).length > 0 ? (
              liveProfiles
                .filter((p) => {
                  const q = userSearch.toLowerCase();
                  if (!q) return true;
                  return (
                    (p.full_name ?? "").toLowerCase().includes(q) ||
                    p.email.toLowerCase().includes(q) ||
                    (p.role ?? "").toLowerCase().includes(q)
                  );
                })
                .map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy/8 text-xs font-bold text-navy">
                        {(p.full_name ?? p.email).slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-navy">{p.full_name ?? "Unnamed user"}</p>
                        <p className="text-xs text-charcoal/45">{p.email} · {formatRoleLabel(p.role)} · {p.country ?? "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-charcoal/45">{formatJoinedDate(p.created_at)}</span>
                      <span className={`chip text-xs ${p.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              <p className="py-8 text-center text-sm text-charcoal/50">No registered users in Supabase yet.</p>
            )}
          </div>
        </Panel>

        <Panel title="Role Permissions">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soft-200">
                  {["Feature", "Customer", "Visa Expert", "Agency", "Guide", "Host", "Admin"].map((h) => (
                    <th key={h} className="pb-2 pr-4 text-left text-xs font-bold uppercase text-charcoal/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Book services", c: true, ve: false, ag: false, g: false, h: false, a: true },
                  { feature: "Offer services", c: false, ve: true, ag: true, g: true, h: true, a: true },
                  { feature: "View bookings", c: true, ve: true, ag: true, g: true, h: true, a: true },
                  { feature: "Manage users", c: false, ve: false, ag: false, g: false, h: false, a: true },
                  { feature: "Approve verif.", c: false, ve: false, ag: false, g: false, h: false, a: true },
                ].map((r) => (
                  <tr key={r.feature} className="border-b border-soft-200">
                    <td className="py-2.5 pr-4 text-charcoal/70">{r.feature}</td>
                    {[r.c, r.ve, r.ag, r.g, r.h, r.a].map((v, i) => (
                      <td key={i} className="py-2.5 pr-4">
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${v ? "bg-emerald-100 text-emerald-700" : "bg-soft text-charcoal/30"}`}>
                          {v ? "✓" : "—"}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    ),

    verification: <VerificationQueueTab />,

    visarequests: <VisaRequestsTab />,

    agencies: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total agencies" value="38" icon="agent" color="blue" />
          <StatCard label="Verified" value="29" icon="check" color="green" />
          <StatCard label="Pending" value="9" icon="shield" color="gold" />
        </div>

        <Panel title="All Agencies" noPad>
          <div className="divide-y divide-soft-200">
            {agencies.map((a) => (
              <div key={a.name} className="flex items-center justify-between p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-navy">{a.name}</p>
                    {a.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-2 py-0.5 text-xs font-semibold text-blue">
                        <Icon name="check" className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-charcoal/55">
                    {a.country} · {a.packages} packages · {a.tours} tours · {a.bookings} bookings
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-navy">{a.revenue}</span>
                  <button className="btn-outline px-3 py-1.5 text-xs">View</button>
                  <span className={`chip text-xs ${a.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gold/15 text-navy"}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),

    visaexperts: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total experts" value={String(liveExperts.length)} icon="visa" color="blue" />
          <StatCard label="Verified" value={String(liveExperts.filter((e) => e.is_verified).length)} icon="check" color="green" />
          <StatCard label="Active" value={String(liveExperts.filter((e) => e.is_active).length)} icon="shield" color="gold" />
        </div>

        <Panel title="All Visa Experts" noPad>
          {liveExperts.length === 0 ? (
            <p className="p-8 text-center text-sm text-charcoal/50">No visa experts registered yet.</p>
          ) : (
            <div className="divide-y divide-soft-200">
              {liveExperts.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-bold text-navy font-mono text-sm">{e.id.slice(0, 8)}…</p>
                    <p className="text-sm text-charcoal/55">Expert profile in Supabase</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`chip text-xs ${e.is_verified ? "bg-emerald-50 text-emerald-700" : "bg-gold/15 text-navy"}`}>
                      {e.is_verified ? "Verified" : "Unverified"}
                    </span>
                    <span className={`chip text-xs ${e.is_active ? "bg-blue/10 text-blue" : "bg-soft text-charcoal/50"}`}>
                      {e.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    ),

    guides: <GuidesTab />,

    tours: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Provider services" value={String(liveServices.length)} icon="ticket" color="blue" />
          <StatCard label="Active" value={String(liveServices.filter((s) => s.is_active).length)} icon="globe" color="gold" />
          <StatCard label="Tours & tickets" value={String(liveServices.filter((s) => (s.category ?? "").match(/tour|ticket/i)).length)} icon="users" color="green" />
          <StatCard label="From Supabase" value="Live" icon="star" color="navy" />
        </div>

        <Panel title="Provider services — tours & tickets" noPad>
          {liveServices.length === 0 ? (
            <p className="p-8 text-center text-sm text-charcoal/50">No provider services listed yet. Guides and agencies add services from their dashboards.</p>
          ) : (
            <div className="divide-y divide-soft-200">
              {liveServices.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-bold text-navy">{t.title}</p>
                    <p className="text-sm text-charcoal/55">{t.category ?? "Service"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-navy">${t.price}</span>
                    <span className={`chip text-xs ${t.is_active ? "bg-emerald-50 text-emerald-700" : "bg-soft text-charcoal/50"}`}>
                      {t.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    ),

    properties: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Property listings" value={String(liveCounts?.propertyListings ?? 0)} icon="property" color="blue" />
          <StatCard label="Lead requests" value={String(liveCounts?.leadRequests ?? 0)} icon="globe" color="gold" />
          <StatCard label="From Supabase" value="Live" icon="star" color="green" />
          <StatCard label="Host dashboard" value="→" icon="planner" color="navy" />
        </div>

        <Panel title="Property listings" noPad>
          <p className="p-8 text-center text-sm text-charcoal/50">
            {(liveCounts?.propertyListings ?? 0) === 0
              ? "No property listings in Supabase yet. Hosts add listings from the host dashboard."
              : `${liveCounts?.propertyListings} listing(s) in property_listings table — manage from host dashboard and admin tools.`}
          </p>
        </Panel>
      </div>
    ),

    bookings: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total requests" value={String(liveBookings.length)} icon="doc" color="blue" />
          <StatCard label="Pending" value={String(liveBookings.filter((b) => b.status === "pending").length)} icon="shield" color="gold" />
          <StatCard label="Confirmed" value={String(liveBookings.filter((b) => b.status === "confirmed").length)} icon="check" color="green" />
          <StatCard label="Other" value={String(liveBookings.filter((b) => !["pending", "confirmed"].includes(b.status)).length)} icon="globe" color="navy" />
        </div>

        <Panel title="All booking requests" noPad>
          {liveBookings.length === 0 ? (
            <p className="p-8 text-center text-sm text-charcoal/50">No booking requests yet. Customer requests appear here from Supabase.</p>
          ) : (
            <div className="divide-y divide-soft-200">
              {liveBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-charcoal/40">{b.id.slice(0, 8)}</span>
                    <div>
                      <p className="text-sm font-semibold text-navy">{b.service_name ?? b.service_type}</p>
                      <p className="text-xs text-charcoal/50">{b.full_name} · {b.email} · {formatJoinedDate(b.created_at)}</p>
                    </div>
                  </div>
                  <select
                    value={b.status}
                    onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                    className="input select !py-1.5 !text-xs !min-w-[7rem]"
                  >
                    {["pending", "confirmed", "cancelled", "completed"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    ),

    payments: (
      <div className="space-y-5">
        <DatabaseStatusBanner health={dashUser.databaseHealth} />
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard
            label="Total payments"
            value={String(livePayments.length)}
            icon="star"
            hint={liveCounts ? `${liveCounts.payments} in DB` : "Payment records"}
            color="blue"
          />
          <StatCard
            label="Paid"
            value={String(livePayments.filter((p) => p.status === "paid").length)}
            icon="check"
            color="green"
          />
          <StatCard
            label="Pending"
            value={String(livePayments.filter((p) => p.status === "pending").length)}
            icon="doc"
            color="gold"
          />
          <StatCard
            label="Total volume"
            value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
              livePayments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0)
            )}
            icon="shield"
            color="navy"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted">Secure checkout powered by Stripe.</p>
          <Link href="/dashboard/admin/payments" className="text-sm font-semibold text-blue hover:underline">
            Full payments page →
          </Link>
        </div>

        {liveConnectStats && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Connected providers"
                value={String(liveConnectStats.connectedProviders)}
                icon="agent"
                hint="Stripe Connect accounts"
                color="blue"
              />
              <StatCard
                label="Payout-ready"
                value={String(liveConnectStats.payoutReadyProviders)}
                icon="check"
                hint="Charges & payouts enabled"
                color="green"
              />
              <StatCard
                label="Pending setup"
                value={String(liveConnectStats.pendingSetupProviders)}
                icon="doc"
                hint="Onboarding incomplete"
                color="gold"
              />
              <StatCard
                label="Platform fees"
                value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                  liveConnectStats.totalPlatformFees
                )}
                icon="star"
                hint="Collected on paid bookings"
                color="navy"
              />
            </div>

            <Panel title="Stripe Connect" subtitle="Provider payout accounts and payment split status" noPad>
              <div className="px-5 py-3 border-b border-soft-200 text-xs text-muted flex flex-wrap gap-4">
                <span>
                  Split transfers: <strong className="text-navy">{liveConnectStats.paymentsWithSplit}</strong>
                </span>
                <span>
                  Pending provider setup: <strong className="text-navy">{liveConnectStats.paymentsPendingSetup}</strong>
                </span>
              </div>
              {liveConnectProviders.length === 0 ? (
                <p className="p-8 text-center text-sm text-charcoal/50">
                  No provider Connect accounts yet.
                </p>
              ) : (
                <div className="divide-y divide-soft-200">
                  {liveConnectProviders.map((p) => (
                    <div key={p.user_id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
                      <div>
                        <p className="font-semibold text-navy capitalize">
                          {(p.provider_role ?? "provider").replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted truncate max-w-xs">
                          {p.stripe_account_id ?? "No Stripe account"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`chip text-xs ${
                            p.charges_enabled && p.payouts_enabled
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gold/15 text-navy"
                          }`}
                        >
                          {p.charges_enabled && p.payouts_enabled
                            ? "Payout ready"
                            : p.onboarding_status.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-muted">
                          {p.charges_enabled ? "Charges on" : "Charges off"} ·{" "}
                          {p.payouts_enabled ? "Payouts on" : "Payouts off"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </>
        )}

        <Panel title="Stripe payments" subtitle="Payment records from Supabase" noPad>
          {livePayments.length === 0 ? (
            <p className="p-8 text-center text-sm text-charcoal/50">
              No payments recorded yet. Completed Stripe checkouts appear here.
            </p>
          ) : (
            <div className="divide-y divide-soft-200">
              {livePayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="font-bold text-navy truncate">
                      {paymentServiceLabel(p.service_type, p.description)}
                    </p>
                    <p className="text-sm text-charcoal/55 truncate">
                      {p.customer_name ?? p.email ?? p.customer_email ?? "Guest"} ·{" "}
                      {formatPaymentDate(p.paid_at ?? p.created_at)}
                    </p>
                    {(p.stripe_session_id || p.stripe_payment_intent_id) && (
                      <p className="text-xs text-charcoal/40 truncate">
                        {p.stripe_payment_intent_id
                          ? `Payment: ${p.stripe_payment_intent_id}`
                          : `Session: ${p.stripe_session_id}`}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-navy">
                      {formatPaymentAmount(Number(p.amount), p.currency ?? "USD")}
                    </p>
                    <span className={`chip text-xs ${p.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-gold/15 text-navy"}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Visa cases" subtitle="Created after paid visa services" noPad>
          {liveVisaCases.length === 0 ? (
            <p className="p-8 text-center text-sm text-charcoal/50">No visa cases yet.</p>
          ) : (
            <div className="divide-y divide-soft-200">
              {liveVisaCases.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-bold text-navy">{c.service_name}</p>
                    <p className="text-sm text-charcoal/55 font-mono">{c.case_number}</p>
                    <p className="text-xs text-charcoal/40">
                      {formatPaymentDate(c.created_at)} · {c.progress_percent}%
                      {c.documents_total != null
                        ? ` · ${c.documents_uploaded ?? 0} uploaded · ${c.documents_prepared ?? 0} prepared · ${c.documents_reviewed ?? 0} reviewed`
                        : ""}
                    </p>
                  </div>
                  <span className="chip text-xs bg-gold/15 text-navy capitalize">{c.status.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Stripe bookings" subtitle="Linked to payments" noPad>
          {liveStripeBookings.length === 0 ? (
            <p className="p-8 text-center text-sm text-charcoal/50">No Stripe bookings yet.</p>
          ) : (
            <div className="divide-y divide-soft-200">
              {liveStripeBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-bold text-navy">{b.listing_title ?? b.booking_type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-charcoal/40">{formatPaymentDate(b.created_at)}</p>
                  </div>
                  <span className="chip text-xs bg-emerald-50 text-emerald-700 capitalize">{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Email logs" subtitle="Payment confirmations and system emails" noPad>
          {liveEmailLogs.length === 0 ? (
            <p className="p-8 text-center text-sm text-charcoal/50">No email logs yet. Events are logged when RESEND_API_KEY is not set.</p>
          ) : (
            <div className="divide-y divide-soft-200">
              {liveEmailLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="font-bold text-navy truncate">{log.subject}</p>
                    <p className="text-sm text-charcoal/55 truncate">{log.email} · {log.type}</p>
                  </div>
                  <span className="chip text-xs bg-soft text-navy capitalize shrink-0">{log.status}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    ),

    referrals: <AdminCommissionsTab />,

    reviews: <ReviewsManagementTab />,

    support: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Open" value={String(liveSupport.filter((t) => t.status === "open").length)} icon="shield" color="gold" />
          <StatCard label="In progress" value={String(liveSupport.filter((t) => t.status === "in_progress").length)} icon="users" color="blue" />
          <StatCard label="Resolved" value={String(liveSupport.filter((t) => t.status === "resolved").length)} icon="check" color="green" />
          <StatCard label="Total" value={String(liveSupport.length)} icon="globe" color="navy" />
        </div>

        <Panel title="Support Tickets" noPad>
          {liveSupport.length === 0 ? (
            <p className="p-8 text-center text-sm text-charcoal/50">No support tickets yet. Customer messages appear here from Supabase.</p>
          ) : (
            <div className="divide-y divide-soft-200">
              {liveSupport.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-5 flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-navy">{t.subject}</p>
                    <p className="text-sm text-charcoal/55">{t.id.slice(0, 8)} · {formatJoinedDate(t.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`chip text-xs ${t.status === "resolved" ? "bg-emerald-50 text-emerald-700" : t.status === "in_progress" ? "bg-blue/10 text-blue" : "bg-gold/15 text-navy"}`}>
                      {t.status}
                    </span>
                    {t.status !== "resolved" && (
                      <button onClick={() => updateTicketStatus(t.id, t.status === "open" ? "in_progress" : "resolved")} className={`text-xs font-semibold hover:underline ${t.status === "open" ? "text-blue" : "text-emerald-600"}`}>
                        {t.status === "open" ? "Start →" : "✓ Resolve"}
                      </button>
                    )}
                    {t.status === "resolved" && (
                      <button onClick={() => updateTicketStatus(t.id, "open")} className="text-xs text-charcoal/40 font-semibold hover:underline">Reopen</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    ),

    seo: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Published pages" value="24" icon="globe" color="blue" />
          <StatCard label="Total views (mo.)" value="42,800" icon="users" delta="+31%" color="green" />
          <StatCard label="Avg search rank" value="8.4" icon="star" color="gold" />
        </div>

        <Panel title="SEO Pages" subtitle="Manage content and search rankings">
          <div className="mb-4 flex gap-3">
            <input className="input flex-1 text-sm" placeholder="Search pages..." />
            <button className="btn-primary px-4 py-2.5 text-sm">+ New page</button>
          </div>
          <div className="divide-y divide-soft-200">
            {seoPages.map((p) => (
              <div key={p.slug} className="flex items-center justify-between py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy truncate">{p.title}</p>
                  <p className="text-xs text-charcoal/50 font-mono">{p.slug} · Edited {p.lastEdited}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right text-sm">
                    <p className="font-bold text-navy">{p.views.toLocaleString()} views</p>
                    <p className="text-xs text-charcoal/50">Rank: #{p.rank}</p>
                  </div>
                  <span className={`chip text-xs ${p.status === "Published" ? "bg-emerald-50 text-emerald-700" : "bg-gold/15 text-navy"}`}>
                    {p.status}
                  </span>
                  <button className="text-xs text-blue font-semibold hover:underline">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),

    settings: (
      <div className="space-y-5">
        <Panel title="Platform Settings">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Platform name</label>
                <input className="input" defaultValue="Globe Travel Voyage" />
              </div>
              <div>
                <label className="label">Support email</label>
                <input className="input" defaultValue={SITE_CONFIG.supportEmail} />
              </div>
              <div>
                <label className="label">Platform fee (%)</label>
                <input className="input" type="number" defaultValue="5" />
              </div>
              <div>
                <label className="label">Default currency</label>
                <select className="input">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>AED (د.إ)</option>
                </select>
              </div>
            </div>
            <button className="btn-primary px-5 py-2.5 text-sm">Save settings</button>
          </div>
        </Panel>

        <Panel title="Feature Toggles">
          <div className="space-y-3">
            {featureToggles.map((f) => (
              <div key={f.label} className="flex items-center justify-between rounded-xl border border-soft-200 p-4 transition-colors hover:bg-soft/50">
                <div>
                  <span className="text-sm font-medium text-navy">{f.label}</span>
                  {f.label === "Maintenance mode" && f.enabled && (
                    <p className="text-xs text-red-500 mt-0.5">⚠ Site is in maintenance mode — visitors will see maintenance page</p>
                  )}
                </div>
                <button
                  onClick={() => toggleFeature(f.label)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${f.enabled ? "bg-blue" : "bg-soft-200"}`}
                  aria-label={`Toggle ${f.label}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${f.enabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),
  };

  return (
    <>
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-premium)] animate-fade-up">
          ✓ {adminToast}
        </div>
      )}
      <DashboardLayout
        role={dashUser.roleLabel}
        name={dashUser.displayName}
        initials={dashUser.initials}
        email={dashUser.email}
        profileCompletion={dashUser.completion}
        tabs={tabs}
        sections={sections}
        verified
        roleColor="bg-red-50 text-red-700"
        avatarColor="bg-red-700 text-white"
      />
    </>
  );
}
