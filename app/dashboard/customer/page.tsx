"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/auth";
import { fetchCustomerDashboard, type CustomerDashboardData } from "@/lib/supabase/queries";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { DashboardProfileSection } from "@/components/DashboardProfileSection";
import { DatabaseSetupBanner } from "@/components/DatabaseSetupBanner";
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
  { key: "timeline", label: "Trip Timeline", icon: "planner" },
  { key: "visas", label: "Visa Applications", icon: "visa", badge: 2 },
  { key: "saved", label: "Saved Trips", icon: "star", badge: 4 },
  { key: "bookings", label: "Bookings", icon: "doc", badge: 3 },
  { key: "documents", label: "Documents", icon: "doc" },
  { key: "referrals", label: "Referrals", icon: "users" },
  { key: "support", label: "Support", icon: "shield", badge: 1 },
  { key: "ai", label: "AI Assistant", icon: "agent" },
];

// ─── Mock data ─────────────────────────────────────────────────────────────

const tripTimeline = [
  { title: "Book flight: Dubai → JFK", date: "Jun 15, 2026", description: "Emirates EK 201 — confirmed", status: "done" as const, icon: "✈️" },
  { title: "USA B1/B2 Visa — DS-160 filed", date: "Jun 16, 2026", description: "Biometrics appointment scheduled", status: "done" as const, icon: "📋" },
  { title: "Biometrics appointment", date: "Jun 24, 2026", description: "US Consulate Dubai, 10:00 AM", status: "active" as const, icon: "🏛️" },
  { title: "Visa decision expected", date: "Jul 8, 2026", description: "Processing usually takes 10–21 days", status: "upcoming" as const, icon: "⏳" },
  { title: "Depart Dubai → New York", date: "Jul 20, 2026", description: "Emirates EK 201 · 14h flight", status: "upcoming" as const, icon: "🛫" },
  { title: "Hotel check-in — Manhattan", date: "Jul 20, 2026", description: "Marriott Marquis Times Square, 3 nights", status: "upcoming" as const, icon: "🏨" },
  { title: "Return flight: JFK → Dubai", date: "Aug 1, 2026", description: "Emirates EK 202", status: "upcoming" as const, icon: "🛬" },
];

const visaApplications = [
  {
    visa: "USA B1/B2 Tourist",
    country: "🇺🇸 United States",
    stage: "Biometrics Scheduled",
    pct: 65,
    submitted: "Jun 16, 2026",
    status: "In Progress",
    color: "blue" as const,
  },
  {
    visa: "UAE Residence Visa",
    country: "🇦🇪 United Arab Emirates",
    stage: "Documents Under Review",
    pct: 40,
    submitted: "Jun 10, 2026",
    status: "Under Review",
    color: "gold" as const,
  },
];

const savedTrips = [
  { name: "New York + Niagara Falls", days: 12, budget: "$3,200", flag: "🇺🇸", tags: ["Family", "Sightseeing"] },
  { name: "London + Paris Combo", days: 10, budget: "$4,100", flag: "🇬🇧", tags: ["Couple", "Luxury"] },
  { name: "Bali Retreat", days: 8, budget: "$1,800", flag: "🇮🇩", tags: ["Beach", "Wellness"] },
  { name: "Umrah Package — Makkah", days: 14, budget: "$2,600", flag: "🇸🇦", tags: ["Religious", "Family"] },
];

const bookings = [
  { id: "#BK-9021", name: "Emirates EK 201 · DXB→JFK", type: "Flight", status: "Confirmed", date: "Jul 20", price: "$1,240" },
  { id: "#BK-9022", name: "Marriott Marquis Times Square", type: "Hotel", status: "Confirmed", date: "Jul 20–23", price: "$890" },
  { id: "#BK-9015", name: "Dubai Desert Safari", type: "Tour", status: "Completed", date: "Jun 1", price: "$85" },
];

const documents = [
  {
    visa: "USA B1/B2 Application",
    items: [
      { name: "Valid Passport (6+ months)", done: true },
      { name: "DS-160 Confirmation", done: true },
      { name: "Bank statements (3 months)", done: true },
      { name: "Proof of employment / NOC", done: true },
      { name: "Travel itinerary", done: false },
      { name: "Proof of ties (property/family)", done: false },
      { name: "Photo 2×2 inch (white bg)", done: false },
    ],
  },
];

