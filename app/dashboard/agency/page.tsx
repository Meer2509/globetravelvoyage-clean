"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/auth";
import { fetchAgencyBookings, fetchAgencyLeads } from "@/lib/supabase/queries";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { DashboardProfileSection } from "@/components/DashboardProfileSection";
import { DatabaseStatusBanner } from "@/components/DatabaseStatusBanner";
import { Disclaimer } from "@/components/Disclaimer";
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
  { key: "packages", label: "Packages", icon: "planner", badge: 3 },
  { key: "tours", label: "Tours & Tickets", icon: "ticket", badge: 7 },
  { key: "bookings", label: "Bookings", icon: "doc", badge: 9 },
  { key: "leads", label: "Leads", icon: "users", badge: 6 },
  { key: "revenue", label: "Revenue", icon: "star" },
  { key: "verification", label: "Verification", icon: "shield" },
];

// ─── Mock data ─────────────────────────────────────────────────────────────────

const packages = [
  { name: "Dubai Family Escape", nights: 5, price: "$890", pax: "Family", active: true, bookings: 14 },
  { name: "Umrah Premium Package", nights: 10, price: "$1,650", pax: "Group", active: true, bookings: 8 },
  { name: "Turkey Discovery", nights: 7, price: "$1,150", pax: "Couple", active: true, bookings: 5 },
  { name: "Maldives Honeymoon", nights: 6, price: "$2,400", pax: "Couple", active: false, bookings: 0 },
];

const tours = [
  { name: "Burj Khalifa Skip-the-Line Tickets", type: "Ticket", city: "Dubai", price: "$42", sold: 210 },
  { name: "Old Dubai Walking Tour", type: "Tour", city: "Dubai", price: "$45", sold: 88 },
  { name: "Desert Safari — Evening with BBQ", type: "Tour", city: "Dubai", price: "$55", sold: 175 },
  { name: "Museum of the Future Entry", type: "Ticket", city: "Dubai", price: "$40", sold: 132 },
  { name: "Bosphorus Sunset Cruise", type: "Tour", city: "Istanbul", price: "$38", sold: 64 },
  { name: "Hagia Sophia + Blue Mosque Tour", type: "Tour", city: "Istanbul", price: "$35", sold: 51 },
  { name: "Cappadocia Hot Air Balloon", type: "Experience", city: "Cappadocia", price: "$185", sold: 29 },
];

const bookings = [
  { id: "#10421", pkg: "Dubai Family Escape", customer: "B. Ahmed", pax: 4, status: "Confirmed", total: "$3,560" },
  { id: "#10420", pkg: "Umrah Premium", customer: "I. Khan", pax: 2, status: "Confirmed", total: "$3,300" },
  { id: "#10419", pkg: "Desert Safari x4", customer: "M. Saeed", pax: 4, status: "Pending", total: "$220" },
  { id: "#10418", pkg: "Burj Khalifa Tickets x2", customer: "R. Iqbal", pax: 2, status: "Confirmed", total: "$84" },
  { id: "#10417", pkg: "Turkey Discovery", customer: "F. Khan", pax: 2, status: "Pending", total: "$2,300" },
];

const leads = [
  { id: "L-620", name: "Family of 4 → Dubai + Maldives", budget: "$6,000", from: "Riyadh, KSA", time: "30min ago", hot: true },
  { id: "L-619", name: "Umrah group (12 pax) → Makkah", budget: "$18,000", from: "Dubai, UAE", time: "3h ago", hot: true },
  { id: "L-618", name: "Couple → Turkey honeymoon", budget: "$3,500", from: "Lahore, PK", time: "5h ago", hot: false },
  { id: "L-617", name: "Solo traveler → Bali", budget: "$1,800", from: "Abu Dhabi, UAE", time: "1d ago", hot: false },
  { id: "L-615", name: "Corporate group → Istanbul", budget: "$22,000", from: "Karachi, PK", time: "2d ago", hot: false },
  { id: "L-610", name: "Family of 6 → UK", budget: "$9,500", from: "Dubai, UAE", time: "3d ago", hot: false },
];

