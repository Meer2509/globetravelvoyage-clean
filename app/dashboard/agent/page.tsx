"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/auth";
import { fetchAgentIntakeQueue, fetchAgencyLeads } from "@/lib/supabase/queries";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { DashboardProfileSection } from "@/components/DashboardProfileSection";
import { DatabaseSetupBanner } from "@/components/DatabaseSetupBanner";
import { DashboardEmpty } from "@/components/DashboardEmpty";
import { joinCommaList } from "@/lib/supabase/profile-utils";
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

function statusToPct(status: string): number {
  const map: Record<string, number> = {
    pending: 25,
    reviewing: 55,
    submitted: 85,
    approved: 100,
    rejected: 100,
  };
  return map[status] ?? 30;
}

function formatRelativeDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const baseTabs: DashboardTab[] = [
  { key: "overview", label: "Overview", icon: "globe" },
  { key: "profile", label: "My Profile", icon: "agent" },
  { key: "services", label: "Services & Pricing", icon: "visa" },
  { key: "clients", label: "Client Applications", icon: "doc" },
  { key: "authorization", label: "Authorization Form", icon: "doc" },
  { key: "leads", label: "Leads Inbox", icon: "users" },
  { key: "reviews", label: "Reviews", icon: "star" },
  { key: "earnings", label: "Earnings", icon: "users" },
];

const services = [
  { name: "Document Review & Checklist", desc: "Full review of all required documents with feedback", price: "$40", popular: false },
  { name: "Full Application Preparation", desc: "End-to-end preparation: forms, docs, cover letter", price: "$120", popular: true },
  { name: "Interview Coaching Session", desc: "60-minute mock interview with visa officer simulation", price: "$60", popular: false },
  { name: "Rush Processing — 48h", desc: "Priority preparation for urgent applications", price: "$180", popular: false },
];

// ─── Authorization Form Generator ─────────────────────────────────────────────

