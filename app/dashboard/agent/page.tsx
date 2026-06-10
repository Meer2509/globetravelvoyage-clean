import type { Metadata } from "next";
import {
  DashboardLayout,
  StatCard,
  Panel,
  type DashboardTab,
} from "@/components/DashboardLayout";
import { Disclaimer } from "@/components/Disclaimer";
import { Stars } from "@/components/Stars";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Visa Agent Dashboard",
  description:
    "Manage client applications, leads, reviews and generate client authorization form templates.",
};

const tabs: DashboardTab[] = [
  { key: "overview", label: "Overview", icon: "globe" },
  { key: "profile", label: "My Profile", icon: "agent" },
  { key: "services", label: "Services", icon: "visa" },
  { key: "clients", label: "Client Applications", icon: "doc", badge: 5 },
  { key: "authorization", label: "Authorization Form", icon: "doc" },
  { key: "leads", label: "Leads", icon: "users", badge: 3 },
  { key: "reviews", label: "Reviews", icon: "star" },
];

export default function AgentDashboard() {
  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active clients" value="5" icon="users" />
          <StatCard label="New leads" value="3" icon="agent" hint="This week" />
          <StatCard label="Approval prep rate" value="92%" icon="check" hint="Docs completeness" />
          <StatCard label="Rating" value="4.9★" icon="star" hint="312 reviews" />
        </div>
        <Panel title="Pipeline">
          {[
            { stage: "New leads", count: 3 },
            { stage: "Document collection", count: 2 },
            { stage: "Application review", count: 2 },
            { stage: "Submitted / interview", count: 1 },
          ].map((p) => (
            <div key={p.stage} className="flex items-center justify-between border-b border-soft-200 py-2.5 text-sm last:border-0">
              <span className="text-navy/70">{p.stage}</span>
              <span className="chip">{p.count}</span>
            </div>
          ))}
        </Panel>
      </div>
    ),
    profile: (
      <Panel title="Public agent profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Display name</label>
            <input className="input" defaultValue="Sana Malik" />
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" defaultValue="Senior Visa Consultant" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Specialties</label>
            <input className="input" defaultValue="USA B1/B2, UK Visitor, Schengen" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">About</label>
            <textarea className="input min-h-24" defaultValue="10+ years helping travelers prepare strong, honest visa applications." />
          </div>
        </div>
        <button className="btn-primary mt-4 px-5 py-2.5">Save profile</button>
      </Panel>
    ),
    services: (
      <div className="space-y-4">
        {[
          { name: "Document review & checklist", price: "$40" },
          { name: "Full application preparation", price: "$120" },
          { name: "Interview coaching session", price: "$60" },
        ].map((s) => (
          <div key={s.name} className="card flex items-center justify-between p-5">
            <p className="font-semibold text-navy">{s.name}</p>
            <span className="font-bold text-navy">{s.price}</span>
          </div>
        ))}
        <button className="btn-outline px-5 py-2.5 text-sm">+ Add service</button>
      </div>
    ),
    clients: (
      <div className="space-y-4">
        {[
          { name: "Ahmed K.", visa: "USA B1/B2", stage: "Documents", pct: 60 },
          { name: "Maria L.", visa: "Schengen", stage: "Review", pct: 80 },
          { name: "Imran S.", visa: "UK Visitor", stage: "Submitted", pct: 100 },
        ].map((c) => (
          <Panel key={c.name} title={`${c.name} · ${c.visa}`}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-navy/60">Stage: {c.stage}</span>
              <span className="font-semibold text-navy">{c.pct}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-soft-200">
              <div className="h-2 rounded-full bg-blue" style={{ width: `${c.pct}%` }} />
            </div>
          </Panel>
        ))}
      </div>
    ),
    authorization: (
      <div className="space-y-4">
        <Panel
          title="Client authorization form template"
          action={<button className="btn-primary px-4 py-2 text-sm">Generate PDF</button>}
        >
          <div className="rounded-xl border border-soft-200 bg-soft/40 p-5 text-sm leading-relaxed text-navy/75">
            <p className="text-center font-bold text-navy">AUTHORIZATION FORM</p>
            <p className="mt-3">
              I, <span className="font-semibold">[Client Full Name]</span>, holder of
              passport <span className="font-semibold">[Passport No.]</span>, hereby
              authorize <span className="font-semibold">Sana Malik</span> to assist
              me with the preparation and submission of my{" "}
              <span className="font-semibold">[Visa Type]</span> application.
            </p>
            <p className="mt-3">
              I confirm that all information and documents I provide are true and
              accurate. I understand that the agent provides preparation assistance
              only and does <span className="font-semibold">not</span> guarantee
              visa approval, which rests solely with the relevant authority.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <div className="h-10 border-b border-navy/40" />
                <p className="mt-1 text-xs">Client signature & date</p>
              </div>
              <div>
                <div className="h-10 border-b border-navy/40" />
                <p className="mt-1 text-xs">Agent signature & date</p>
              </div>
            </div>
          </div>
        </Panel>
        <Disclaimer>
          This template is a sample for convenience only and is not legal advice.
          Globe Travel Voyage is not a law firm. Ensure any authorization complies
          with local laws and the requirements of the relevant authority.
        </Disclaimer>
      </div>
    ),
    leads: (
      <div className="space-y-4">
        {[
          { name: "New lead · USA F-1", from: "Lahore, PK", time: "2h ago" },
          { name: "New lead · Canada TRV", from: "Dubai, UAE", time: "5h ago" },
          { name: "New lead · Schengen", from: "Karachi, PK", time: "1d ago" },
        ].map((l) => (
          <div key={l.name} className="card flex items-center justify-between p-5">
            <div>
              <p className="font-semibold text-navy">{l.name}</p>
              <p className="text-sm text-navy/55">
                {l.from} · {l.time}
              </p>
            </div>
            <button className="btn-blue px-4 py-2 text-sm">Respond</button>
          </div>
        ))}
      </div>
    ),
    reviews: (
      <div className="space-y-4">
        {[
          { name: "Bilal A.", text: "Clear, honest and professional. Highly recommend.", rating: 5 },
          { name: "Nadia R.", text: "Helped me prepare strong documents for my Schengen visa.", rating: 5 },
        ].map((r) => (
          <div key={r.name} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="font-bold text-navy">{r.name}</p>
              <Stars rating={r.rating} />
            </div>
            <p className="mt-2 text-sm text-navy/70">{r.text}</p>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <DashboardLayout
      role="Visa Agent"
      name="Sana Malik"
      initials="SM"
      tabs={tabs}
      sections={sections}
      verified
    />
  );
}
