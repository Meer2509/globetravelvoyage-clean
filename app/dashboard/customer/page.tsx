"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/auth";
import {
  fetchCustomerDashboard,
  type CustomerDashboardData,
} from "@/lib/supabase/queries";
import {
  fetchCustomerPaymentsExtended,
  fetchCustomerStripeBookings,
  fetchCustomerActiveServices,
  type PaymentRowExtended,
  type StripeBookingRow,
  type VisaCaseData,
  type ActiveServiceRow,
} from "@/lib/supabase/payment-queries";
import { fetchCustomerVisaCases } from "@/lib/supabase/visa-case-queries";
import { VisaCasePanel } from "@/components/VisaCasePanel";
import { CustomerActiveServices } from "@/components/CustomerActiveServices";
import { VisaCaseSummaryCard } from "@/components/VisaCaseSummaryCard";
import { formatPaymentAmount, formatPaymentDate, paymentServiceLabel } from "@/lib/payments-display";
import { fetchCustomerLeadRequests, fetchCustomerBookingRequests } from "@/lib/supabase/mvp-queries";
import { submitSupportTicket } from "@/lib/supabase/actions";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { DashboardProfileSection } from "@/components/DashboardProfileSection";
import { CustomerDashboardHero } from "@/components/CustomerDashboardHero";
import { DashboardEmpty } from "@/components/DashboardEmpty";
import { visaCaseWorkspacePath } from "@/lib/visa-case-routes";
import { MessagesInbox } from "@/components/MessagesInbox";
import { Disclaimer } from "@/components/Disclaimer";
import { Stars } from "@/components/Stars";
import { Icon } from "@/components/Icon";
import {
  DashboardLayout,
  StatCard,
  Panel,
  TableRow,
  ProgressBar,
  TimelineItem,
  EmptyState,
  type DashboardTab,
} from "@/components/DashboardLayout";

const tabs: DashboardTab[] = [
  { key: "overview", label: "Overview", icon: "globe" },
  { key: "visa-case", label: "My Visa Cases", icon: "visa" },
  { key: "timeline", label: "Trip Timeline", icon: "planner" },
  { key: "visas", label: "Visa Applications", icon: "visa" },
  { key: "saved", label: "Saved Trips", icon: "star" },
  { key: "bookings", label: "Bookings", icon: "doc" },
  { key: "billing", label: "Billing & Payments", icon: "star" },
  { key: "documents", label: "Documents", icon: "doc" },
  { key: "referrals", label: "Referrals", icon: "users" },
  { key: "support", label: "Support", icon: "shield" },
  { key: "messages", label: "Messages", icon: "agent" },
  { key: "ai", label: "AI Assistant", icon: "agent" },
];

// ─── AI Chat State ─────────────────────────────────────────────────────────

