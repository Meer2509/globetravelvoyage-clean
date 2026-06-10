"use client";

import { useState } from "react";
import Link from "next/link";
import { Stars } from "@/components/Stars";
import { Icon } from "@/components/Icon";
import {
  DashboardLayout,
  StatCard,
  Panel,
  TableRow,
  ProgressBar,
  type DashboardTab,
} from "@/components/DashboardLayout";

const tabs: DashboardTab[] = [
  { key: "overview", label: "Overview", icon: "globe" },
  { key: "users", label: "Users & Roles", icon: "users", badge: 1240 },
  { key: "verification", label: "Verification Queue", icon: "shield", badge: 7 },
  { key: "agencies", label: "Agencies", icon: "agent", badge: 38 },
  { key: "visaexperts", label: "Visa Experts", icon: "visa", badge: 94 },
  { key: "tours", label: "Tours & Tickets", icon: "ticket" },
  { key: "properties", label: "Properties", icon: "property" },
  { key: "bookings", label: "Bookings", icon: "doc" },
  { key: "payments", label: "Payments", icon: "star" },
  { key: "referrals", label: "Referrals", icon: "users" },
  { key: "reviews", label: "Reviews", icon: "star", badge: 3 },
  { key: "support", label: "Support Tickets", icon: "shield", badge: 12 },
  { key: "seo", label: "SEO Pages", icon: "globe" },
  { key: "settings", label: "Settings", icon: "agent" },
];

// ─── Mock data ─────────────────────────────────────────────────────────────────

const recentUsers = [
  { name: "Ahmed K.", role: "Customer", country: "🇵🇰 Pakistan", joined: "Jun 10", status: "Active" },
  { name: "Sana M.", role: "Visa Expert", country: "🇦🇪 UAE", joined: "Jun 9", status: "Active" },
  { name: "Voyage Pro", role: "Agency", country: "🇦🇪 UAE", joined: "Jun 8", status: "Active" },
  { name: "Khalid R.", role: "Tour Guide", country: "🇦🇪 UAE", joined: "Jun 7", status: "Active" },
  { name: "Omar F.", role: "Host", country: "🇦🇪 UAE", joined: "Jun 6", status: "Suspended" },
];

const allUsers = [
  ...recentUsers,
  { name: "Maria L.", role: "Customer", country: "🇵🇭 Philippines", joined: "Jun 5", status: "Active" },
  { name: "Tariq M.", role: "Customer", country: "🇵🇰 Pakistan", joined: "Jun 4", status: "Active" },
  { name: "Sara J.", role: "Visa Expert", country: "🇮🇳 India", joined: "Jun 3", status: "Pending" },
];

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

const visaExperts = [
  { name: "Sana Malik", country: "🇦🇪 UAE", specialties: "USA, UK, Schengen", clients: 5, rating: 4.9, reviews: 312, status: "Active" },
  { name: "Hassan Al-Qadi", country: "🇸🇦 KSA", specialties: "Canada, Australia", clients: 3, rating: 4.8, reviews: 148, status: "Active" },
  { name: "Priya Sharma", country: "🇮🇳 India", specialties: "UK, Schengen", clients: 7, rating: 4.7, reviews: 92, status: "Active" },
  { name: "Rania Hassan", country: "🇪🇬 Egypt", specialties: "USA, Canada", clients: 0, rating: 0, reviews: 0, status: "Pending" },
];

const adminBookings = [
  { id: "#10421", type: "Package", item: "Dubai Family Escape", customer: "B. Ahmed", agency: "Voyage Pro", amount: "$3,560", status: "Confirmed", date: "Jun 14" },
  { id: "#10420", type: "Package", item: "Umrah Premium", customer: "I. Khan", agency: "Orient Express", amount: "$3,300", status: "Confirmed", date: "Jun 13" },
  { id: "#10419", type: "Tour", item: "Desert Safari x4", customer: "M. Saeed", agency: "Voyage Pro", amount: "$220", status: "Pending", date: "Jun 13" },
  { id: "#10418", type: "Ticket", item: "Burj Khalifa x2", customer: "R. Iqbal", agency: "Voyage Pro", amount: "$84", status: "Confirmed", date: "Jun 12" },
  { id: "#10417", type: "Package", item: "Turkey Discovery", customer: "F. Khan", agency: "Orient Express", amount: "$2,300", status: "Pending", date: "Jun 12" },
];

