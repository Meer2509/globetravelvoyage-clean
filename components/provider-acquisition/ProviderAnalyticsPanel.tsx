"use client";

import { useEffect, useState } from "react";
import { fetchProviderAnalytics } from "@/lib/provider-acquisition/provider-analytics";
import type { ProviderAnalyticsReport } from "@/lib/provider-acquisition/types";
import { Panel } from "@/components/DashboardLayout";

export function ProviderAnalyticsPanel({ className = "" }: { className?: string }) {
  const [report, setReport] = useState<ProviderAnalyticsReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProviderAnalytics(30).then((result) => {
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setReport(result.report);
    });
  }, []);

  if (error) return null;
  if (!report) {
    return (
      <Panel title="Provider analytics" subtitle="Last 30 days">
        <div className="skeleton h-16 rounded-xl" />
      </Panel>
    );
  }

  return (
    <Panel title="Provider analytics" subtitle={`Last ${report.periodDays} days`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Profile views", value: report.profileViews },
          { label: "Inquiries", value: report.inquiries },
          { label: "Bookings", value: report.bookings },
          { label: "Reviews", value: report.reviews, sub: report.averageRating ? `${report.averageRating}★ avg` : undefined },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-soft p-4">
            <p className="text-xs font-semibold uppercase text-charcoal/45">{stat.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{stat.value}</p>
            {stat.sub && <p className="text-xs text-gold">{stat.sub}</p>}
          </div>
        ))}
      </div>
    </Panel>
  );
}
