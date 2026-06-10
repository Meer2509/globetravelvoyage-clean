"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import type { IconName } from "@/lib/data";

export interface DashboardTab {
  key: string;
  label: string;
  icon: IconName;
  badge?: string | number;
}

export function DashboardLayout({
  role,
  name,
  initials,
  tabs,
  sections,
  verified,
}: {
  role: string;
  name: string;
  initials: string;
  tabs: DashboardTab[];
  sections: Record<string, React.ReactNode>;
  verified?: boolean;
}) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div className="bg-soft/40">
      <div className="container-px py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit lg:sticky lg:top-20">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-lg font-bold text-gold">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-navy">{name}</p>
                  <p className="flex items-center gap-1 text-xs text-navy/55">
                    {role}
                    {verified && (
                      <Icon name="check" className="h-3.5 w-3.5 text-blue" />
                    )}
                  </p>
                </div>
              </div>
            </div>

            <nav className="mt-4 space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    active === t.key
                      ? "bg-navy text-white"
                      : "text-navy/70 hover:bg-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon name={t.icon} className="h-5 w-5" />
                    {t.label}
                  </span>
                  {t.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        active === t.key ? "bg-white/20 text-white" : "bg-soft text-navy/60"
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <Link
              href="/"
              className="mt-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy/50 hover:bg-white"
            >
              <Icon name="globe" className="h-4 w-4" /> Back to site
            </Link>
          </aside>

          <section className="min-w-0">{sections[active]}</section>
        </div>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string;
  icon: IconName;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy/45">
          {label}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue/10 text-blue">
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-navy">{value}</p>
      {hint && <p className="mt-1 text-xs text-navy/50">{hint}</p>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-navy">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
