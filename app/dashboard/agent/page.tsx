"use client";

import { useState } from "react";
import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";
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
  { key: "profile", label: "My Profile", icon: "agent" },
  { key: "services", label: "Services & Pricing", icon: "visa" },
  { key: "clients", label: "Client Applications", icon: "doc", badge: 5 },
  { key: "authorization", label: "Authorization Form", icon: "doc" },
  { key: "leads", label: "Leads Inbox", icon: "users", badge: 3 },
  { key: "reviews", label: "Reviews", icon: "star" },
  { key: "earnings", label: "Earnings", icon: "users" },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

const clients = [
  { name: "Ahmed K.", visa: "USA B1/B2", stage: "Documents", pct: 60, nationality: "🇵🇰 Pakistani", submitted: "Jun 10" },
  { name: "Maria L.", visa: "Schengen", stage: "Application Review", pct: 80, nationality: "🇵🇭 Filipino", submitted: "Jun 5" },
  { name: "Imran S.", visa: "UK Visitor", stage: "Submitted", pct: 100, nationality: "🇵🇰 Pakistani", submitted: "May 28" },
  { name: "Sara J.", visa: "Canada TRV", stage: "Documents", pct: 35, nationality: "🇮🇳 Indian", submitted: "Jun 12" },
  { name: "Omar F.", visa: "UAE Residence", stage: "Initial Review", pct: 20, nationality: "🇧🇩 Bangladeshi", submitted: "Jun 14" },
];

const leads = [
  { id: "L-501", title: "USA F-1 Student Visa", from: "Lahore, Pakistan", budget: "$120", time: "2h ago", urgent: true },
  { id: "L-500", title: "Canada Visitor Visa", from: "Dubai, UAE", budget: "$80", time: "5h ago", urgent: true },
  { id: "L-498", title: "Schengen Multiple Entry", from: "Karachi, Pakistan", budget: "$100", time: "1d ago", urgent: false },
];

const reviews = [
  { name: "Bilal A.", flag: "🇵🇰", text: "Extremely professional. Sana helped me prepare a very strong B1/B2 application. I got my visa on the first attempt!", rating: 5, date: "Jun 2026", visa: "USA B1/B2" },
  { name: "Nadia R.", flag: "🇵🇭", text: "Very thorough checklist and honest advice. She never promised what she couldn't deliver.", rating: 5, date: "May 2026", visa: "Schengen" },
  { name: "Hassan M.", flag: "🇵🇰", text: "Good communication, helped me with every document step by step.", rating: 4, date: "Apr 2026", visa: "UK Visitor" },
  { name: "Zara K.", flag: "🇮🇳", text: "Very knowledgeable about Canada TRV requirements. Highly recommend.", rating: 5, date: "Mar 2026", visa: "Canada TRV" },
];

const earningsData = [
  { month: "Jun 2026", clients: 3, revenue: "$480", status: "Current" },
  { month: "May 2026", clients: 5, revenue: "$720", status: "Paid" },
  { month: "Apr 2026", clients: 4, revenue: "$580", status: "Paid" },
  { month: "Mar 2026", clients: 6, revenue: "$840", status: "Paid" },
];

const services = [
  { name: "Document Review & Checklist", desc: "Full review of all required documents with feedback", price: "$40", popular: false },
  { name: "Full Application Preparation", desc: "End-to-end preparation: forms, docs, cover letter", price: "$120", popular: true },
  { name: "Interview Coaching Session", desc: "60-minute mock interview with visa officer simulation", price: "$60", popular: false },
  { name: "Rush Processing — 48h", desc: "Priority preparation for urgent applications", price: "$180", popular: false },
];

// ─── Authorization Form Generator ─────────────────────────────────────────────

