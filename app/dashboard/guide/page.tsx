"use client";

import { useState, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/auth";
import { fetchGuideTours, fetchRoleDashboardSummary } from "@/lib/supabase/queries";
import { Stars } from "@/components/Stars";
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
  { key: "tours", label: "My Tours", icon: "ticket", badge: 4 },
  { key: "availability", label: "Availability", icon: "planner" },
  { key: "requests", label: "Booking Requests", icon: "users", badge: 5 },
  { key: "reviews", label: "Reviews", icon: "star" },
  { key: "earnings", label: "Earnings", icon: "users" },
];

// ─── Mock data ─────────────────────────────────────────────────────────────────

const tours = [
  { name: "Old Dubai Heritage Walk", duration: "3 hours", price: "$45", maxPax: 12, nextDate: "Jun 14", bookings: 34, active: true },
  { name: "Dubai Food Safari", duration: "4 hours", price: "$65", maxPax: 8, nextDate: "Jun 15", bookings: 21, active: true },
  { name: "Desert Sunset Photography", duration: "5 hours", price: "$90", maxPax: 6, nextDate: "Jun 18", bookings: 14, active: true },
  { name: "Gold Souk & Perfume Tour", duration: "2 hours", price: "$35", maxPax: 10, nextDate: "—", bookings: 8, active: false },
];

const requests = [
  { id: "R-211", name: "Sarah & James", tour: "Dubai Food Safari", date: "Jun 20", pax: 2, status: "Pending" },
  { id: "R-210", name: "Al-Rashidi Family", tour: "Old Dubai Heritage Walk", date: "Jun 22", pax: 5, status: "Pending" },
  { id: "R-209", name: "TourGroup UK (12)", tour: "Old Dubai Heritage Walk", date: "Jun 25", pax: 12, status: "Accepted" },
  { id: "R-208", name: "Marco B.", tour: "Desert Sunset Photography", date: "Jun 18", pax: 1, status: "Accepted" },
  { id: "R-207", name: "Priya & Arjun", tour: "Dubai Food Safari", date: "Jun 17", pax: 2, status: "Completed" },
];

const reviews = [
  { name: "James H.", flag: "🇬🇧", tour: "Old Dubai Heritage Walk", rating: 5, text: "Khalid was an extraordinary guide. His knowledge of the heritage area was unmatched. Truly a hidden gem experience!" },
  { name: "Priya R.", flag: "🇮🇳", tour: "Dubai Food Safari", rating: 5, text: "Best food tour in Dubai! We tried things we would never have found on our own. Absolutely loved it." },
  { name: "Marco B.", flag: "🇮🇹", tour: "Desert Sunset Photography", rating: 5, text: "The locations were perfect for photography. Khalid knows exactly where to go for the best light." },
];

const earningsData = [
  { month: "Jun 2026", tours: 8, revenue: "$1,240", status: "Current" },
  { month: "May 2026", tours: 14, revenue: "$2,180", status: "Paid" },
  { month: "Apr 2026", tours: 11, revenue: "$1,750", status: "Paid" },
];

// ─── Availability Calendar ─────────────────────────────────────────────────────