function AuthorizationGenerator({ expertName }: { expertName: string }) {
  const [clientName, setClientName] = useState("[Client Full Name]");
  const [passportNo, setPassportNo] = useState("[Passport No.]");
  const [visaType, setVisaType] = useState("[Visa Type]");
  const agentName = expertName || "Visa Expert";

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
              <span className="font-bold text-navy">{agentName}</span> (Visa Expert on Globe Travel Voyage) to assist me
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
              <p className="mt-2 text-xs text-charcoal/50">Agent ({agentName}) signature &amp; date</p>
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

type IntakeClient = {
  id: string;
  name: string;
  visa: string;
  stage: string;
  pct: number;
  nationality: string;
  submitted: string;
};

type IntakeLead = {
  id: string;
  title: string;
  from: string;
  message: string;
  time: string;
  status: string;
};

export default function AgentDashboard() {
  const user = useDashboardUser();
  const [clients, setClients] = useState<IntakeClient[]>([]);
  const [leads, setLeads] = useState<IntakeLead[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    Promise.all([fetchAgentIntakeQueue(), fetchAgencyLeads()]).then(([visaRows, leadRows]) => {
      setClients(
        visaRows.map((r) => ({
          id: r.id,
          name: r.full_name,
          visa: r.destination,
          stage: r.status,
          pct: statusToPct(r.status),
          nationality: r.nationality ?? "—",
          submitted: formatRelativeDate(r.created_at),
        }))
      );
      setLeads(
        leadRows.map((l) => ({
          id: l.id,
          title: l.message?.slice(0, 80) || l.lead_type || "Lead request",
          from: l.full_name,
          message: l.message ?? "",
          time: formatRelativeDate(l.created_at),
          status: l.status,
        }))
      );
      setDataLoaded(true);
    });
  }, []);

  const tabs = baseTabs.map((t) => {
    if (t.key === "clients" && clients.length > 0) return { ...t, badge: clients.length };
    if (t.key === "leads" && leads.length > 0) return { ...t, badge: leads.length };
    return t;
  });

  const expertRating = user.result?.ok ? user.result.visaExpert?.rating : null;
  const reviewCount = user.result?.ok ? user.result.visaExpert?.review_count : null;

  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        {user.setupMessage && <DatabaseSetupBanner message={user.setupMessage} />}
        <DashboardProfileSection user={user} />
        {dataLoaded && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✓ Supabase live — {clients.length} visa requests · {leads.length} leads in intake.
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active clients" value={String(clients.length)} icon="users" hint="Live intake queue" color="blue" />
          <StatCard label="New leads" value={String(leads.length)} icon="agent" hint="Contact expert requests" color="gold" />
          <StatCard label="Profile complete" value={`${user.completion}%`} icon="check" hint="Your expert profile" color="green" />
          <StatCard label="Rating" value={expertRating ? `${expertRating} ★` : "—"} icon="star" hint={reviewCount ? `${reviewCount} reviews` : "No reviews yet"} color="navy" />
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
              <ProgressBar label="Profile completeness" pct={user.completion} color="blue" />
            </div>
          </Panel>
        </div>

        <Panel title="Recent intake" subtitle="Latest visa requests from Supabase">
          {clients.length === 0 ? (
            <p className="text-sm text-charcoal/50 py-4">No visa requests in the queue yet.</p>
          ) : (
            clients.slice(0, 4).map((c) => (
              <TableRow
                key={c.id}
                cells={[`${c.name} — ${c.visa}`, c.submitted]}
                badge={c.stage}
                badgeColor={c.pct >= 85 ? "green" : "blue"}
              />
            ))
          )}
        </Panel>
      </div>
    ),

    profile: (
      <Panel title="Your visa expert profile" subtitle="Live data from your Supabase account">
        {user.result?.ok ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <p><span className="text-charcoal/50">Name:</span> <strong className="text-navy">{user.result.profile.full_name ?? "—"}</strong></p>
              <p><span className="text-charcoal/50">Email:</span> <strong className="text-navy">{user.result.profile.email}</strong></p>
              <p><span className="text-charcoal/50">Location:</span> <strong className="text-navy">{[user.result.profile.city, user.result.profile.country].filter(Boolean).join(", ") || "—"}</strong></p>
              <p><span className="text-charcoal/50">Experience:</span> <strong className="text-navy">{user.result.visaExpert?.years_experience ?? "—"} years</strong></p>
              <p className="sm:col-span-2"><span className="text-charcoal/50">Specializations:</span> <strong className="text-navy">{joinCommaList(user.result.visaExpert?.specializations) || "—"}</strong></p>
              <p className="sm:col-span-2"><span className="text-charcoal/50">Languages:</span> <strong className="text-navy">{joinCommaList(user.result.visaExpert?.languages) || "—"}</strong></p>
              <p className="sm:col-span-2"><span className="text-charcoal/50">Services:</span> <strong className="text-navy">{joinCommaList(user.result.visaExpert?.services) || "—"}</strong></p>
            </div>
            <div className="mt-5 flex gap-3">
              <Link href="/dashboard/profile" className="btn-primary px-5 py-2.5 text-sm">Edit profile</Link>
              <Link href="/agents" className="btn-outline px-5 py-2.5 text-sm">View public marketplace</Link>
            </div>
          </>
        ) : (
          <p className="text-sm text-charcoal/55">Sign in with Supabase to manage your expert profile.</p>
        )}
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
        {clients.length === 0 && (
          <DashboardEmpty
            title="No client applications yet"
            message="Visa requests from travelers will appear here when submitted through the platform."
            action={<Link href="/visa/start" className="btn-primary px-5 py-2.5 text-sm inline-block">View visa intake form</Link>}
          />
        )}
        {clients.map((c) => (
          <Panel
            key={c.id}
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

    authorization: <AuthorizationGenerator expertName={user.displayName} />,

    leads: (
      <div className="space-y-4">
        {leads.length === 0 ? (
          <DashboardEmpty
            title="No leads yet"
            message="When travelers contact an expert, their requests will appear here from Supabase."
            action={<Link href="/lead/contact" className="btn-outline px-5 py-2.5 text-sm inline-block">View contact form</Link>}
          />
        ) : (
          <Panel title="New Leads" subtitle="Live from lead_requests table" noPad>
            <div className="divide-y divide-soft-200">
              {leads.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-gold" />
                    <div>
                      <p className="font-bold text-navy">{l.title}</p>
                      <p className="text-sm text-charcoal/55">{l.from} · {l.time} · {l.status}</p>
                      {l.message && <p className="mt-1 text-xs text-charcoal/45 line-clamp-2">{l.message}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary px-4 py-2 text-sm">Respond</button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    ),

    reviews: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Overall rating" value={expertRating ? `${expertRating} ★` : "—"} icon="star" hint={reviewCount ? `${reviewCount} reviews` : "No reviews"} color="gold" />
          <StatCard label="Verification" value={user.verified ? "Verified" : "Pending"} icon="check" color="green" />
          <StatCard label="Profile" value={`${user.completion}%`} icon="agent" hint="Completion" color="blue" />
        </div>
        <DashboardEmpty
          title="No client reviews yet"
          message="Reviews from your clients will appear here once the reviews system has entries for your expert profile."
        />
      </div>
    ),

    earnings: (
      <div className="space-y-5">
        <DashboardEmpty
          title="Earnings tracking coming soon"
          message="Payment and payout data will appear here when connected to your Supabase payments table."
        />

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
      role={user.roleLabel}
      name={user.displayName}
      initials={user.initials}
      email={user.email}
      profileCompletion={user.completion}
      tabs={tabs}
      sections={sections}
      verified={user.verified}
      roleColor="bg-gold/15 text-navy"
      avatarColor="bg-gold text-navy"
    />
  );
}
