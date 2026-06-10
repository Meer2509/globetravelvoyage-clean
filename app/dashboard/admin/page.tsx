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
  title: "Admin Console",
  description:
    "Oversee users, roles, verifications, listings, bookings, payments, referrals, reviews and content.",
};

const tabs: DashboardTab[] = [
  { key: "overview", label: "Overview", icon: "globe" },
  { key: "users", label: "Users & Roles", icon: "users", badge: "12k" },
  { key: "approvals", label: "Verifications", icon: "shield", badge: 7 },
  { key: "listings", label: "Listings", icon: "ticket" },
  { key: "bookings", label: "Bookings", icon: "doc" },
  { key: "payments", label: "Payments", icon: "star" },
  { key: "referrals", label: "Referrals", icon: "referral" },
  { key: "reviews", label: "Reviews", icon: "star" },
  { key: "content", label: "Content & SEO", icon: "planner" },
];

function Row({ cells, badge }: { cells: string[]; badge?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-soft-200 py-2.5 text-sm last:border-0">
      <span className="text-navy/75">{cells.join(" · ")}</span>
      {badge && <span className="chip">{badge}</span>}
    </div>
  );
}

export default function AdminDashboard() {
  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value="12,480" icon="users" hint="+312 this week" />
          <StatCard label="Verified providers" value="1,204" icon="shield" />
          <StatCard label="Bookings (mo.)" value="3,841" icon="doc" />
          <StatCard label="GMV (mo.)" value="$1.9M" icon="star" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Pending verification approvals">
            <Row cells={["Crescent Travel House", "Agency"]} badge="Review" />
            <Row cells={["Priya Nair", "Visa Agent"]} badge="Review" />
            <Row cells={["Joey C.", "Tour Guide"]} badge="Review" />
          </Panel>
          <Panel title="System health">
            {["AI assistant", "Search", "Payments (demo)", "Notifications"].map((s) => (
              <div key={s} className="flex items-center justify-between border-b border-soft-200 py-2.5 text-sm last:border-0">
                <span className="text-navy/75">{s}</span>
                <span className="flex items-center gap-1.5 text-blue">
                  <Icon name="check" className="h-4 w-4" /> Operational
                </span>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    ),
    users: (
      <Panel title="Users & roles" action={<button className="btn-outline px-4 py-2 text-sm">Export</button>}>
        <Row cells={["Bilal Ahmed", "bilal@example.com", "Traveler"]} badge="Active" />
        <Row cells={["Sana Malik", "sana@example.com", "Visa Agent"]} badge="Verified" />
        <Row cells={["Voyage Pro Travels", "ops@voyagepro.com", "Agency"]} badge="Verified" />
        <Row cells={["Reyes Santos", "reyes@example.com", "Visa Agent"]} badge="Pending" />
      </Panel>
    ),
    approvals: (
      <div className="space-y-4">
        {[
          { name: "Crescent Travel House", role: "Agency" },
          { name: "Priya Nair", role: "Visa Agent" },
          { name: "Joey C.", role: "Tour Guide" },
        ].map((a) => (
          <div key={a.name} className="card flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-navy">{a.name}</p>
              <p className="text-sm text-navy/55">{a.role} · documents submitted</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-blue px-4 py-2 text-sm">Approve</button>
              <button className="btn-outline px-4 py-2 text-sm">Reject</button>
            </div>
          </div>
        ))}
      </div>
    ),
    listings: (
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Visa guides", value: "52", icon: "visa" as const },
          { label: "Tours", value: "1,920", icon: "tour" as const },
          { label: "Tickets", value: "3,410", icon: "ticket" as const },
          { label: "Properties", value: "880", icon: "property" as const },
        ].map((l) => (
          <StatCard key={l.label} label={l.label} value={l.value} icon={l.icon} />
        ))}
      </div>
    ),
    bookings: (
      <Panel title="Recent bookings">
        <Row cells={["#10421", "Dubai Family Escape", "$890"]} badge="Confirmed" />
        <Row cells={["#10420", "Umrah Premium", "$1,650"]} badge="Confirmed" />
        <Row cells={["#10419", "Desert Safari", "$220"]} badge="Pending" />
      </Panel>
    ),
    payments: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Processed (mo.)" value="$1.9M" icon="star" />
          <StatCard label="Payouts due" value="$182k" icon="doc" />
          <StatCard label="Refunds" value="$9.4k" icon="referral" />
        </div>
        <Disclaimer>
          Payments are not connected yet (no payment processor integrated). All
          figures are sample data for demonstration only.
        </Disclaimer>
      </div>
    ),
    referrals: (
      <Panel title="Referral program">
        <Row cells={["Total referrers", "3,210"]} />
        <Row cells={["Credits issued (mo.)", "$74k"]} />
        <Row cells={["Top tier (Ambassador)", "48 users"]} />
      </Panel>
    ),
    reviews: (
      <Panel title="Review moderation">
        <Row cells={["★5", "Great visa help from Sana", "Bilal A."]} badge="Published" />
        <Row cells={["★4", "Smooth Dubai package", "Maria S."]} badge="Published" />
        <Row cells={["★1", "Flagged: suspected spam", "Anon"]} badge="Review" />
      </Panel>
    ),
    content: (
      <div className="space-y-4">
        <Panel title="Content & SEO pages">
          <Row cells={["/visa/usa", "USA visa hub"]} badge="Published" />
          <Row cells={["/visa/usa-from-pakistan", "Featured"]} badge="Published" />
          <Row cells={["/legal/disclaimer", "Legal"]} badge="Published" />
          <Row cells={["/about", "Company"]} badge="Published" />
        </Panel>
        <button className="btn-outline px-5 py-2.5 text-sm">+ New content page</button>
      </div>
    ),
  };

  return (
    <DashboardLayout
      role="Administrator"
      name="Admin Console"
      initials="AD"
      tabs={tabs}
      sections={sections}
    />
  );
}