function AvailabilityCalendar() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(2026, 5, 14 + i);
    return {
      date: d.getDate(),
      day: days[d.getDay() === 0 ? 6 : d.getDay() - 1],
      status: [0, 2, 5, 8, 11].includes(i) ? "booked" : [3, 9, 13].includes(i) ? "blocked" : "available",
    };
  });

  const [availability, setAvailability] = useState(days.map((d) => ({ day: d, on: !["Fri"].includes(d) })));

  return (
    <div className="space-y-5">
      <Panel title="Weekly Schedule" subtitle="Toggle which days you guide tours">
        <div className="flex flex-wrap gap-3">
          {availability.map((a, i) => (
            <button
              key={a.day}
              onClick={() => setAvailability((prev) => prev.map((x, j) => j === i ? { ...x, on: !x.on } : x))}
              className={`flex-1 min-w-[60px] rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                a.on ? "bg-navy text-white shadow-md" : "bg-soft text-charcoal/40"
              }`}
            >
              {a.day}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Next 14 Days" subtitle="Visual calendar of bookings and blocked dates">
        <div className="grid grid-cols-7 gap-2">
          {dates.map((d, i) => (
            <div
              key={i}
              className={`rounded-xl p-2 text-center text-xs ${
                d.status === "booked" ? "bg-blue/10 text-blue font-bold" :
                d.status === "blocked" ? "bg-red-50 text-red-400" :
                "bg-soft text-charcoal/60"
              }`}
            >
              <div className="font-semibold text-[10px] uppercase">{d.day}</div>
              <div className="mt-0.5 text-sm font-bold">{d.date}</div>
              <div className="mt-0.5 text-[9px] capitalize">{d.status}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-blue/10" /> Booked</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-soft" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-50" /> Blocked</span>
        </div>
      </Panel>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function GuideDashboard() {
  const [tourCount, setTourCount] = useState<number | null>(null);
  const [bookingCount, setBookingCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchGuideTours().then((rows) => setTourCount(rows.length));
    fetchRoleDashboardSummary().then((s) => {
      if (s) setBookingCount(s.bookingRequests);
    });
  }, []);

  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        {tourCount !== null && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✓ Supabase live — {tourCount} tour listings · {bookingCount ?? 0} booking requests.
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active tours" value={tourCount !== null ? String(tourCount) : "3"} icon="ticket" hint={tourCount !== null ? "Your listings" : "1 draft"} color="blue" />
          <StatCard label="Pending requests" value={bookingCount !== null ? String(bookingCount) : "5"} icon="users" hint={bookingCount !== null ? "Live booking requests" : "2 need response"} delta={bookingCount !== null ? undefined : "+5"} color="gold" />
          <StatCard label="Total guests (mo.)" value="42" icon="globe" delta="+15%" color="green" />
          <StatCard label="Rating" value="4.96 ★" icon="star" hint="68 reviews" color="navy" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Upcoming Bookings" subtitle="Next 7 days">
            {requests.filter((r) => r.status !== "Completed").slice(0, 4).map((r) => (
              <TableRow
                key={r.id}
                cells={[r.name, r.tour, `Jun ${r.date.split(" ")[1]}`]}
                badge={r.status}
                badgeColor={r.status === "Accepted" ? "green" : "gold"}
                action={<span className="text-xs text-charcoal/50">{r.pax} pax</span>}
              />
            ))}
          </Panel>

          <Panel title="Performance">
            <div className="space-y-4">
              <ProgressBar label="Guest satisfaction" pct={98} color="blue" />
              <ProgressBar label="Booking acceptance rate" pct={91} color="green" />
              <ProgressBar label="Profile completeness" pct={85} color="gold" />
              <ProgressBar label="Response rate" pct={96} color="blue" />
            </div>
          </Panel>
        </div>
      </div>
    ),

    tours: (
      <div className="space-y-4">
        {tours.map((t) => (
          <div key={t.name} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-navy">{t.name}</h3>
                  <span className={`chip text-xs ${t.active ? "bg-emerald-50 text-emerald-700" : "bg-soft text-charcoal/40"}`}>
                    {t.active ? "Active" : "Draft"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-charcoal/55">
                  {t.duration} · Max {t.maxPax} pax · Next: {t.nextDate} · {t.bookings} total bookings
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-navy">{t.price}</p>
                <p className="text-xs text-charcoal/45">per person</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-primary px-4 py-2 text-sm">Edit tour</button>
              <button className="btn-outline px-4 py-2 text-sm">View reviews</button>
              {!t.active && <button className="btn-outline px-4 py-2 text-sm text-emerald-600 border-emerald-200">Publish</button>}
            </div>
          </div>
        ))}
        <button className="btn-outline px-5 py-2.5 text-sm">+ Create new tour</button>
      </div>
    ),

    availability: <AvailabilityCalendar />,

    requests: (
      <div className="space-y-4">
        <Panel title="Booking Requests" subtitle="Respond within 24h to maintain your ranking" noPad>
          <div className="divide-y divide-soft-200">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-bold text-navy">{r.name}</p>
                  <p className="text-sm text-charcoal/55">{r.tour} · {r.date} · {r.pax} pax</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`chip text-xs ${
                    r.status === "Completed" ? "bg-soft text-charcoal/50" :
                    r.status === "Accepted" ? "bg-emerald-50 text-emerald-700" :
                    "bg-gold/15 text-navy"
                  }`}>{r.status}</span>
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

    reviews: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Overall rating" value="4.96 ★" icon="star" color="gold" />
          <StatCard label="Total reviews" value="68" icon="users" color="blue" />
          <StatCard label="5-star" value="94%" icon="check" color="green" />
        </div>
        {reviews.map((r) => (
          <div key={r.name} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-soft text-xl">
                  {r.flag}
                </span>
                <div>
                  <p className="font-bold text-navy">{r.name}</p>
                  <p className="text-xs text-charcoal/50">{r.tour}</p>
                </div>
              </div>
              <Stars rating={r.rating} />
            </div>
            <p className="mt-3 text-sm text-charcoal/70">{r.text}</p>
          </div>
        ))}
      </div>
    ),

    earnings: (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Lifetime earned" value="$8,400" icon="users" color="gold" />
          <StatCard label="This month" value="$1,240" icon="star" delta="+22%" color="green" />
          <StatCard label="Pending payout" value="$320" icon="doc" hint="Processes Friday" color="blue" />
        </div>

        <Panel title="Monthly Breakdown">
          {earningsData.map((row) => (
            <TableRow
              key={row.month}
              cells={[row.month, `${row.tours} tour days`]}
              badge={row.status}
              badgeColor={row.status === "Current" ? "blue" : "green"}
              action={<span className="font-bold text-navy text-sm">{row.revenue}</span>}
            />
          ))}
        </Panel>

        <Panel title="Payout Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Bank IBAN</label>
              <input className="input" placeholder="AE xx xxxx xxxx xxxx xxxx x" />
            </div>
            <div>
              <label className="label">Payout frequency</label>
              <select className="input">
                <option>Weekly</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
          <button className="btn-primary mt-4 px-5 py-2.5 text-sm">Save</button>
        </Panel>
      </div>
    ),
  };

  return (
    <DashboardLayout
      role="Tour Guide"
      name="Khalid Al-Rashidi"
      initials="KR"
      tabs={tabs}
      sections={sections}
      verified
      roleColor="bg-purple-50 text-purple-700"
      avatarColor="bg-purple-700 text-white"
    />
  );
}
