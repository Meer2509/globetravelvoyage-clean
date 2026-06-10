import type { Metadata } from "next";
import {
  DashboardLayout,
  StatCard,
  Panel,
  type DashboardTab,
} from "@/components/DashboardLayout";
import { Disclaimer } from "@/components/Disclaimer";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Traveler Dashboard",
  description: "Saved trips, visa applications, bookings, documents and referrals.",
};

const tabs: DashboardTab[] = [
  { key: "overview", label: "Overview", icon: "globe" },
  { key: "trips", label: "Saved Trips", icon: "planner", badge: 3 },
  { key: "visas", label: "Visa Applications", icon: "visa", badge: 2 },
  { key: "bookings", label: "Bookings", icon: "ticket", badge: 4 },
  { key: "documents", label: "Documents", icon: "doc" },
  { key: "referrals", label: "Referrals", icon: "referral" },
  { key: "support", label: "Support", icon: "users" },
];

const checklist = [
  { item: "Passport (6+ months validity)", done: true },
  { item: "Passport-size photographs", done: true },
  { item: "Bank statements (6 months)", done: false },
  { item: "Employment letter", done: false },
  { item: "Travel itinerary", done: true },
];

export default function CustomerDashboard() {
  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Saved trips" value="3" icon="planner" />
          <StatCard label="Visa applications" value="2" icon="visa" hint="1 in review" />
          <StatCard label="Bookings" value="4" icon="ticket" />
          <StatCard label="Referral credits" value="$120" icon="referral" hint="3 referrals" />
        </div>
        <Panel title="Next steps">
          <ul className="space-y-3">
            {[
              "Complete your USA B1/B2 document checklist (60%)",
              "Confirm your Dubai hotel for 12 Aug",
              "Review your AI trip plan for Istanbul",
            ].map((s) => (
              <li key={s} className="flex items-center gap-3 text-sm text-navy/75">
                <Icon name="check" className="h-5 w-5 text-blue" /> {s}
              </li>
            ))}
          </ul>
        </Panel>
        <Disclaimer variant="compact" />
      </div>
    ),
    trips: (
      <div className="space-y-4">
        {[
          { name: "Dubai Family Escape", date: "12–17 Aug 2026", status: "Planning" },
          { name: "Umrah Journey", date: "Oct 2026", status: "Saved" },
          { name: "Istanbul Discovery", date: "Dec 2026", status: "AI draft" },
        ].map((t) => (
          <div key={t.name} className="card flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-navy">{t.name}</p>
              <p className="text-sm text-navy/55">{t.date}</p>
            </div>
            <span className="chip">{t.status}</span>
          </div>
        ))}
      </div>
    ),
    visas: (
      <div className="space-y-4">
        {[
          { type: "USA B1/B2 Visitor", stage: "Documents", pct: 60 },
          { type: "UK Standard Visitor", stage: "Submitted", pct: 90 },
        ].map((v) => (
          <Panel key={v.type} title={v.type}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-navy/60">Stage: {v.stage}</span>
              <span className="font-semibold text-navy">{v.pct}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-soft-200">
              <div className="h-2 rounded-full bg-blue" style={{ width: `${v.pct}%` }} />
            </div>
          </Panel>
        ))}
        <Disclaimer variant="inline" />
      </div>
    ),
    bookings: (
      <div className="space-y-4">
        {[
          { name: "Emirates DXB → LHE", date: "12 Aug", type: "Flight", price: "$210" },
          { name: "Burj Vista Residences", date: "12–17 Aug", type: "Stay", price: "$900" },
          { name: "Old Dubai Walking Tour", date: "14 Aug", type: "Tour", price: "$45" },
          { name: "Toyota Corolla rental", date: "12–17 Aug", type: "Car", price: "$160" },
        ].map((b) => (
          <div key={b.name} className="card flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-navy">{b.name}</p>
              <p className="text-sm text-navy/55">
                {b.type} · {b.date}
              </p>
            </div>
            <span className="font-bold text-navy">{b.price}</span>
          </div>
        ))}
      </div>
    ),
    documents: (
      <Panel title="USA B1/B2 document checklist">
        <ul className="space-y-3">
          {checklist.map((c) => (
            <li key={c.item} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  c.done ? "bg-blue text-white" : "border border-soft-200 text-navy/40"
                }`}
              >
                {c.done ? "✓" : ""}
              </span>
              <span className={c.done ? "text-navy/50 line-through" : "text-navy/80"}>
                {c.item}
              </span>
            </li>
          ))}
        </ul>
        <button className="btn-outline mt-5 px-5 py-2.5 text-sm">Upload document</button>
      </Panel>
    ),
    referrals: (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total referrals" value="3" icon="referral" />
          <StatCard label="Credits earned" value="$120" icon="star" />
          <StatCard label="Tier" value="Explorer" icon="users" />
        </div>
        <Panel title="Your referral link">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value="https://globetravelvoyage.com/r/your-code"
              className="input flex-1"
            />
            <button className="btn-primary px-5 py-2.5">Copy link</button>
          </div>
        </Panel>
      </div>
    ),
    support: (
      <Panel title="Support messages">
        <div className="space-y-3">
          <div className="rounded-xl bg-soft/60 p-4 text-sm">
            <p className="font-semibold text-navy">Support team</p>
            <p className="mt-1 text-navy/70">
              Hi! How can we help with your trip or visa application today?
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <input className="input flex-1" placeholder="Type a message…" />
          <button className="btn-primary px-5 py-2.5">Send</button>
        </div>
      </Panel>
    ),
  };

  return (
    <DashboardLayout
      role="Traveler"
      name="Bilal Ahmed"
      initials="BA"
      tabs={tabs}
      sections={sections}
    />
  );
}
