"use client";

import { useState, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/auth";
import { fetchHostListings, fetchRoleDashboardSummary } from "@/lib/supabase/queries";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { DashboardProfileSection } from "@/components/DashboardProfileSection";
import { DatabaseSetupBanner } from "@/components/DatabaseSetupBanner";
import { Disclaimer } from "@/components/Disclaimer";
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
  { key: "listings", label: "My Listings", icon: "property", badge: 3 },
  { key: "requests", label: "Booking Requests", icon: "doc", badge: 4 },
  { key: "leads", label: "Buyer / Renter Leads", icon: "users", badge: 5 },
  { key: "inquiries", label: "Buy/Sell Inquiries", icon: "agent" },
];

// ─── Mock data ─────────────────────────────────────────────────────────────────

const listings = [
  {
    name: "Marina 2BR Apartment",
    type: "For Rent",
    city: "Dubai Marina",
    price: "$2,400/mo",
    bedrooms: 2,
    sqft: 1200,
    views: 342,
    leads: 8,
    active: true,
  },
  {
    name: "Furnished Studio — Short Stay",
    type: "Travel Stay",
    city: "JLT, Dubai",
    price: "$650/mo",
    bedrooms: 0,
    sqft: 480,
    views: 215,
    leads: 5,
    active: true,
  },
  {
    name: "3BR Villa — Jumeirah",
    type: "For Sale",
    city: "Jumeirah, Dubai",
    price: "$1.2M",
    bedrooms: 3,
    sqft: 2800,
    views: 128,
    leads: 3,
    active: false,
  },
];

const bookingRequests = [
  { id: "BR-101", name: "Ahmed & Fatima", property: "Furnished Studio — Short Stay", dates: "Jun 20 – Jul 4", nights: 14, total: "$350", status: "Pending" },
  { id: "BR-100", name: "James T.", property: "Marina 2BR Apartment", dates: "Jul 1 – Jul 31", nights: 30, total: "$2,400", status: "Confirmed" },
  { id: "BR-099", name: "Priya K.", property: "Marina 2BR Apartment", dates: "Aug 1 – Aug 31", nights: 30, total: "$2,400", status: "Pending" },
  { id: "BR-098", name: "Marco V.", property: "Furnished Studio — Short Stay", dates: "Jun 10 – Jun 17", nights: 7, total: "$175", status: "Completed" },
];

const leads = [
  { id: "RL-501", name: "Hassan M.", property: "Marina 2BR Apartment", type: "Rent inquiry", budget: "$2,000–2,500/mo", time: "1h ago", hot: true },
  { id: "RL-500", name: "Aisha K.", property: "Furnished Studio", type: "Short stay", budget: "$600–700/mo", time: "3h ago", hot: true },
  { id: "RL-499", name: "David L.", property: "Marina 2BR", type: "Viewing request", budget: "$2,200/mo", time: "6h ago", hot: false },
  { id: "RL-498", name: "Sara J.", property: "Any available", type: "General inquiry", budget: "$1,500–2,000/mo", time: "1d ago", hot: false },
  { id: "RL-495", name: "Tariq F.", property: "Marina 2BR", type: "Rent inquiry", budget: "$2,400/mo", time: "2d ago", hot: false },
];