const payments = [
  { id: "PAY-5510", booking: "#10421", payee: "Voyage Pro Travels", amount: "$3,560", fee: "$178", net: "$3,382", method: "Card", date: "Jun 14", status: "Settled" },
  { id: "PAY-5509", booking: "#10420", payee: "Orient Express", amount: "$3,300", fee: "$165", net: "$3,135", method: "Card", date: "Jun 13", status: "Settled" },
  { id: "PAY-5508", booking: "#10419", payee: "Voyage Pro Travels", amount: "$220", fee: "$11", net: "$209", method: "Card", date: "Jun 13", status: "Pending" },
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

const supportTickets = [
  { id: "ST-101", user: "Ahmed K.", subject: "Visa appointment reschedule", priority: "High", status: "Open", assigned: "Support 1", date: "Jun 10" },
  { id: "ST-100", user: "Maria L.", subject: "Refund request — cancelled tour", priority: "High", status: "In Progress", assigned: "Support 2", date: "Jun 9" },
  { id: "ST-099", user: "Tariq M.", subject: "Referral payout not received", priority: "Medium", status: "Open", assigned: "—", date: "Jun 9" },
  { id: "ST-098", user: "Sara J.", subject: "Account verification delay", priority: "Medium", status: "In Progress", assigned: "Support 1", date: "Jun 8" },
  { id: "ST-097", user: "Omar F.", subject: "Listing removal appeal", priority: "Low", status: "Resolved", assigned: "Support 3", date: "Jun 7" },
];

const seoPages = [
  { slug: "/visa/usa-from-pakistan", title: "USA Visa from Pakistan Guide", views: 12400, rank: "3", lastEdited: "Jun 5", status: "Published" },
  { slug: "/visa/usa", title: "USA Visa Information", views: 8900, rank: "8", lastEdited: "Jun 3", status: "Published" },
  { slug: "/visa/schengen", title: "Schengen Visa Guide", views: 5200, rank: "12", lastEdited: "May 28", status: "Published" },
  { slug: "/flights", title: "Cheap Flights — Comparison", views: 3100, rank: "—", lastEdited: "Jun 1", status: "Published" },
  { slug: "/guides/best-time-to-visit-dubai", title: "Best Time to Visit Dubai", views: 2800, rank: "5", lastEdited: "May 20", status: "Draft" },
];

// ─── Analytics Bar ─────────────────────────────────────────────────────────────

function MiniBar({ label, value, max, color = "bg-blue" }: { label: string; value: number; max: number; color?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 shrink-0 text-xs text-charcoal/60">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-soft-200">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="w-12 text-right text-xs font-bold text-navy">{value.toLocaleString()}</span>
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
          <span>Updates are mock — no real payments processed</span>
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

export default function AdminDashboard() {
  const [userSearch, setUserSearch] = useState("");

  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        {/* Platform stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value="1,240" icon="users" hint="↑ 82 this week" delta="+7%" color="blue" />
          <StatCard label="Bookings (month)" value="284" icon="doc" hint="↑ 43 vs last month" delta="+18%" color="gold" />
          <StatCard label="Platform revenue" value="$48.2k" icon="star" delta="+22%" color="green" />
          <StatCard label="Pending verifications" value="7" icon="shield" hint="Need review" color="navy" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="User Distribution">
            <div className="space-y-3">
              <MiniBar label="Customers" value={1080} max={1240} color="bg-blue" />
              <MiniBar label="Visa Experts" value={94} max={1240} color="bg-gold" />
              <MiniBar label="Agencies" value={38} max={1240} color="bg-emerald-500" />
              <MiniBar label="Tour Guides" value={21} max={1240} color="bg-purple-500" />
              <MiniBar label="Hosts" value={7} max={1240} color="bg-amber-500" />
            </div>
          </Panel>

          <Panel title="Booking Breakdown">
            <div className="space-y-3">
              <MiniBar label="Packages" value={148} max={284} color="bg-blue" />
              <MiniBar label="Tours" value={82} max={284} color="bg-gold" />
              <MiniBar label="Tickets" value={34} max={284} color="bg-emerald-500" />
              <MiniBar label="Properties" value={20} max={284} color="bg-purple-500" />
            </div>
          </Panel>

          <Panel title="Support Overview">
            <div className="space-y-2">
              {[
                { label: "Open tickets", value: 8, color: "bg-red-400" },
                { label: "In progress", value: 3, color: "bg-gold" },
                { label: "Resolved today", value: 5, color: "bg-emerald-500" },
                { label: "Avg response time", value: "2.4h", isText: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl bg-soft p-3 text-sm">
                  <div className="flex items-center gap-2">
                    {!s.isText && <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />}
                    <span className="text-charcoal/65">{s.label}</span>
                  </div>
                  <span className="font-bold text-navy">{s.value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Recent Bookings">
          {adminBookings.slice(0, 4).map((b) => (
            <TableRow
              key={b.id}
              cells={[b.id, b.item, b.customer]}
              badge={b.status}
              badgeColor={b.status === "Confirmed" ? "green" : "gold"}
              action={<span className="font-bold text-navy text-sm">{b.amount}</span>}
            />
          ))}
        </Panel>

        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total agencies", value: "38", color: "green" as const },
            { label: "Visa experts", value: "94", color: "gold" as const },
            { label: "Active listings", value: "312", color: "blue" as const },
            { label: "Reviews written", value: "2,180", color: "navy" as const },
          ].map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} icon="globe" color={s.color} />
          ))}
        </div>
      </div>
    ),

    users: (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total users" value="1,240" icon="users" color="blue" />
          <StatCard label="New (7 days)" value="82" icon="globe" delta="+7%" color="green" />
          <StatCard label="Suspended" value="3" icon="shield" color="gold" />
          <StatCard label="Pending verify" value="7" icon="check" color="navy" />
        </div>

        <Panel title="User Management" subtitle="Search, filter, and manage all platform users">
          <div className="mb-4 flex gap-3">
            <input
              className="input flex-1 text-sm"
              placeholder="Search by name, email, or role..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            <select className="input w-36 text-sm">
              <option>All roles</option>
              <option>Customer</option>
              <option>Visa Expert</option>
              <option>Agency</option>
              <option>Tour Guide</option>
              <option>Host</option>
            </select>
          </div>
          <div className="divide-y divide-soft-200">
            {allUsers
              .filter((u) => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()))
              .map((u) => (
                <div key={u.name} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                      {u.name[0]}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy">{u.name}</p>
                      <p className="text-xs text-charcoal/50">{u.country} · Joined {u.joined}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="chip text-xs">{u.role}</span>
                    <span className={`chip text-xs ${u.status === "Active" ? "bg-emerald-50 text-emerald-700" : u.status === "Pending" ? "bg-gold/15 text-navy" : "bg-red-50 text-red-600"}`}>
                      {u.status}
                    </span>
                    <button className="text-xs text-blue font-semibold hover:underline">View</button>
                    {u.status === "Suspended" && <button className="text-xs text-emerald-600 font-semibold hover:underline">Restore</button>}
                    {u.status === "Active" && <button className="text-xs text-red-500 font-semibold hover:underline">Suspend</button>}
                  </div>
                </div>
              ))}
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

    verification: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Awaiting review" value="7" icon="shield" color="gold" />
          <StatCard label="Approved (month)" value="24" icon="check" color="green" />
          <StatCard label="Rejected (month)" value="3" icon="globe" color="navy" />
        </div>

        <Panel title="Verification Queue" subtitle="Review and approve business verifications" noPad>
          <div className="divide-y divide-soft-200">
            {verificationQueue.map((v) => (
              <div key={v.name} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-bold text-navy">{v.name}</p>
                  <p className="text-sm text-charcoal/55">{v.country} · {v.type} · {v.docs} docs uploaded · Submitted {v.submitted}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary px-3 py-1.5 text-xs text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100">Approve</button>
                  <button className="btn-outline px-3 py-1.5 text-xs">Review docs</button>
                  <button className="btn-outline px-3 py-1.5 text-xs text-red-500 border-red-200">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),

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
          <StatCard label="Total experts" value="94" icon="visa" color="blue" />
          <StatCard label="Verified" value="82" icon="check" color="green" />
          <StatCard label="Pending review" value="4" icon="shield" color="gold" />
        </div>

        <Panel title="All Visa Experts" noPad>
          <div className="divide-y divide-soft-200">
            {visaExperts.map((e) => (
              <div key={e.name} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-bold text-navy">{e.name}</p>
                  <p className="text-sm text-charcoal/55">
                    {e.country} · {e.specialties} · {e.clients} active clients
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {e.reviews > 0 ? (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-gold">★</span>
                      <span className="font-bold text-navy">{e.rating}</span>
                      <span className="text-charcoal/40">({e.reviews})</span>
                    </div>
                  ) : null}
                  <span className={`chip text-xs ${
                    e.status === "Active" ? "bg-emerald-50 text-emerald-700" :
                    e.status === "Pending" ? "bg-gold/15 text-navy" : "bg-soft text-charcoal/50"
                  }`}>{e.status}</span>
                  <button className="text-xs text-blue font-semibold hover:underline">View</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),

    tours: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Active tours" value="142" icon="ticket" color="blue" />
          <StatCard label="Active tickets" value="88" icon="globe" color="gold" />
          <StatCard label="Sold (month)" value="620" icon="users" color="green" />
          <StatCard label="Revenue (tours)" value="$18.4k" icon="star" color="navy" />
        </div>

        <Panel title="Tours & Tickets — Quick View" noPad>
          <div className="divide-y divide-soft-200">
            {[
              { name: "Old Dubai Heritage Walk", type: "Tour", agency: "Khalid R. (Guide)", price: "$45", sold: 88, status: "Active" },
              { name: "Desert Safari — Evening BBQ", type: "Tour", agency: "Voyage Pro Travels", price: "$55", sold: 175, status: "Active" },
              { name: "Burj Khalifa Skip-the-Line", type: "Ticket", agency: "Voyage Pro Travels", price: "$42", sold: 210, status: "Active" },
              { name: "Bosphorus Sunset Cruise", type: "Tour", agency: "Orient Express", price: "$38", sold: 64, status: "Active" },
              { name: "Cappadocia Hot Air Balloon", type: "Experience", agency: "Orient Express", price: "$185", sold: 29, status: "Active" },
            ].map((t) => (
              <div key={t.name} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-bold text-navy">{t.name}</p>
                  <p className="text-sm text-charcoal/55">{t.agency} · {t.type} · {t.sold} sold</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-navy">{t.price}</span>
                  <span className="chip text-xs bg-emerald-50 text-emerald-700">{t.status}</span>
                  <button className="text-xs text-blue font-semibold hover:underline">Edit</button>
                  <button className="text-xs text-red-500 font-semibold hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),

    properties: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total listings" value="47" icon="property" color="blue" />
          <StatCard label="For rent" value="31" icon="globe" color="gold" />
          <StatCard label="For sale" value="9" icon="star" color="green" />
          <StatCard label="Travel stays" value="7" icon="planner" color="navy" />
        </div>

        <Panel title="Property Listings — Quick View" noPad>
          <div className="divide-y divide-soft-200">
            {[
              { name: "Marina 2BR Apartment", host: "Omar F.", city: "Dubai Marina", type: "For Rent", price: "$2,400/mo", status: "Active" },
              { name: "Furnished Studio", host: "Omar F.", city: "JLT, Dubai", type: "Travel Stay", price: "$650/mo", status: "Active" },
              { name: "3BR Villa — Jumeirah", host: "Omar F.", city: "Jumeirah, Dubai", type: "For Sale", price: "$1.2M", status: "Draft" },
              { name: "Penthouse — Downtown", host: "Khalid R.", city: "Downtown Dubai", type: "For Rent", price: "$5,500/mo", status: "Active" },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-bold text-navy">{p.name}</p>
                  <p className="text-sm text-charcoal/55">{p.host} · {p.city} · {p.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-navy">{p.price}</span>
                  <span className={`chip text-xs ${p.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-soft text-charcoal/50"}`}>{p.status}</span>
                  <button className="text-xs text-red-500 font-semibold hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),

    bookings: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total (month)" value="284" icon="doc" delta="+18%" color="blue" />
          <StatCard label="Confirmed" value="241" icon="check" color="green" />
          <StatCard label="Pending" value="31" icon="shield" color="gold" />
          <StatCard label="Cancelled" value="12" icon="globe" color="navy" />
        </div>

        <Panel title="All Bookings" noPad>
          <div className="divide-y divide-soft-200">
            {adminBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-charcoal/40">{b.id}</span>
                  <div>
                    <p className="text-sm font-semibold text-navy">{b.item}</p>
                    <p className="text-xs text-charcoal/50">{b.customer} · {b.agency} · {b.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="chip text-xs">{b.type}</span>
                  <span className={`chip text-xs ${b.status === "Confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-gold/15 text-navy"}`}>{b.status}</span>
                  <span className="font-bold text-navy">{b.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),

    payments: (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total processed" value="$48.2k" icon="star" delta="+22%" color="blue" />
          <StatCard label="Platform fees" value="$2,410" icon="users" hint="5% avg fee" color="gold" />
          <StatCard label="Payouts pending" value="$8,400" icon="doc" color="green" />
          <StatCard label="Disputes open" value="2" icon="shield" color="navy" />
        </div>

        <Panel title="Recent Transactions" noPad>
          <div className="divide-y divide-soft-200">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-bold text-navy">{p.id}</p>
                  <p className="text-sm text-charcoal/55">{p.payee} · Booking {p.booking} · {p.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs text-charcoal/50">
                    <p>Gross: {p.amount}</p>
                    <p>Fee: {p.fee}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy">{p.net}</p>
                    <span className={`chip text-xs ${p.status === "Settled" ? "bg-emerald-50 text-emerald-700" : "bg-gold/15 text-navy"}`}>{p.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),

    referrals: <AdminCommissionsTab />,

    reviews: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total reviews" value="2,180" icon="star" color="blue" />
          <StatCard label="Avg platform rating" value="4.7 ★" icon="star" color="gold" />
          <StatCard label="Flagged / pending" value="3" icon="shield" color="navy" />
        </div>

        <Panel title="Flagged Reviews — Requires Action" noPad>
          <div className="divide-y divide-soft-200">
            {flaggedReviews.map((r) => (
              <div key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-navy">{r.reviewer}</p>
                      <span className="chip bg-red-50 text-red-500 text-xs">{r.flag}</span>
                    </div>
                    <p className="text-xs text-charcoal/50">Target: {r.target} · {r.date}</p>
                    <p className="mt-2 text-sm text-charcoal/70">"{r.text}"</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {"★".repeat(r.rating).split("").map((_, i) => (
                      <span key={i} className="text-gold text-sm">★</span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="btn-outline px-3 py-1.5 text-xs text-emerald-600 border-emerald-200">Approve</button>
                  <button className="btn-outline px-3 py-1.5 text-xs text-red-500 border-red-200">Remove</button>
                  <button className="btn-outline px-3 py-1.5 text-xs">Contact reviewer</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),

    support: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Open tickets" value="8" icon="shield" color="gold" />
          <StatCard label="In progress" value="3" icon="users" color="blue" />
          <StatCard label="Resolved today" value="5" icon="check" color="green" />
          <StatCard label="Avg response" value="2.4h" icon="globe" color="navy" />
        </div>

        <Panel title="Support Tickets" noPad>
          <div className="divide-y divide-soft-200">
            {supportTickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-bold text-navy">{t.subject}</p>
                  <p className="text-sm text-charcoal/55">{t.id} · {t.user} · Assigned: {t.assigned} · {t.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`chip text-xs ${t.priority === "High" ? "bg-red-50 text-red-600" : t.priority === "Medium" ? "bg-gold/15 text-navy" : "bg-soft text-charcoal/50"}`}>
                    {t.priority}
                  </span>
                  <span className={`chip text-xs ${t.status === "Resolved" ? "bg-emerald-50 text-emerald-700" : t.status === "In Progress" ? "bg-blue/10 text-blue" : "bg-gold/15 text-navy"}`}>
                    {t.status}
                  </span>
                  <button className="text-xs text-blue font-semibold hover:underline">Open</button>
                </div>
              </div>
            ))}
          </div>
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
                <input className="input" defaultValue="support@globetravelvoyage.com" />
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
            {[
              { label: "AI Visa Assistant", enabled: true },
              { label: "AI Trip Planner", enabled: true },
              { label: "Referral Program", enabled: true },
              { label: "Property Listings (Buy/Sell)", enabled: true },
              { label: "New user registrations", enabled: true },
              { label: "Maintenance mode", enabled: false },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between rounded-xl border border-soft-200 p-4">
                <span className="text-sm font-medium text-navy">{f.label}</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${f.enabled ? "bg-blue" : "bg-soft-200"}`}>
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
    <DashboardLayout
      role="Admin"
      name="Platform Admin"
      initials="PA"
      tabs={tabs}
      sections={sections}
      verified
      roleColor="bg-red-50 text-red-700"
      avatarColor="bg-red-700 text-white"
    />
  );
}
