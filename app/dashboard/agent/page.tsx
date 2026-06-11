"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/auth";
import {
  fetchAgentDashboardData,
  type AgentApplicationRow,
  type AgentLeadRow,
  type AgentReviewRow,
  type AgentPaymentRow,
} from "@/lib/supabase/agent-data";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { DashboardProfileSection } from "@/components/DashboardProfileSection";
import { DatabaseStatusBanner } from "@/components/DatabaseStatusBanner";
import { DashboardEmpty } from "@/components/DashboardEmpty";
import { ExpertServicesPanel } from "@/components/ExpertServicesPanel";
import { joinCommaList } from "@/lib/supabase/profile-utils";
import { parseExpertServices } from "@/lib/expert-services";
import {
  buildAuthorizationText,
  copyAuthorizationText,
  printAuthorizationPdf,
} from "@/lib/authorization-form";
import { Disclaimer } from "@/components/Disclaimer";
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
    draft: 15,
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

function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
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

function AuthorizationGenerator({ expertName }: { expertName: string }) {
  const [clientName, setClientName] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [visaType, setVisaType] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const input = {
    clientName,
    passportNo,
    visaType,
    expertName: expertName || "Visa Expert",
  };

  const previewText = buildAuthorizationText(input);

  async function handleCopy() {
    setError("");
    setSuccess("");
    setCopying(true);
    try {
      await copyAuthorizationText(input);
      setSuccess("Authorization text copied to clipboard.");
    } catch {
      setError("Could not copy text. Check browser clipboard permissions.");
    } finally {
      setCopying(false);
    }
  }

  function handleDownload() {
    setError("");
    setSuccess("");
    setDownloading(true);
    try {
      printAuthorizationPdf(input);
      setSuccess("Print dialog opened — choose Save as PDF to download.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open print dialog.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Panel title="Generate Authorization Form" subtitle="Fill in client details — preview, copy, or print to PDF">
        <div className="grid gap-4 sm:grid-cols-3 mb-5">
          <div>
            <label className="label">Client Full Name</label>
            <input className="input" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" />
          </div>
          <div>
            <label className="label">Passport Number</label>
            <input className="input" value={passportNo} onChange={(e) => setPassportNo(e.target.value)} placeholder="Passport number" />
          </div>
          <div>
            <label className="label">Visa Type</label>
            <input className="input" value={visaType} onChange={(e) => setVisaType(e.target.value)} placeholder="e.g., USA B1/B2" />
          </div>
        </div>

        <div className="rounded-2xl border border-soft-200 bg-soft/50 p-6 text-sm leading-relaxed text-charcoal/80 whitespace-pre-wrap">
          {previewText}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✓ {success}
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownload}
            className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60"
          >
            {downloading ? "Opening…" : "Download PDF"}
          </button>
          <button
            type="button"
            disabled={copying}
            onClick={handleCopy}
            className="btn-outline px-5 py-2.5 text-sm disabled:opacity-60"
          >
            {copying ? "Copying…" : "Copy text"}
          </button>
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

export default function AgentDashboard() {
  const user = useDashboardUser();
  const [applications, setApplications] = useState<AgentApplicationRow[]>([]);
  const [leads, setLeads] = useState<AgentLeadRow[]>([]);
  const [reviews, setReviews] = useState<AgentReviewRow[]>([]);
  const [payments, setPayments] = useState<AgentPaymentRow[]>([]);
  const [services, setServices] = useState(() =>
    user.result?.ok ? parseExpertServices(user.result.visaExpert?.services) : []
  );
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  function loadAgentData() {
    if (!isSupabaseConfigured) {
      setDataLoaded(true);
      return;
    }
    fetchAgentDashboardData().then((result) => {
      setDataLoaded(true);
      if (!result.ok) {
        if (!result.tableMissing) setDataError(result.error);
        return;
      }
      setDataError(null);
      setApplications(result.data.applications);
      setLeads(result.data.leads);
      setReviews(result.data.reviews);
      setPayments(result.data.payments);
      setServices(result.data.services);
      setTotalEarnings(result.data.totalEarnings);
    });
  }

  useEffect(() => {
    loadAgentData();
  }, [user.result?.ok ? user.result.profile.updated_at : "", user.completion]);

  const pipeline = useMemo(() => {
    const stages: Record<string, number> = {};
    for (const app of applications) {
      stages[app.status] = (stages[app.status] ?? 0) + 1;
    }
    return Object.entries(stages).map(([stage, count]) => ({ stage, count }));
  }, [applications]);

  const avgReviewRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const expertRating = reviews.length > 0
    ? avgReviewRating
    : user.result?.ok && user.result.visaExpert?.rating
      ? String(user.result.visaExpert.rating)
      : null;
  const reviewCount = reviews.length > 0
    ? reviews.length
    : user.result?.ok
      ? user.result.visaExpert?.review_count ?? 0
      : 0;

  const tabs = baseTabs.map((t) => {
    if (t.key === "clients" && applications.length > 0) return { ...t, badge: applications.length };
    if (t.key === "leads" && leads.length > 0) return { ...t, badge: leads.length };
    if (t.key === "reviews" && reviews.length > 0) return { ...t, badge: reviews.length };
    return t;
  });

  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <DatabaseStatusBanner health={user.databaseHealth} />
        {dataError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dataError}
          </div>
        )}
        <DashboardProfileSection user={user} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Client applications" value={String(applications.length)} icon="users" hint="Assigned to you" color="blue" />
          <StatCard label="New leads" value={String(leads.length)} icon="agent" hint="Lead requests" color="gold" />
          <StatCard label="Profile complete" value={`${user.completion}%`} icon="check" hint="Your expert profile" color="green" />
          <StatCard
            label="Rating"
            value={expertRating ? `${expertRating} ★` : "—"}
            icon="star"
            hint={reviewCount > 0 ? `${reviewCount} reviews` : "No reviews yet"}
            color="navy"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Application Pipeline" subtitle="Real status counts from your assigned applications">
            {pipeline.length === 0 ? (
              <p className="text-sm text-charcoal/50 py-4">No applications assigned yet.</p>
            ) : (
              pipeline.map((p) => (
                <div key={p.stage} className="flex items-center gap-4 border-b border-soft-200 py-3 last:border-0">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue" />
                  <span className="flex-1 text-sm capitalize text-charcoal/70">{p.stage.replace(/_/g, " ")}</span>
                  <span className="chip font-bold">{p.count}</span>
                </div>
              ))
            )}
          </Panel>

          <Panel title="Profile & activity">
            <div className="space-y-4">
              <ProgressBar label="Profile completeness" pct={user.completion} color="blue" />
              <ProgressBar
                label="Services listed"
                pct={services.length > 0 ? 100 : 0}
                color="gold"
              />
              <ProgressBar
                label="Reviews received"
                pct={reviews.length > 0 ? Math.min(100, reviews.length * 20) : 0}
                color="green"
              />
            </div>
          </Panel>
        </div>

        <Panel title="Recent applications" subtitle="Latest visa applications assigned to you">
          {applications.length === 0 ? (
            <p className="text-sm text-charcoal/50 py-4">No client applications yet.</p>
          ) : (
            applications.slice(0, 4).map((c) => (
              <TableRow
                key={c.id}
                cells={[
                  `${c.applicant_name ?? "Applicant"} — ${c.visa_type}`,
                  formatRelativeDate(c.created_at),
                ]}
                badge={c.status}
                badgeColor={statusToPct(c.status) >= 85 ? "green" : "blue"}
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
              <p className="sm:col-span-2"><span className="text-charcoal/50">Services:</span> <strong className="text-navy">{services.length > 0 ? `${services.length} service(s) listed` : "—"}</strong></p>
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
      <ExpertServicesPanel
        initialServices={services}
        onSaved={(next) => {
          setServices(next);
          user.refresh();
          loadAgentData();
        }}
      />
    ),

    clients: (
      <div className="space-y-4">
        {!dataLoaded ? (
          <p className="text-sm text-charcoal/50">Loading applications…</p>
        ) : applications.length === 0 ? (
          <DashboardEmpty
            title="No client applications yet"
            message="Visa applications assigned to your expert profile will appear here."
          />
        ) : (
          applications.map((c) => (
            <Panel
              key={c.id}
              title={`${c.applicant_name ?? "Applicant"} · ${c.visa_type}`}
              subtitle={`${c.origin_country} → ${c.destination_country} · ${formatRelativeDate(c.created_at)}`}
              action={
                <span className={`chip ${statusToPct(c.status) >= 85 ? "bg-emerald-50 text-emerald-700" : "bg-blue/10 text-blue"}`}>
                  {c.status}
                </span>
              }
            >
              <ProgressBar label={c.status.replace(/_/g, " ")} pct={statusToPct(c.status)} color={statusToPct(c.status) >= 85 ? "green" : "blue"} />
              {c.notes && <p className="mt-3 text-sm text-charcoal/60">{c.notes}</p>}
            </Panel>
          ))
        )}
      </div>
    ),

    authorization: <AuthorizationGenerator expertName={user.displayName} />,

    leads: (
      <div className="space-y-4">
        {!dataLoaded ? (
          <p className="text-sm text-charcoal/50">Loading leads…</p>
        ) : leads.length === 0 ? (
          <DashboardEmpty
            title="No leads yet"
            message="When travelers contact a visa expert, their requests will appear here."
            action={<Link href="/lead/contact" className="btn-outline px-5 py-2.5 text-sm inline-block">View contact form</Link>}
          />
        ) : (
          <Panel title="Leads Inbox" subtitle="Live from lead_requests" noPad>
            <div className="divide-y divide-soft-200">
              {leads.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-gold" />
                    <div>
                      <p className="font-bold text-navy">{l.full_name}</p>
                      <p className="text-sm text-charcoal/55">{l.email} · {formatRelativeDate(l.created_at)} · {l.status}</p>
                      {l.message && <p className="mt-1 text-xs text-charcoal/45 line-clamp-2">{l.message}</p>}
                    </div>
                  </div>
                  <a href={`mailto:${l.email}`} className="btn-primary px-4 py-2 text-sm">
                    Respond
                  </a>
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
          <StatCard
            label="Overall rating"
            value={expertRating ? `${expertRating} ★` : "—"}
            icon="star"
            hint={reviewCount > 0 ? `${reviewCount} reviews` : "No reviews yet"}
            color="gold"
          />
          <StatCard label="Verification" value={user.verified ? "Verified" : "Pending"} icon="check" color="green" />
          <StatCard label="Profile" value={`${user.completion}%`} icon="agent" hint="Completion" color="blue" />
        </div>
        {!dataLoaded ? (
          <p className="text-sm text-charcoal/50">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <DashboardEmpty
            title="No reviews yet"
            message="Client reviews will appear here once submitted for your expert profile."
          />
        ) : (
          <Panel title="Client reviews" subtitle="Live from Supabase reviews table">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-soft-200 py-4 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-navy">{r.reviewer_name ?? "Client"}</p>
                  <span className="chip bg-gold/15 text-navy">{r.rating} ★</span>
                </div>
                {r.title && <p className="mt-1 text-sm font-semibold text-charcoal/75">{r.title}</p>}
                {r.body && <p className="mt-1 text-sm text-charcoal/60">{r.body}</p>}
                <p className="mt-1 text-xs text-charcoal/45">{formatRelativeDate(r.created_at)}</p>
              </div>
            ))}
          </Panel>
        )}
      </div>
    ),

    earnings: (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Total earnings"
            value={formatMoney(totalEarnings)}
            icon="star"
            hint={payments.length > 0 ? `${payments.length} payment(s)` : "No payments yet"}
            color="gold"
          />
          <StatCard label="Pending" value={formatMoney(0)} icon="doc" hint="Awaiting settlement" color="blue" />
        </div>
        {!dataLoaded ? (
          <p className="text-sm text-charcoal/50">Loading earnings…</p>
        ) : payments.length === 0 ? (
          <DashboardEmpty
            title="No earnings yet"
            message="Payments will appear here when recorded in your Supabase payments table. Total shows $0 until then."
          />
        ) : (
          <Panel title="Payment history" subtitle="Live from Supabase payments">
            {payments.map((p) => (
              <TableRow
                key={p.id}
                cells={[
                  p.description ?? "Payment",
                  formatRelativeDate(p.created_at),
                  formatMoney(Number(p.amount), p.currency ?? "USD"),
                ]}
                badge={p.status}
                badgeColor={p.status === "paid" || p.status === "settled" ? "green" : "blue"}
              />
            ))}
          </Panel>
        )}
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