const inquiries = [
  {
    id: "INQ-81",
    name: "Khalid R.",
    property: "3BR Villa — Jumeirah",
    type: "Buyer",
    budget: "$1.1M–1.3M",
    message: "Very interested in the Jumeirah villa. Is there flexibility on the asking price? Can we schedule a viewing?",
    date: "Jun 10",
  },
  {
    id: "INQ-80",
    name: "European Investment Co.",
    property: "Any available",
    type: "Investor",
    budget: "$2M+",
    message: "Looking to acquire 3–5 units in the Marina area for rental investment. Do you have or know of any bulk listings?",
    date: "Jun 8",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HostDashboard() {
  const user = useDashboardUser();
  const [listingCount, setListingCount] = useState<number | null>(null);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [bookingCount, setBookingCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchHostListings().then((rows) => setListingCount(rows.length));
    fetchRoleDashboardSummary().then((s) => {
      if (s) {
        setLeadCount(s.leadRequests);
        setBookingCount(s.bookingRequests);
      }
    });
  }, []);

  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        {user.setupMessage && <DatabaseSetupBanner message={user.setupMessage} />}
        <DashboardProfileSection user={user} />
        {listingCount !== null && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✓ Supabase live — {listingCount} property listings · {leadCount ?? 0} leads · {bookingCount ?? 0} bookings.
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active listings" value={listingCount !== null ? String(listingCount) : "2"} icon="property" hint={listingCount !== null ? "Your listings" : "1 draft"} color="blue" />
          <StatCard label="Booking requests" value={bookingCount !== null ? String(bookingCount) : "4"} icon="doc" hint={bookingCount !== null ? "Live requests" : "3 need response"} color="gold" />
          <StatCard label="Total leads" value={leadCount !== null ? String(leadCount) : "5"} icon="users" hint={leadCount !== null ? "Your lead requests" : "This week"} delta={leadCount !== null ? undefined : "+5"} color="green" />
          <StatCard label="Revenue (month)" value="$2,750" icon="star" delta="+8%" color="navy" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Active Bookings">
            {bookingRequests.filter((r) => r.status !== "Completed").map((r) => (
              <TableRow
                key={r.id}
                cells={[r.name, r.property.split("—")[0].trim(), r.dates]}
                badge={r.status}
                badgeColor={r.status === "Confirmed" ? "green" : "gold"}
                action={<span className="font-bold text-navy text-sm">{r.total}</span>}
              />
            ))}
          </Panel>

          <Panel title="Listing Performance">
            <div className="space-y-4">
              <ProgressBar label="Marina 2BR — occupancy" pct={85} color="blue" />
              <ProgressBar label="Furnished Studio — occupancy" pct={72} color="green" />
              <ProgressBar label="Villa — profile completion" pct={60} color="gold" />
            </div>
          </Panel>
        </div>

        <Panel title="Recent Leads">
          {leads.slice(0, 3).map((l) => (
            <TableRow
              key={l.id}
              cells={[l.name, l.property, l.type, l.time]}
              badge={l.hot ? "Hot" : "New"}
              badgeColor={l.hot ? "gold" : "blue"}
            />
          ))}
        </Panel>

        <Disclaimer variant="inline" />
      </div>
    ),

    listings: (
      <div className="space-y-4">
        {listings.map((l) => (
          <div key={l.name} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-navy">{l.name}</h3>
                  <span className={`chip text-xs ${
                    l.type === "For Sale" ? "bg-gold/15 text-navy" :
                    l.type === "Travel Stay" ? "bg-blue/10 text-blue" :
                    "bg-emerald-50 text-emerald-700"
                  }`}>{l.type}</span>
                  <span className={`chip text-xs ${l.active ? "bg-emerald-50 text-emerald-700" : "bg-soft text-charcoal/40"}`}>
                    {l.active ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-charcoal/55">
                  {l.city} · {l.bedrooms > 0 ? `${l.bedrooms} BR · ` : "Studio · "}{l.sqft} sqft · {l.views} views · {l.leads} leads
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-navy">{l.price}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-primary px-4 py-2 text-sm">Edit listing</button>
              <button className="btn-outline px-4 py-2 text-sm">View leads</button>
              {!l.active && <button className="btn-outline px-4 py-2 text-sm text-emerald-600 border-emerald-200">Publish</button>}
            </div>
          </div>
        ))}

        <button className="btn-outline px-5 py-2.5 text-sm">+ List a new property</button>
        <Disclaimer>
          Globe Travel Voyage is not a real estate broker, agent, or agency. All listings are provided by independent property owners. We do not guarantee property availability, pricing, or transaction outcomes.
        </Disclaimer>
      </div>
    ),

    requests: (
      <div className="space-y-4">
        <Panel title="Booking Requests" subtitle="Short stays and monthly rentals" noPad>
          <div className="divide-y divide-soft-200">
            {bookingRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-bold text-navy">{r.name}</p>
                  <p className="text-sm text-charcoal/55">{r.property} · {r.dates} · {r.nights} nights</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`chip text-xs ${
                    r.status === "Completed" ? "bg-soft text-charcoal/50" :
                    r.status === "Confirmed" ? "bg-emerald-50 text-emerald-700" :
                    "bg-gold/15 text-navy"
                  }`}>{r.status}</span>
                  <span className="font-bold text-navy">{r.total}</span>
                  {r.status === "Pending" && (
                    <>
                      <button className="btn-primary px-3 py-1.5 text-xs">Accept</button>
                      <button className="btn-outline px-3 py-1.5 text-xs">Decline</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),

    leads: (
      <div className="space-y-4">
        <Panel title="Buyer & Renter Leads" subtitle="People who expressed interest in your properties" noPad>
          <div className="divide-y divide-soft-200">
            {leads.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-5">
                <div className="flex items-start gap-3">
                  {l.hot && <span className="mt-1.5 h-2 w-2 rounded-full bg-gold shrink-0" />}
                  <div>
                    <p className="font-bold text-navy">{l.name}</p>
                    <p className="text-sm text-charcoal/55">
                      {l.property} · {l.type} · Budget: <span className="font-semibold text-navy">{l.budget}</span>
                    </p>
                    <p className="text-xs text-charcoal/40">{l.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary px-4 py-2 text-sm">Respond</button>
                  <button className="btn-outline px-3 py-2 text-sm">Archive</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    ),

    inquiries: (
      <div className="space-y-4">
        {inquiries.map((inq) => (
          <Panel
            key={inq.id}
            title={`${inq.name} — ${inq.type}`}
            subtitle={`${inq.property} · Budget: ${inq.budget} · ${inq.date}`}
            action={<span className="chip bg-gold/15 text-navy">{inq.type}</span>}
          >
            <p className="text-sm text-charcoal/65 leading-relaxed">"{inq.message}"</p>
            <div className="mt-4 flex gap-2">
              <button className="btn-primary px-4 py-2 text-sm">Reply</button>
              <button className="btn-outline px-4 py-2 text-sm">Schedule viewing</button>
              <button className="btn-outline px-4 py-2 text-sm text-charcoal/50">Archive</button>
            </div>
          </Panel>
        ))}

        <Panel title="Post a Buy/Sell Listing">
          <div className="space-y-3">
            <div>
              <label className="label">Listing type</label>
              <select className="input">
                <option>Property for sale</option>
                <option>Property for rent</option>
                <option>Looking to buy</option>
                <option>Looking to rent</option>
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-24" placeholder="Describe the property or your requirements..." />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Location</label>
                <input className="input" placeholder="e.g., Dubai Marina" />
              </div>
              <div>
                <label className="label">Price / Budget</label>
                <input className="input" placeholder="e.g., $1.2M or $2,000/mo" />
              </div>
            </div>
            <button className="btn-primary px-5 py-2.5 text-sm">Post inquiry</button>
          </div>
        </Panel>

        <Disclaimer>
          Globe Travel Voyage is not a licensed real estate broker. Buy/sell inquiries are contact forms between interested parties. Always conduct proper due diligence before any property transaction.
        </Disclaimer>
      </div>
    ),
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
      roleColor="bg-amber-50 text-amber-700"
      avatarColor="bg-amber-600 text-white"
    />
  );
}
