"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "./Icon";
import { LogoutButton } from "./LogoutButton";
import type { IconName } from "@/lib/data";

export interface DashboardTab {
  key: string;
  label: string;
  icon: IconName;
  badge?: string | number;
}

// ─── Main DashboardLayout ─────────────────────────────────────────────────────

export function DashboardLayout({
  role,
  name,
  initials,
  email,
  profileCompletion,
  tabs,
  sections,
  verified,
  roleColor = "bg-blue/10 text-blue",
  avatarColor = "bg-navy text-gold",
  defaultTab,
  tabsWithoutHeader,
}: {
  role: string;
  name: string;
  initials: string;
  email?: string;
  profileCompletion?: number;
  tabs: DashboardTab[];
  sections: Record<string, React.ReactNode>;
  verified?: boolean;
  roleColor?: string;
  avatarColor?: string;
  defaultTab?: string;
  tabsWithoutHeader?: string[];
}) {
  const initialTab =
    defaultTab && tabs.some((t) => t.key === defaultTab) ? defaultTab : tabs[0]?.key;
  const [active, setActive] = useState(initialTab);

  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div className="min-h-screen bg-soft">
      <div className="container-px py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* ── Sidebar ── */}
          <aside className="h-fit space-y-3 lg:sticky lg:top-20">
            {/* Logo in sidebar */}
            <Link href="/" className="block px-1 pb-3" aria-label="Globe Travel Voyage">
              <Image src="/logo.png" alt="Globe Travel Voyage" width={300} height={88} className="h-[88px] w-auto object-contain" quality={100} />
            </Link>

            {/* Profile card */}
            <div className="card overflow-hidden p-0">
              <div className="h-1.5 w-full bg-hero-gradient" />
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold ${avatarColor}`}>
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-navy">{name}</p>
                    {email && (
                      <p className="truncate text-xs text-muted">{email}</p>
                    )}
                    {profileCompletion !== undefined && (
                      <p className="mt-1 text-[11px] font-semibold text-blue">
                        Profile {profileCompletion}% complete
                      </p>
                    )}
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${roleColor}`}>
                        {role}
                      </span>
                      {verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-2 py-0.5 text-xs font-semibold text-blue">
                          <Icon name="check" className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="card overflow-hidden p-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                    active === t.key
                      ? "bg-navy text-white shadow-[0_4px_12px_-4px_rgba(8,28,58,0.4)]"
                      : "text-charcoal/70 hover:bg-soft hover:text-navy"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon name={t.icon} className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                    {t.label}
                  </span>
                  {t.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        active === t.key
                          ? "bg-white/20 text-white"
                          : "bg-soft-200 text-charcoal/60"
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Back to site + logout */}
            <div className="card overflow-hidden p-1.5 space-y-0.5">
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-charcoal/50 hover:bg-soft hover:text-navy transition-colors"
              >
                <Icon name="agent" className="h-4 w-4" />
                Edit profile
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-charcoal/50 hover:bg-soft hover:text-navy transition-colors"
              >
                <Icon name="doc" className="h-4 w-4" />
                Settings
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-charcoal/50 hover:bg-soft hover:text-navy transition-colors"
              >
                <Icon name="globe" className="h-4 w-4" />
                Back to site
              </Link>
              <LogoutButton className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500/70 hover:bg-red-50 hover:text-red-600 transition-colors" />
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="min-w-0">
            {/* Section header */}
            {activeTab && !tabsWithoutHeader?.includes(active ?? "") && (
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy/8">
                  <Icon name={activeTab.icon} className="h-5 w-5 text-navy" />
                </span>
                <h1 className="text-xl font-extrabold text-navy">{activeTab.label}</h1>
              </div>
            )}
            {sections[active ?? ""]}
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon,
  hint,
  delta,
  color = "blue",
}: {
  label: string;
  value: string;
  icon: IconName;
  hint?: string;
  delta?: string;
  color?: "blue" | "gold" | "navy" | "green";
}) {
  const colorMap = {
    blue: "bg-blue/10 text-blue",
    gold: "bg-gold/15 text-gold",
    navy: "bg-navy/8 text-navy",
    green: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="card p-5 hover:shadow-[var(--shadow-premium)] transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-charcoal/45">
          {label}
        </span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorMap[color]}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-navy">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {hint && <p className="text-xs text-charcoal/50">{hint}</p>}
        {delta && (
          <span className={`text-xs font-semibold ${delta.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function Panel({
  title,
  subtitle,
  action,
  children,
  noPad = false,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  noPad?: boolean;
}) {
  return (
    <div className="card overflow-hidden">
      <div className={`flex items-start justify-between gap-4 border-b border-soft-200 ${noPad ? "px-5 py-4" : "p-5 pb-4"}`}>
        <div>
          <h3 className="font-bold text-navy">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-charcoal/55">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={noPad ? "" : "p-5"}>{children}</div>
    </div>
  );
}

// ─── TableRow ─────────────────────────────────────────────────────────────────

export function TableRow({
  cells,
  badge,
  badgeColor = "default",
  action,
}: {
  cells: string[];
  badge?: string;
  badgeColor?: "default" | "blue" | "gold" | "green" | "red";
  action?: React.ReactNode;
}) {
  const badgeColorMap = {
    default: "bg-soft text-charcoal/60",
    blue: "bg-blue/10 text-blue",
    gold: "bg-gold/15 text-navy",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="flex items-center justify-between border-b border-soft-200 py-3 text-sm last:border-0">
      <div className="min-w-0 flex-1">
        <span className="text-charcoal/75">{cells[0]}</span>
        {cells.slice(1).map((c, i) => (
          <span key={i} className="ml-2 text-charcoal/45">· {c}</span>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {badge && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColorMap[badgeColor]}`}>
            {badge}
          </span>
        )}
        {action}
      </div>
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

export function ProgressBar({
  label,
  pct,
  color = "blue",
}: {
  label: string;
  pct: number;
  color?: "blue" | "gold" | "green";
}) {
  const colorMap = { blue: "bg-blue", gold: "bg-gold", green: "bg-emerald-500" };
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-navy">{label}</span>
        <span className="font-bold text-charcoal/60">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-soft-200">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── TimelineItem ────────────────────────────────────────────────────────────

export function TimelineItem({
  title,
  date,
  description,
  status,
  icon,
  last = false,
}: {
  title: string;
  date: string;
  description?: string;
  status: "done" | "active" | "upcoming";
  icon?: string;
  last?: boolean;
}) {
  const statusMap = {
    done: "bg-blue text-white",
    active: "bg-gold text-navy animate-pulse-glow",
    upcoming: "bg-soft-200 text-charcoal/40",
  };
  return (
    <div className={`relative flex gap-4 ${!last ? "pb-6" : ""}`}>
      {!last && (
        <div className="absolute left-[19px] top-10 h-[calc(100%-24px)] w-0.5 bg-soft-200" />
      )}
      <div className={`relative z-10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${statusMap[status]}`}>
        {icon ?? "•"}
      </div>
      <div className="min-w-0 flex-1 pt-1.5">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-navy text-sm">{title}</p>
          {status === "active" && (
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-charcoal/50 mt-0.5">{date}</p>
        {description && <p className="mt-1 text-xs text-charcoal/65">{description}</p>}
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({
  emoji,
  title,
  description,
  action,
}: {
  emoji: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <span className="text-5xl">{emoji}</span>
      <h3 className="mt-4 text-lg font-bold text-navy">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-charcoal/60">{description}</p>
      {action && (
        <Link href={action.href} className="btn-primary mt-5 px-5 py-2.5 text-sm">
          {action.label}
        </Link>
      )}
    </div>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 text-lg font-extrabold text-navy">{children}</h2>
  );
}
