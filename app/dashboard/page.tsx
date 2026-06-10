import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { RoleCard } from "@/components/RoleCard";
import { Disclaimer } from "@/components/Disclaimer";
import { roles } from "@/lib/data";

export const metadata: Metadata = {
  title: "Dashboards — Choose Your Account",
  description:
    "Access the traveler, visa agent, travel agency, tour guide, property host or admin dashboard.",
};

export default function DashboardHub() {
  return (
    <>
      <PageHeader
        eyebrow="Accounts"
        title="Your dashboards"
        subtitle="Choose an account type to preview its dashboard. These are demo dashboards with sample data — no login required yet."
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