function AuthorizationGenerator() {
  const [clientName, setClientName] = useState("[Client Full Name]");
  const [passportNo, setPassportNo] = useState("[Passport No.]");
  const [visaType, setVisaType] = useState("[Visa Type]");

  return (
    <div className="space-y-4">
      <Panel title="Generate Authorization Form" subtitle="Fill in client details — generate printable PDF">
        <div className="grid gap-4 sm:grid-cols-3 mb-5">
          <div>
            <label className="label">Client Full Name</label>
            <input className="input" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div>
            <label className="label">Passport Number</label>
            <input className="input" value={passportNo} onChange={(e) => setPassportNo(e.target.value)} />
          </div>
          <div>
            <label className="label">Visa Type</label>
            <input className="input" value={visaType} onChange={(e) => setVisaType(e.target.value)} placeholder="e.g., USA B1/B2" />
          </div>
        </div>

        {/* Form preview */}
        <div className="rounded-2xl border border-soft-200 bg-soft/50 p-6 text-sm leading-relaxed text-charcoal/80">
          <p className="text-center text-base font-extrabold uppercase tracking-wide text-navy">Authorization Form</p>
          <p className="mt-1 text-center text-xs text-charcoal/50">Globe Travel Voyage — Visa Preparation Services</p>

          <div className="mt-6 space-y-3">
            <p>
              I, <span className="font-bold text-navy">{clientName}</span>, holder of passport{" "}
              <span className="font-bold text-navy">{passportNo}</span>, hereby authorize{" "}
              <span className="font-bold text-navy">Sana Malik</span> (Visa Expert on Globe Travel Voyage) to assist me
              with the preparation of my <span className="font-bold text-navy">{visaType}</span> visa application.
            </p>
            <p>
              I confirm that all information and documents I provide are true, accurate and complete to the best of my
              knowledge. I understand that the agent provides preparation assistance only and does{" "}
              <strong>not</strong> guarantee visa approval, which rests solely with the relevant embassy or immigration
              authority.
            </p>
            <p>
              I authorize the agent to review, organize and advise on my documents for the purpose of this visa
              application only.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
              <div className="h-12 border-b-2 border-navy/30" />
              <p className="mt-2 text-xs text-charcoal/50">Client signature &amp; date</p>
            </div>
            <div>
              <div className="h-12 border-b-2 border-navy/30" />
              <p className="mt-2 text-xs text-charcoal/50">Agent (Sana Malik) signature &amp; date</p>
            </div>
          </div>

          <p className="mt-6 text-[10px] text-charcoal/40 text-center">
            Globe Travel Voyage is not an immigration authority, embassy, or law firm. This document is an internal
            preparation agreement only.
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          <button className="btn-primary px-5 py-2.5 text-sm">Download PDF</button>
          <button className="btn-outline px-5 py-2.5 text-sm">Copy text</button>
        </div>
      </Panel>

      <Disclaimer>
        This authorization form template is provided for preparation purposes only. It is not legal advice and does not
        constitute a power of attorney. Globe Travel Voyage is not a law firm or immigration advisor. Ensure compliance
        with local laws before use.
      </Disclaimer>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AgentDashboard() {
  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active clients" value="5" icon="users" hint="Across 5 visa types" color="blue" />
          <StatCard label="New leads" value="3" icon="agent" hint="This week" delta="+3" color="gold" />
          <StatCard label="Approval prep score" value="92%" icon="check" hint="Docs completeness avg" color="green" />
          <StatCard label="Rating" value="4.9 ★" icon="star" hint="312 total reviews" color="navy" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Application Pipeline" subtitle="Current client stages">
            {[
              { stage: "New leads", count: 3, color: "bg-gold" },
              { stage: "Document collection", count: 2, color: "bg-blue/70" },
              { stage: "Application review", count: 2, color: "bg-blue" },
              { stage: "Submitted / interview", count: 1, color: "bg-emerald-500" },
            ].map((p) => (
              <div key={p.stage} className="flex items-center gap-4 border-b border-soft-200 py-3 last:border-0">
                <div className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
                <span className="flex-1 text-sm text-charcoal/70">{p.stage}</span>
                <span className="chip font-bold">{p.count}</span>
              </div>
            ))}
          </Panel>

          <Panel title="Monthly Performance">
            <div className="space-y-4">
              <ProgressBar label="Client satisfaction score" pct={96} color="blue" />
              <ProgressBar label="Documents complete rate" pct={92} color="green" />
              <ProgressBar label="Lead response rate" pct={88} color="gold" />
              <ProgressBar label="Profile completeness" pct={75} color="blue" />
            </div>
          </Panel>
        </div>

        <Panel title="Recent Activity">
          <TableRow cells={["New lead received — USA F-1, Lahore", "2h ago"]} badge="New" badgeColor="blue" />
          <TableRow cells={["Ahmed K. uploaded bank statement", "4h ago"]} badge="Update" badgeColor="gold" />
          <TableRow cells={["Maria L. application submitted", "1d ago"]} badge="Done" badgeColor="green" />
          <TableRow cells={["New review from Bilal A. — 5★", "2d ago"]} badge="Review" />
        </Panel>
      </div>
    ),

    profile: (
      <Panel title="Public Visa Expert Profile" subtitle="This is how clients see you on the marketplace">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Display name</label>
            <input className="input" defaultValue="Sana Malik" />
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" defaultValue="Senior Visa Consultant" />
          </div>
          <div>
            <label className="label">Location / City</label>
            <input className="input" defaultValue="Dubai, UAE" />
          </div>
          <div>
            <label className="label">Years of experience</label>
            <input className="input" type="number" defaultValue="10" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Specialties (comma-separated)</label>
            <input className="input" defaultValue="USA B1/B2, UK Visitor, Schengen, Canada TRV" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Languages spoken</label>
            <input className="input" defaultValue="English, Urdu, Arabic" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">About (shown on public profile)</label>
            <textarea className="input min-h-28" defaultValue="10+ years helping travelers prepare strong, honest visa applications. Specialized in USA, UK, Schengen, and Canada. Every case is handled with care, accuracy, and full transparency." />
          </div>
          <div>
            <label className="label">WhatsApp (optional)</label>
            <input className="input" placeholder="+971 50 xxx xxxx" />
          </div>
          <div>
            <label className="label">Response time</label>
            <select className="input">
              <option>Within 1 hour</option>
              <option>Within 2 hours</option>
              <option>Within 24 hours</option>
            </select>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button className="btn-primary px-5 py-2.5">Save profile</button>
          <Link href="/agents" className="btn-outline px-5 py-2.5 text-sm">View public profile</Link>
        </div>
      </Panel>
    ),

    services: (
      <div className="space-y-4">
        {services.map((s) => (
          <div key={s.name} className="card flex items-center justify-between p-5">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-navy">{s.name}</p>
                {s.popular && <span className="chip bg-gold/15 text-navy text-xs">Most popular</span>}
              </div>
              <p className="mt-0.5 text-sm text-charcoal/55">{s.desc}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-extrabold text-navy">{s.price}</span>
              <button className="btn-outline px-3 py-1.5 text-xs">Edit</button>
            </div>
          </div>
        ))}
        <button className="btn-outline px-5 py-2.5 text-sm">+ Add new service</button>
        <Disclaimer variant="inline" />
      </div>
    ),

    clients: (
      <div className="space-y-4">
        {clients.map((c) => (
          <Panel
            key={c.name}
            title={`${c.name} · ${c.visa}`}
            subtitle={`${c.nationality} · Submitted ${c.submitted}`}
            action={
              <span className={`chip ${c.pct === 100 ? "bg-emerald-50 text-emerald-700" : "bg-blue/10 text-blue"}`}>
                {c.pct === 100 ? "Submitted" : "Active"}
              </span>
            }
          >
            <ProgressBar label={c.stage} pct={c.pct} color={c.pct === 100 ? "green" : "blue"} />
            <div className="mt-4 flex gap-2">
              <button className="btn-primary px-4 py-2 text-sm">View docs</button>
              <button className="btn-outline px-4 py-2 text-sm">Message client</button>
              {c.pct < 100 && <button className="btn-outline px-4 py-2 text-sm">Send checklist</button>}
            </div>
          </Panel>
        ))}
      </div>
    ),

    authorization: <AuthorizationGenerator />,

    leads: (
      <div className="space-y-4">
        <Panel title="New Leads" subtitle="Respond within 1 hour to rank higher in search" noPad>
          <div className="divide-y divide-soft-200">
            {leads.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-5">
                <div className="flex items-start gap-3">
                  {l.urgent && (
                    <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-gold" />
                  )}
                  <div>
                    <p className="font-bold text-navy">{l.title}</p>
                    <p className="text-sm text-charcoal/55">{l.from} · Budget: {l.budget} · {l.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary px-4 py-2 text-sm">Respond</button>
                  <button className="btn-outline px-3 py-2 text-sm">Decline</button>
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
          <StatCard label="Overall rating" value="4.9 ★" icon="star" hint="312 reviews" color="gold" />
          <StatCard label="5-star reviews" value="287" icon="star" hint="91%" color="green" />
          <StatCard label="Response rate" value="98%" icon="check" hint="Avg response 45min" color="blue" />
        </div>
        {reviews.map((r) => (
          <div key={r.name} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white font-bold text-sm">
                  {r.flag}
                </span>
                <div>
                  <p className="font-bold text-navy">{r.name}</p>
                  <p className="text-xs text-charcoal/50">{r.visa} · {r.date}</p>
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
          <StatCard label="Total earned" value="$2,620" icon="users" hint="Lifetime" color="gold" />
          <StatCard label="This month" value="$480" icon="star" delta="+12%" color="green" />
          <StatCard label="Pending payout" value="$120" icon="doc" hint="Processes Friday" color="blue" />
        </div>

        <Panel title="Monthly Earnings" subtitle="Revenue from all client services">
          {earningsData.map((row) => (
            <TableRow
              key={row.month}
              cells={[row.month, `${row.clients} clients`]}
              badge={row.status}
              badgeColor={row.status === "Current" ? "blue" : "green"}
              action={<span className="font-bold text-navy text-sm">{row.revenue}</span>}
            />
          ))}
        </Panel>

        <Panel title="Payout Settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Bank account (IBAN)</label>
              <input className="input" placeholder="AE xx xxxx xxxx xxxx xxxx x" />
            </div>
            <div>
              <label className="label">Payout schedule</label>
              <select className="input">
                <option>Weekly (every Friday)</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
          <button className="btn-primary mt-4 px-5 py-2.5 text-sm">Save payout info</button>
        </Panel>
      </div>
    ),
  };

  return (
    <DashboardLayout
      role="Visa Expert"
      name="Sana Malik"
      initials="SM"
      tabs={tabs}
      sections={sections}
      verified
      roleColor="bg-gold/15 text-navy"
      avatarColor="bg-gold text-navy"
    />
  );
}