const monthlyRevenue = [
  { month: "Jun 2026", bookings: 9, revenue: "$28,400", growth: "+18%" },
  { month: "May 2026", bookings: 14, revenue: "$24,100", growth: "+12%" },
  { month: "Apr 2026", bookings: 11, revenue: "$21,500", growth: "+8%" },
  { month: "Mar 2026", bookings: 8, revenue: "$19,900", growth: "+5%" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AgencyDashboard() {
  const user = useDashboardUser();
  const [liveBookings, setLiveBookings] = useState<number | null>(null);
  const [liveLeads, setLiveLeads] = useState<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchAgencyBookings().then((rows) => setLiveBookings(rows.length));
    fetchAgencyLeads().then((rows) => setLiveLeads(rows.length));
  }, []);

  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <DatabaseStatusBanner health={user.databaseHealth} />
        <DashboardProfileSection user={user} />
        {liveBookings !== null && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✓ Supabase live — {liveBookings} booking requests · {liveLeads ?? 0} leads in intake.
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active packages" value="3" icon="planner" hint="4 total listings" color="blue" />
          <StatCard label="New leads" value={liveLeads !== null ? String(liveLeads) : "6"} icon="users" hint={liveLeads !== null ? "Live intake" : "This week"} delta={liveLeads !== null ? undefined : "+6"} color="gold" />
          <StatCard label="Bookings (month)" value={liveBookings !== null ? String(liveBookings) : "42"} icon="doc" delta={liveBookings !== null ? undefined : "+18%"} color="green" />
          <StatCard label="Revenue (month)" value="$28.4k" icon="star" delta="+18%" color="navy" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Recent Bookings" subtitle="Latest confirmed and pending">
            {bookings.slice(0, 4).map((b) => (
              <TableRow
                key={b.id}
                cells={[b.pkg, b.customer, `${b.pax} pax`]}
                badge={b.status}
                badgeColor={b.status === "Confirmed" ? "green" : "gold"}
                action={<span className="font-bold text-navy text-sm">{b.total}</span>}
              />
            ))}
          </Panel>

          <Panel title="Revenue Snapshot">
            <div className="space-y-4">
              <ProgressBar label="Monthly revenue target ($35k)" pct={81} color="blue" />
              <ProgressBar label="Booking conversion rate" pct={74} color="green" />
              <ProgressBar label="Package occupancy" pct={68} color="gold" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Best seller</p>
                <p className="font-bold text-navy">Dubai Family Escape</p>
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Avg booking value</p>
                <p className="font-bold text-navy">$1,870</p>
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="Top Performing Tours & Tickets">
          {tours.slice(0, 4).map((t) => (
            <TableRow
              key={t.name}
              cells={[t.name, t.city, t.type]}
              action={
                <div className="flex items-center gap-3">
                  <span className="text-xs text-charcoal/50">{t.sold} sold</span>
                  <span className="font-bold text-navy text-sm">{t.price}</span>
                </div>
              }
            />
          ))}
        </Panel>
      </div>
    ),

    packages: (
      <div className="space-y-4">
        {packages.map((p) => (
          <div key={p.name} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-navy">{p.name}</h3>
                  <span className={`chip text-xs ${p.active ? "bg-emerald-50 text-emerald-700" : "bg-soft text-charcoal/50"}`}>
                    {p.active ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-charcoal/55">{p.nights} nights · {p.pax} · {p.bookings} bookings</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-navy">{p.price}</p>
                <p className="text-xs text-charcoal/45">per person</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-primary px-4 py-2 text-sm">Edit</button>
              <button className="btn-outline px-4 py-2 text-sm">View bookings</button>
              {!p.active && <button className="btn-outline px-4 py-2 text-sm text-emerald-600 border-emerald-200">Publish</button>}
            </div>
          </div>
        ))}
        <button className="btn-outline px-5 py-2.5 text-sm">+ Create new package</button>
      </div>
    ),

    tours: (
      <div className="space-y-4">
        {tours.map((t) => (
          <div key={t.name} className="card flex items-center justify-between p-5">
            <div className="flex-1">
              <p className="font-bold text-navy">{t.name}</p>
              <p className="text-sm text-charcoal/55">{t.city} · {t.type} · {t.sold} sold</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-extrabold text-navy">{t.price}</span>
              <button className="btn-outline px-3 py-1.5 text-xs">Edit</button>
            </div>
          </div>
        ))}
        <div className="flex gap-3">
          <button className="btn-outline px-5 py-2.5 text-sm">+ Add tour</button>
          <button className="btn-outline px-5 py-2.5 text-sm">+ Add ticket</button>
        </div>
      </div>
    ),

    bookings: (
      <div className="space-y-4">
        <Panel title="All Bookings" subtitle="Confirmed, pending, and completed">
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between border-b border-soft-200 py-4 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xs text-charcoal/40 font-mono">{b.id}</span>
                <div>
                  <p className="text-sm font-semibold text-navy">{b.pkg}</p>
                  <p className="text-xs text-charcoal/50">{b.customer} · {b.pax} pax</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`chip text-xs ${b.status === "Confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-gold/15 text-navy"}`}>
                  {b.status}
                </span>
                <span className="font-bold text-navy">{b.total}</span>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    ),

    leads: (
      <div className="space-y-4">
        <Panel title="Lead Inbox" subtitle="Respond within 2 hours to improve conversion" noPad>
          <div className="divide-y divide-soft-200">
            {leads.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-5">
                <div className="flex items-start gap-3">
                  {l.hot && <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-gold" />}
                  <div>
                    <p className="font-bold text-navy">{l.name}</p>
                    <p className="text-sm text-charcoal/55">
                      {l.from} · Budget: <span className="font-semibold text-navy">{l.budget}</span> · {l.time}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary px-4 py-2 text-sm">Respond</button>
                  <button className="btn-outline px-3 py-2 text-sm">Pass</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),

    revenue: (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total lifetime" value="$142k" icon="star" color="gold" />
          <StatCard label="This month" value="$28.4k" icon="users" delta="+18%" color="green" />
          <StatCard label="Pending payout" value="$4,200" icon="doc" hint="Processes Monday" color="blue" />
        </div>

        <Panel title="Monthly Revenue Breakdown">
          {monthlyRevenue.map((r) => (
            <TableRow
              key={r.month}
              cells={[r.month, `${r.bookings} bookings`]}
              badge={r.growth}
              badgeColor="green"
              action={<span className="font-bold text-navy text-sm">{r.revenue}</span>}
            />
          ))}
        </Panel>

        <Panel title="Top Revenue Sources">
          <div className="space-y-4">
            <ProgressBar label="Packages" pct={62} color="blue" />
            <ProgressBar label="Tours & tickets" pct={24} color="gold" />
            <ProgressBar label="Transport & extras" pct={14} color="green" />
          </div>
        </Panel>

        <Panel title="Payout Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Bank IBAN</label>
              <input className="input" placeholder="AE xx xxxx xxxx xxxx xxxx x" />
            </div>
            <div>
              <label className="label">Payout schedule</label>
              <select className="input">
                <option>Weekly (every Monday)</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
          <button className="btn-primary mt-4 px-5 py-2.5 text-sm">Save payout info</button>
        </Panel>
      </div>
    ),

    verification: (
      <div className="space-y-4">
        <Panel
          title="Verification Status"
          subtitle="Verified agencies get a premium badge and rank higher in search"
          action={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue px-3 py-1.5 text-xs font-bold text-white">
              <Icon name="check" className="h-3.5 w-3.5" />
              Verified Agency
            </span>
          }
        >
          <div className="space-y-3">
            {[
              { item: "Business trade license uploaded", done: true },
              { item: "Identity document of owner verified", done: true },
              { item: "Business email confirmed", done: true },
              { item: "Office address verified", done: true },
              { item: "Bank payout details added", done: false },
              { item: "Professional photos uploaded", done: false },
            ].map((c) => (
              <div key={c.item} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-soft transition-colors">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${c.done ? "bg-blue text-white" : "border-2 border-soft-200 text-charcoal/30"}`}>
                  {c.done ? "✓" : ""}
                </span>
                <span className={`text-sm ${c.done ? "text-charcoal/55 line-through" : "text-navy"}`}>
                  {c.item}
                </span>
                {!c.done && <button className="ml-auto text-xs text-blue font-semibold hover:underline">Upload →</button>}
              </div>
            ))}
          </div>
        </Panel>
        <Disclaimer>
          Verification confirms business identity and registration only. It is not a quality endorsement and does not
          guarantee bookings, pricing, availability, or any travel outcomes.
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
