import type { Metadata } from "next";
import {
  DashboardLayout,
  StatCard,
  Panel,
  type DashboardTab,
} from "@/components/DashboardLayout";
import { Disclaimer } from "@/components/Disclaimer";
import { VerifiedBadge } from "@/components/TrustBadge";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Agency & Host Dashboard",
  description:
    "List packages, tickets, tours and properties, manage leads and bookings, and get verified.",
};

const tabs: DashboardTab[] = [
  { key: "overview", label: "Overview", icon: "globe" },
  { key: "packages", label: "Packages", icon: "planner", badge: 3 },
  { key: "listings", label: "Tickets & Tours", icon: "ticket", badge: 4 },
  { key: "properties", label: "Properties", icon: "property", badge: 2 },
  { key: "leads", label: "Leads", icon: "users", badge: 6 },
  { key: "bookings", label: "Bookings", icon: "doc", badge: 9 },
  { key: "verification", label: "Verification", icon: "shield" },
];

export default function AgencyDashboard() {
  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active listings" value="9" icon="ticket" />
          <StatCard label="New leads" value="6" icon="users" hint="This week" />
          <StatCard label="Bookings (mo.)" value="42" icon="doc" />
          <StatCard label="Revenue (mo.)" value="$28.4k" icon="star" />
        </div>
        <Panel title="Recent bookings">
          {[
            { name: "Dubai Family Escape", customer: "B. Ahmed", price: "$890" },
            { name: "Umrah Premium", customer: "I. Khan", price: "$1,650" },
            { name: "Turkey Discovery", customer: "M. Saeed", price: "$1,150" },
          ].map((b) => (
            <div key={b.name} className="flex items-center justify-between border-b border-soft-200 py-2.5 text-sm last:border-0">
              <span className="text-navy/75">
                {b.name} · <span className="text-navy/50">{b.customer}</span>
              </span>
              <span className="font-semibold text-navy">{b.price}</span>
            </div>
          ))}
        </Panel>
      </div>
    ),
    packages: (
      <div className="space-y-4">
        {[
          { name: "Dubai Family Escape", nights: 5, price: "$890", active: true },
          { name: "Umrah Premium Package", nights: 10, price: "$1,650", active: true },
          { name: "Turkey Discovery", nights: 7, price: "$1,150", active: false },
        ].map((p) => (
          <div key={p.name} className="card flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-navy">{p.name}</p>
              <p className="text-sm text-navy/55">{p.nights} nights · {p.price}</p>
            </div>
            <span className={`chip ${p.active ? "bg-blue/10 text-blue" : ""}`}>
              {p.active ? "Live" : "Draft"}
            </span>
          </div>
        ))}
        <button className="btn-outline px-5 py-2.5 text-sm">+ Create package</button>
      </div>
    ),
    listings: (
      <div className="space-y-4">
        {[
          { name: "Burj Khalifa tickets", type: "Ticket", price: "$42" },
          { name: "Old Dubai walking tour", type: "Tour", price: "$45" },
          { name: "Desert safari", type: "Tour", price: "$55" },
          { name: "Museum of the Future", type: "Ticket", price: "$40" },
        ].map((l) => (
          <div key={l.name} className="card flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-navy">{l.name}</p>
              <p className="text-sm text-navy/55">{l.type}</p>
            </div>
            <span className="font-bold text-navy">{l.price}</span>
          </div>
        ))}
        <button className="btn-outline px-5 py-2.5 text-sm">+ Add listing</button>
      </div>
    ),
    properties: (
      <div className="space-y-4">
        {[
          { name: "Marina 2BR Apartment", type: "For Rent", price: "$2,400/mo" },
          { name: "Furnished Studio — Monthly", type: "Travel Stay", price: "$650/mo" },
        ].map((p) => (
          <div key={p.name} className="card flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-navy">{p.name}</p>
              <p className="text-sm text-navy/55">{p.type}</p>
            </div>
            <span className="font-bold text-navy">{p.price}</span>
          </div>
        ))}
        <button className="btn-outline px-5 py-2.5 text-sm">+ List property</button>
        <Disclaimer variant="inline" />
      </div>
    ),
    leads: (
      <div className="space-y-4">
        {[
          { name: "Family of 4 → Dubai", time: "1h ago" },
          { name: "Umrah group (12) → Makkah", time: "4h ago" },
          { name: "Couple → Turkey", time: "1d ago" },
        ].map((l) => (
          <div key={l.name} className="card flex items-center justify-between p-5">
            <div>
              <p className="font-semibold text-navy">{l.name}</p>
              <p className="text-sm text-navy/55">{l.time}</p>
            </div>
            <button className="btn-blue px-4 py-2 text-sm">Respond</button>
          </div>
        ))}
      </div>
    ),
    bookings: (
      <Panel title="All bookings">
        {[
          { id: "#10421", name: "Dubai Family Escape", status: "Confirmed" },
          { id: "#10420", name: "Umrah Premium", status: "Confirmed" },
          { id: "#10419", name: "Desert Safari x4", status: "Pending" },
        ].map((b) => (
          <div key={b.id} className="flex items-center justify-between border-b border-soft-200 py-2.5 text-sm last:border-0">
            <span className="text-navy/75">
              <span className="text-navy/45">{b.id}</span> {b.name}
            </span>
            <span className="chip">{b.status}</span>
          </div>
        ))}
      </Panel>
    ),
    verification: (
      <div className="space-y-4">
        <Panel
          title="Verification status"
          action={<VerifiedBadge />}
        >
          <ul className="space-y-3 text-sm">
            {[
              { item: "Business registration verified", done: true },
              { item: "Identity verified", done: true },
              { item: "Contact details confirmed", done: true },
              { item: "Bank payout details", done: false },
            ].map((c) => (
              <li key={c.item} className="flex items-center gap-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${c.done ? "bg-blue text-white" : "border border-soft-200 text-navy/40"}`}>
                  {c.done ? "✓" : ""}
                </span>
                <span className={c.done ? "text-navy/60" : "text-navy/80"}>{c.item}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Disclaimer>
          Verification confirms identity and business details. It is not an
          endorsement and does not guarantee bookings, prices or outcomes.
        </Disclaimer>
      </div>
    ),
  };

  return (
    <DashboardLayout
      role="Travel Agency"
      name="Voyage Pro Travels"
      initials="VP"
      tabs={tabs}
      sections={sections}
      verified
    />
  );
}