const referralData = {
  code: "GLOBE-ALI-4821",
  tier: "Silver Explorer",
  totalEarned: "$45",
  pendingPayout: "$15",
  referrals: [
    { name: "Zainab R.", date: "Jun 5", status: "Active", earned: "$15" },
    { name: "Tariq M.", date: "May 18", status: "Completed", earned: "$15" },
    { name: "Nadia F.", date: "Apr 30", status: "Completed", earned: "$15" },
  ],
  nextTier: { name: "Gold Traveler", referralsNeeded: 7, current: 3 },
};

const supportMessages = [
  {
    id: "MSG-441",
    subject: "Visa appointment reschedule request",
    status: "Open",
    lastReply: "Agent Sana · 2h ago",
    preview: "Your appointment has been rescheduled to Jun 24 at 10:00 AM.",
  },
  {
    id: "MSG-389",
    subject: "Flight booking confirmation",
    status: "Resolved",
    lastReply: "Support · Jun 8",
    preview: "Your EK 201 booking is confirmed. E-ticket sent to email.",
  },
];

// ─── AI Chat State ─────────────────────────────────────────────────────────

function AiPanel() {
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "Hi! I'm your AI travel assistant. Ask me anything about your upcoming New York trip, visa status, or next steps." },
  ]);
  const [input, setInput] = useState("");

  const mockResponses: Record<string, string> = {
    visa: "Your USA B1/B2 visa application is 65% complete. Next step: Biometrics at US Consulate Dubai on Jun 24 at 10:00 AM. Bring your DS-160 confirmation, passport, and one recent photo.",
    flight: "You have Emirates EK 201 (DXB→JFK) confirmed on Jul 20. Departs 10:05 AM, arrives 4:20 PM local time. Online check-in opens 48h before departure.",
    hotel: "Your Marriott Marquis Times Square booking (#BK-9022) is confirmed for Jul 20–23. Check-in at 4 PM. Located at 1535 Broadway, steps from Times Square.",
    document: "For your USA visa, you still need: travel itinerary, proof of ties (property/family documentation), and a 2×2 inch white background photo. I recommend uploading these in your documents section.",
    budget: "Your New York trip is estimated at $3,200 total. Breakdown: Flights $1,240 · Hotel $890 · Food & dining $450 · Activities $320 · Transport $180 · Contingency $120.",
    default: "I'm here to help with your travel plans, visa questions, and booking support. You can ask about your current visa application status, upcoming flights, documents needed, or AI trip planning.",
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
    <Panel title="AI Travel Assistant" subtitle="Powered by Globe AI · Mock responses">
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

export default function CustomerDashboard() {
  const user = useDashboardUser();
  const [live, setLive] = useState<CustomerDashboardData | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchCustomerDashboard().then((data) => {
      if (data) setLive(data);
    });
  }, []);

  const visaCount = live?.visaRequests.length ?? 2;
  const bookingCount = live?.bookingRequests.length ?? 3;

  const sections: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        {user.setupMessage && <DatabaseSetupBanner message={user.setupMessage} />}
        <DashboardProfileSection user={user} />
        {live && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✓ Connected to Supabase — showing your live requests below mock samples.
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active trips" value="1" icon="planner" hint="New York · Jul 2026" color="blue" />
          <StatCard label="Visa applications" value={String(visaCount)} icon="visa" hint={live ? "From your account" : "1 in progress"} color="gold" />
          <StatCard label="Total bookings" value={String(bookingCount)} icon="doc" delta={live ? undefined : "+1 this month"} color="navy" />
          <StatCard label="Referral earnings" value="$45" icon="users" hint="Silver tier" color="green" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Next steps" subtitle="Actions to complete before your trip">
            <div className="space-y-3">
              {[
                { text: "Attend biometrics — Jun 24, US Consulate Dubai", urgent: true, link: "#" },
                { text: "Upload travel itinerary to visa file", urgent: true, link: "#" },
                { text: "Complete online check-in (opens Jul 18)", urgent: false, link: "#" },
                { text: "Download USA entry requirements guide", urgent: false, link: "/visa/usa-from-pakistan" },
              ].map((item, i) => (
                <Link key={i} href={item.link} className="flex items-start gap-3 rounded-xl border border-soft-200 p-3 hover:border-blue transition-colors group">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.urgent ? "bg-gold/20 text-gold" : "bg-soft-200 text-charcoal/50"}`}>
                    {item.urgent ? "!" : "→"}
                  </span>
                  <span className="text-sm text-charcoal/75 group-hover:text-navy">{item.text}</span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Upcoming trip" subtitle="New York · Jul 20 – Aug 1">
            <div className="space-y-2">
              {[
                { label: "Flight", value: "EK 201 · DXB → JFK", icon: "✈️" },
                { label: "Hotel", value: "Marriott Marquis, 3 nights", icon: "🏨" },
                { label: "Visa status", value: "Biometrics scheduled Jun 24", icon: "📋" },
                { label: "Days until departure", value: "40 days", icon: "📅" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-soft p-3">
                  <span className="text-lg">{r.icon}</span>
                  <div>
                    <p className="text-xs text-charcoal/50">{r.label}</p>
                    <p className="text-sm font-semibold text-navy">{r.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <AiPanel />
      </div>
    ),

    timeline: (
      <Panel title="Full Trip Timeline" subtitle="Your complete journey from planning to return">
        <div className="pt-2">
          {tripTimeline.map((item, i) => (
            <TimelineItem
              key={i}
              title={item.title}
              date={item.date}
              description={item.description}
              status={item.status}
              icon={item.icon}
              last={i === tripTimeline.length - 1}
            />
          ))}
        </div>
      </Panel>
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
        {visaApplications.map((v) => (
          <Panel key={v.visa} title={v.visa} subtitle={`${v.country} · Submitted ${v.submitted}`}>
            <div className="mb-4">
              <ProgressBar label={v.stage} pct={v.pct} color={v.color === "gold" ? "gold" : "blue"} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Status</p>
                <p className="font-semibold text-navy">{v.status}</p>
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Stage</p>
                <p className="font-semibold text-navy">{v.stage}</p>
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Completion</p>
                <p className="font-semibold text-navy">{v.pct}%</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-primary px-4 py-2 text-sm">View details</button>
              <Link href="/visa/usa-from-pakistan" className="btn-outline px-4 py-2 text-sm">Visa guide</Link>
            </div>
          </Panel>
        ))}
        <Link href="/visa" className="inline-block text-sm font-semibold text-blue hover:underline">
          + Start new visa application
        </Link>
      </div>
    ),

    saved: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {savedTrips.map((trip) => (
            <div key={trip.name} className="card p-5 hover:shadow-[var(--shadow-premium)] transition-shadow">
              <div className="mb-3 flex items-start justify-between">
                <span className="text-3xl">{trip.flag}</span>
                <div className="flex gap-1">
                  {trip.tags.map((tag) => (
                    <span key={tag} className="chip text-xs">{tag}</span>
                  ))}
                </div>
              </div>
              <h3 className="font-bold text-navy">{trip.name}</h3>
              <p className="text-sm text-charcoal/55">{trip.days} days · est. {trip.budget}</p>
              <div className="mt-4 flex gap-2">
                <button className="btn-primary flex-1 py-2 text-sm">Plan with AI</button>
                <button className="btn-outline px-3 py-2 text-sm">Remove</button>
              </div>
            </div>
          ))}
        </div>
        <Link href="/trip-planner" className="inline-block text-sm font-semibold text-blue hover:underline">
          + Plan a new trip with AI
        </Link>
      </div>
    ),

    bookings: (
      <div className="space-y-4">
        <Panel title="All Bookings" subtitle="Flights, hotels, tours, and car rentals">
          <div>
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-soft-200 py-4 last:border-0">
                <div className="flex items-start gap-3">
                  <span className={`chip ${b.type === "Flight" ? "bg-blue/10 text-blue" : b.type === "Hotel" ? "bg-gold/15 text-navy" : "bg-soft text-charcoal/60"}`}>
                    {b.type}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy">{b.name}</p>
                    <p className="text-xs text-charcoal/50">{b.id} · {b.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${b.status === "Confirmed" ? "text-emerald-600" : "text-charcoal/50"}`}>
                    {b.status}
                  </span>
                  <span className="font-bold text-navy">{b.price}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <div className="flex gap-3">
          <Link href="/flights" className="btn-outline px-4 py-2.5 text-sm">Book a flight</Link>
          <Link href="/hotels" className="btn-outline px-4 py-2.5 text-sm">Book a hotel</Link>
          <Link href="/tours" className="btn-outline px-4 py-2.5 text-sm">Book a tour</Link>
        </div>
      </div>
    ),

    documents: (
      <div className="space-y-5">
        {documents.map((app) => (
          <Panel key={app.visa} title={app.visa} subtitle="Document checklist — stay organized">
            <div className="space-y-3">
              {app.items.map((item) => (
                <label key={item.name} className="flex cursor-pointer items-center gap-3 rounded-xl p-3 hover:bg-soft transition-colors">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${item.done ? "bg-blue text-white" : "border-2 border-soft-200"}`}>
                    {item.done ? "✓" : ""}
                  </span>
                  <span className={`text-sm ${item.done ? "text-charcoal/50 line-through" : "text-navy"}`}>
                    {item.name}
                  </span>
                  {!item.done && (
                    <span className="ml-auto chip bg-red-50 text-red-500 text-xs">Required</span>
                  )}
                </label>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-soft p-3 text-sm text-charcoal/65">
              {app.items.filter((i) => i.done).length} of {app.items.length} documents ready
            </div>
          </Panel>
        ))}
        <Disclaimer variant="inline" />
      </div>
    ),

    referrals: (
      <div className="space-y-5">
        {/* Referral summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total earned" value={referralData.totalEarned} icon="users" color="gold" />
          <StatCard label="Pending payout" value={referralData.pendingPayout} icon="star" color="green" />
          <StatCard label="Referrals made" value={String(referralData.referrals.length)} icon="globe" color="blue" />
        </div>

        {/* Referral code */}
        <Panel title="Your Referral Code">
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl border border-soft-200 bg-soft px-4 py-3 font-mono text-lg font-bold tracking-widest text-navy">
              {referralData.code}
            </div>
            <button className="btn-primary px-5 py-3">Copy</button>
          </div>
          <p className="mt-3 text-sm text-charcoal/60">
            Earn <span className="font-semibold text-navy">$15 per referral</span> when your friend completes their first booking. Share via WhatsApp, email, or social media.
          </p>
        </Panel>

        {/* Tier progress */}
        <Panel title={`Tier: ${referralData.tier}`}>
          <ProgressBar
            label={`${referralData.referrals.length} / ${referralData.nextTier.referralsNeeded} referrals to ${referralData.nextTier.name}`}
            pct={Math.round((referralData.referrals.length / referralData.nextTier.referralsNeeded) * 100)}
            color="gold"
          />
        </Panel>

        {/* Referral history */}
        <Panel title="Referral History">
          {referralData.referrals.map((r) => (
            <TableRow
              key={r.name}
              cells={[r.name, r.date]}
              badge={r.status}
              badgeColor={r.status === "Active" ? "blue" : "green"}
              action={<span className="font-bold text-navy text-sm">{r.earned}</span>}
            />
          ))}
        </Panel>
      </div>
    ),

    support: (
      <div className="space-y-4">
        {supportMessages.map((msg) => (
          <Panel
            key={msg.id}
            title={msg.subject}
            subtitle={`${msg.id} · Last reply: ${msg.lastReply}`}
            action={
              <span className={`chip ${msg.status === "Open" ? "bg-blue/10 text-blue" : "bg-emerald-50 text-emerald-700"}`}>
                {msg.status}
              </span>
            }
          >
            <p className="text-sm text-charcoal/65">{msg.preview}</p>
            <button className="mt-3 btn-outline px-4 py-2 text-sm">View conversation</button>
          </Panel>
        ))}

        <Panel title="New Support Request">
          <div className="space-y-3">
            <div>
              <label className="label">Subject</label>
              <input className="input" placeholder="Describe your issue briefly" />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea className="input min-h-28" placeholder="Explain your request in detail..." />
            </div>
            <button className="btn-primary px-5 py-2.5 text-sm">Send request</button>
          </div>
        </Panel>
      </div>
    ),

    ai: <AiPanel />,
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
      roleColor="bg-blue/10 text-blue"
      avatarColor="bg-navy text-gold"
    />
  );
}