function AiPanel() {
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "Hi! I'm your AI travel assistant. Ask about visa steps, trip planning, or booking requests on your account." },
  ]);
  const [input, setInput] = useState("");

  const mockResponses: Record<string, string> = {
    visa: "Check your Visa Applications or My Visa Case tab for the latest status on your requests.",
    flight: "Submit a booking request for flight quotes — we connect you with verified travel providers.",
    hotel: "Browse hotels and stays on our marketplace, then request a quote for personalized help.",
    document: "Upload visa documents in your Documents tab. Your files are stored securely on your account.",
    budget: "Use the AI Trip Planner for itinerary ideas and budget guidance.",
    default: "I provide informational travel guidance. Check your dashboard for requests, payments, and messages.",
  };

  const getResponse = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes("visa")) return mockResponses.visa;
    if (lower.includes("flight")) return mockResponses.flight;
    if (lower.includes("hotel")) return mockResponses.hotel;
    if (lower.includes("document")) return mockResponses.document;
    if (lower.includes("budget") || lower.includes("cost")) return mockResponses.budget;
    return mockResponses.default;
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg: { role: "user"; text: string } = { role: "user", text: input };
    setMessages((m) => [...m, userMsg, { role: "ai" as const, text: getResponse(input) }]);
    setInput("");
  };

  return (
    <Panel title="AI Travel Assistant" subtitle="Your personal travel guide">
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === "ai" ? "bg-soft text-navy" : "bg-navy text-white"}`}>
              {m.role === "ai" && (
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-blue">
                  Globe AI
                </span>
              )}
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1 text-sm"
          placeholder="Ask about visa, flights, documents, budget..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send} className="btn-primary px-4 py-2.5 text-sm">Send</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Check my visa status", "What documents do I need?", "Trip budget breakdown"].map((p) => (
          <button
            key={p}
            onClick={() => setInput(p)}
            className="rounded-full border border-soft-200 px-3 py-1 text-xs text-charcoal/60 hover:border-blue hover:text-blue transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
    </Panel>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

function CustomerDashboardContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? undefined;
  const user = useDashboardUser();
  const [live, setLive] = useState<CustomerDashboardData | null>(null);
  const [customerPayments, setCustomerPayments] = useState<PaymentRowExtended[]>([]);
  const [stripeBookings, setStripeBookings] = useState<StripeBookingRow[]>([]);
  const [visaCase, setVisaCase] = useState<VisaCaseData | null>(null);
  const [visaCases, setVisaCases] = useState<VisaCaseData[]>([]);
  const [activeServices, setActiveServices] = useState<ActiveServiceRow[]>([]);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportBody, setSupportBody] = useState("");
  const [supportSending, setSupportSending] = useState(false);
  const [supportMsg, setSupportMsg] = useState("");

  function reloadPostPayment() {
    fetchCustomerPaymentsExtended().then(setCustomerPayments);
    fetchCustomerStripeBookings().then(setStripeBookings);
    fetchCustomerVisaCases().then((cases) => {
      setVisaCases(cases);
      setVisaCase(cases[0] ?? null);
    });
    fetchCustomerActiveServices().then(setActiveServices);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchCustomerDashboard().then((data) => {
      if (data) setLive(data);
    });
    reloadPostPayment();
  }, []);

  async function handleSupportSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSupportSending(true);
    setSupportMsg("");
    const result = await submitSupportTicket({
      subject: supportSubject,
      message: supportBody,
      email: user.email,
      name: user.displayName,
    });
    setSupportSending(false);
    if (!result.ok) {
      setSupportMsg(result.error);
      return;
    }
    setSupportMsg("Support ticket submitted.");
    setSupportSubject("");
    setSupportBody("");
    fetchCustomerDashboard().then((data) => { if (data) setLive(data); });
  }

  const paidTotal = customerPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const visaCount = live?.visaRequests.length ?? 0;
  const bookingCount = live?.bookingRequests.length ?? 0;
  const supportCount = live?.supportTickets.length ?? 0;

  const firstName =
    user.displayName !== "Your Account"
      ? user.displayName.split(/\s+/)[0]
      : "Traveler";

  const customerTabs = tabs.map((t) => {
    if (t.key === "billing" && customerPayments.length > 0) return { ...t, badge: customerPayments.length };
    if (t.key === "visa-case" && visaCases.length > 0) return { ...t, badge: visaCases.length };
    if (t.key === "visas" && visaCount > 0) return { ...t, badge: visaCount };
    if (t.key === "bookings" && bookingCount > 0) return { ...t, badge: bookingCount };
    if (t.key === "support" && supportCount > 0) return { ...t, badge: supportCount };
    return t;
  });

  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <CustomerDashboardHero firstName={firstName} />
        <CustomerActiveServices services={activeServices} visaCase={visaCase} />

        {visaCase && (
          <Panel title="Required documents" subtitle="Your visa case checklist">
            <p className="text-sm text-muted mb-4">
              {visaCase.checklist.filter((d) => d.required !== false).length} required items ·{" "}
              {visaCase.checklist.filter((d) => ["uploaded", "prepared", "reviewed"].includes(d.status)).length} ready
            </p>
            <Link href={visaCaseWorkspacePath(visaCase.id, "documents")} className="btn-gold px-5 py-2.5 text-sm">
              Open document checklist
            </Link>
          </Panel>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Panel title="Payment history" subtitle="Recent transactions">
            {customerPayments.length === 0 ? (
              <p className="text-sm text-muted py-2">No payments yet.</p>
            ) : (
              <div className="space-y-2">
                {customerPayments.slice(0, 3).map((p) => (
                  <div key={p.id} className="text-sm flex justify-between gap-2">
                    <span className="text-navy font-medium truncate">
                      {paymentServiceLabel(p.service_type, p.description)}
                    </span>
                    <span className="text-muted shrink-0">{formatPaymentAmount(Number(p.amount), p.currency)}</span>
                  </div>
                ))}
              </div>
            )}
            <Link href="/dashboard/customer?tab=billing" className="mt-3 inline-block text-xs font-semibold text-blue hover:underline">
              View all payments →
            </Link>
          </Panel>
          <Panel title="Support & messages" subtitle="Get help with your case">
            <p className="text-sm text-muted mb-3">Questions about documents, payments, or your visa case.</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/customer?tab=support" className="btn-outline px-4 py-2 text-sm">
                Support
              </Link>
              <Link href="/dashboard/customer?tab=messages" className="btn-outline px-4 py-2 text-sm">
                Messages
              </Link>
            </div>
          </Panel>
        </div>
        <DashboardProfileSection user={user} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Visa requests" value={String(visaCount)} icon="visa" hint="Your submissions" color="gold" />
          <StatCard label="Booking requests" value={String(bookingCount)} icon="doc" hint="Your bookings" color="navy" />
          <StatCard label="Support tickets" value={String(supportCount)} icon="shield" hint="Your messages" color="blue" />
          <StatCard label="Profile" value={`${user.completion}%`} icon="users" hint="Complete your profile" color="green" />
        </div>

        <Panel title="Your recent requests" subtitle="Latest activity on your account">
          {visaCount === 0 && bookingCount === 0 ? (
            <p className="text-sm text-charcoal/50 py-4">No requests yet. Start a visa application or booking request to see them here.</p>
          ) : (
            <div className="space-y-2">
              {live?.visaRequests.slice(0, 3).map((v) => (
                <div key={v.id} className="rounded-xl bg-soft p-3 text-sm">
                  <span className="font-semibold text-navy">{v.destination}</span>
                  <span className="text-charcoal/50"> · {v.status}</span>
                </div>
              ))}
              {live?.bookingRequests.slice(0, 3).map((b) => (
                <div key={b.id} className="rounded-xl bg-soft p-3 text-sm">
                  <span className="font-semibold text-navy">{b.service_name ?? b.service_type}</span>
                  <span className="text-charcoal/50"> · {b.status}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <AiPanel />
      </div>
    ),

    "visa-case": <VisaCasePanel visaCases={visaCases} onRefresh={reloadPostPayment} />,

    timeline: (
      <DashboardEmpty
        title="No trip timeline yet"
        message="Build an AI trip plan or submit booking requests — milestones will appear here as your journey progresses."
        action={<Link href="/ai-trip-planner" className="btn-primary px-5 py-2.5 text-sm">Plan a trip</Link>}
      />
    ),

    visas: (
      <div className="space-y-5">
        <Disclaimer>
          Globe Travel Voyage assists with preparation only. Visa decisions are made solely by the relevant embassy or government authority. No approval is guaranteed.
        </Disclaimer>
        {live?.visaRequests.map((v) => (
          <Panel key={v.id} title={v.destination} subtitle={`Submitted ${new Date(v.created_at).toLocaleDateString()}`}>
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Purpose</p>
                <p className="font-semibold text-navy">{v.purpose ?? "—"}</p>
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Status</p>
                <p className="font-semibold text-navy capitalize">{v.status}</p>
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Request ID</p>
                <p className="font-semibold text-navy font-mono text-xs">{v.id.slice(0, 8)}…</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href="/visa/start" className="btn-outline px-4 py-2 text-sm">New request</Link>
            </div>
          </Panel>
        ))}
        {(live?.visaRequests.length ?? 0) === 0 && (
          <p className="text-sm text-charcoal/50">No visa applications yet. <Link href="/visa/start" className="text-blue font-semibold hover:underline">Start one now</Link>.</p>
        )}
        <Link href="/visa" className="inline-block text-sm font-semibold text-blue hover:underline">
          + Start new visa application
        </Link>
      </div>
    ),

    saved: (
      <DashboardEmpty
        title="No saved trips"
        message="Save destinations, experts, and listings from the marketplace to see them here."
        action={<Link href="/saved" className="btn-primary px-5 py-2.5 text-sm">Open saved items</Link>}
      />
    ),

    bookings: (
      <div className="space-y-4">
        {stripeBookings.length > 0 && (
          <Panel title="Paid bookings" subtitle="Confirmed from Stripe checkout">
            {stripeBookings.map((b) => (
              <TableRow
                key={b.id}
                cells={[
                  b.listing_title ?? b.booking_type.replace(/_/g, " "),
                  new Date(b.created_at).toLocaleDateString(),
                  b.total_amount != null ? formatPaymentAmount(Number(b.total_amount), b.currency ?? "USD") : "—",
                ]}
                badge={b.status}
                badgeColor={b.status === "confirmed" ? "green" : "blue"}
              />
            ))}
          </Panel>
        )}
        <Panel title="Quote requests" subtitle="Flights, hotels, tours and more">
          {(live?.bookingRequests.length ?? 0) === 0 ? (
            <DashboardEmpty
              title="No booking requests"
              message="Submit a flight, hotel, tour, or cruise quote request to see it here."
              action={<Link href="/booking/request" className="btn-primary px-5 py-2.5 text-sm">Request a quote</Link>}
            />
          ) : (
            live?.bookingRequests.map((b) => (
              <TableRow
                key={b.id}
                cells={[b.service_name ?? b.service_type, new Date(b.created_at).toLocaleDateString(), b.status]}
                badge={b.status}
                badgeColor="blue"
              />
            ))
          )}
        </Panel>
        <div className="flex flex-wrap gap-3">
          <Link href="/booking/request" className="btn-outline px-4 py-2.5 text-sm">New request</Link>
          <Link href="/flights" className="btn-outline px-4 py-2.5 text-sm">Flights</Link>
          <Link href="/hotels" className="btn-outline px-4 py-2.5 text-sm">Hotels</Link>
        </div>
      </div>
    ),

    documents: (
      <div className="space-y-5">
        {visaCase ? (
          <>
            <VisaCaseSummaryCard visaCase={visaCase} />
            <Panel title="Full document checklist" subtitle={`Case ${visaCase.caseNumber}`}>
              <p className="text-sm text-muted mb-4">
                Upload and track all required documents in your case workspace.
              </p>
              <Link
                href={visaCaseWorkspacePath(visaCase.id, "documents")}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                Open case workspace
              </Link>
            </Panel>
          </>
        ) : (
          <EmptyState
            emoji="📁"
            title="No documents uploaded yet"
            description="Purchase a visa service to unlock your document checklist and upload panel."
            action={{ label: "Start visa service", href: "/services#premium" }}
          />
        )}
        <Disclaimer variant="inline" />
      </div>
    ),

    referrals: (
      <DashboardEmpty
        title="$0 referral earnings"
        message="Referral tracking is connected to Supabase. Share your link from the referrals page when you have an active code."
        action={<Link href="/referrals" className="btn-primary px-5 py-2.5 text-sm">Open referrals program</Link>}
      />
    ),

    billing: (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Total paid"
            value={formatPaymentAmount(paidTotal)}
            icon="star"
            color="gold"
          />
          <StatCard
            label="Transactions"
            value={String(customerPayments.length)}
            icon="doc"
            hint={`${customerPayments.filter((p) => p.status === "paid").length} completed`}
            color="blue"
          />
        </div>

        {customerPayments.length === 0 ? (
          <EmptyState
            emoji="💳"
            title="No payments yet"
            description="Your premium purchases and invoices will appear here after checkout."
            action={{ label: "Explore premium services", href: "/services#premium" }}
          />
        ) : (
          <Panel title="Payment history" subtitle="Invoices and receipts for all purchases">
            {customerPayments.map((p) => (
              <div key={p.id} className="border-b border-soft-200 last:border-0 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy">
                      {paymentServiceLabel(p.service_type, p.description)}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {formatPaymentDate(p.paid_at ?? p.created_at)}
                      {p.invoice_number ? ` · Invoice ${p.invoice_number}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy">{formatPaymentAmount(Number(p.amount), p.currency)}</p>
                    <span className={`text-xs font-bold capitalize ${p.status === "paid" ? "text-emerald-600" : "text-muted"}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  {p.status === "paid" && (
                    <a
                      href={`/api/receipt/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue hover:underline"
                    >
                      Download receipt →
                    </a>
                  )}
                  {p.status === "paid" && p.service_type?.includes("visa") && visaCase && (
                    <Link
                      href={visaCaseWorkspacePath(visaCase.id)}
                      className="text-xs font-semibold text-gold hover:underline"
                    >
                      Open visa case →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </Panel>
        )}

        {!visaCase && (
          <Link href="/services#premium" className="btn-outline inline-flex px-4 py-2.5 text-sm">
            Browse premium services
          </Link>
        )}
        <p className="text-xs text-muted">Secure checkout powered by Stripe · Receipts available for paid orders</p>
      </div>
    ),

    support: (
      <div className="space-y-4">
        {(live?.supportTickets.length ?? 0) === 0 ? (
          <DashboardEmpty title="No support tickets" message="Submit a request below and our team will respond." />
        ) : (
          live?.supportTickets.map((t) => (
            <Panel
              key={t.id}
              title={t.subject ?? "Support request"}
              subtitle={new Date(t.created_at).toLocaleDateString()}
              action={<span className="chip text-xs bg-blue/10 text-blue">{t.status}</span>}
            >
              <p className="text-sm text-charcoal/55">Ticket submitted — our team will respond by email.</p>
            </Panel>
          ))
        )}

        <Panel title="New support request">
          <form onSubmit={handleSupportSubmit} className="space-y-3">
            <div>
              <label className="label">Subject</label>
              <input className="input" value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} required placeholder="Describe your issue briefly" />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea className="input min-h-28" value={supportBody} onChange={(e) => setSupportBody(e.target.value)} required placeholder="Explain your request in detail..." />
            </div>
            {supportMsg && <p className="text-sm text-charcoal/65">{supportMsg}</p>}
            <button type="submit" disabled={supportSending} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60">
              {supportSending ? "Sending…" : "Send request"}
            </button>
          </form>
        </Panel>
      </div>
    ),

    messages: <MessagesInbox title="Your messages" />,

    ai: <AiPanel />,
  };

  return (
    <DashboardLayout
      role={user.roleLabel}
      name={user.displayName}
      initials={user.initials}
      email={user.email}
      profileCompletion={user.completion}
      tabs={customerTabs}
      sections={sections}
      roleColor="bg-blue/10 text-blue"
      avatarColor="bg-navy text-gold"
      defaultTab={defaultTab}
      tabsWithoutHeader={["overview"]}
    />
  );
}

export default function CustomerDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-soft flex items-center justify-center"><div className="skeleton h-64 w-full max-w-4xl rounded-2xl" /></div>}>
      <CustomerDashboardContent />
    </Suspense>
  );
}
