"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { RoleCard } from "@/components/RoleCard";
import { Disclaimer } from "@/components/Disclaimer";
import { useCatalog } from "@/lib/catalog/context";

export function DashboardHubClient() {
  const { roles } = useCatalog();
  const router = useRouter();
  const auth = useAuthSession();

  useEffect(() => {
    if (!auth.loading && auth.isLoggedIn) {
      router.replace(auth.dashboardUrl);
    }
  }, [auth.loading, auth.isLoggedIn, auth.dashboardUrl, router]);

  if (auth.loading || auth.isLoggedIn) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-charcoal/50">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Accounts"
        title="Your dashboards"
        subtitle="Sign in to access your role-based dashboard. Each account type has its own workspace."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
      />
      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="Roles" title="One platform, every role" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((r) => (
              <RoleCard key={r.slug} role={r} />
            ))}
          </div>
          <div className="mt-8">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </section>
    </>
  );
}
