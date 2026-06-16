import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { CountryExplorer } from "@/components/CountryExplorer";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { loadCatalogBundle } from "@/lib/catalog/load-bundle";

export const metadata: Metadata = {
  title: "Visa Requirements by Country",
  description:
    "Browse visa guidance for 190+ countries. Search by country and region to find visa types, difficulty and document checklists.",
};

export default async function VisaCountriesPage() {
  const { visaCountries } = await loadCatalogBundle();
  return (
    <>
      <PageHeader
        eyebrow="By country"
        title="Visa requirements by country"
        subtitle="Search visa guidance for countries worldwide. Informational guidance only — always confirm with the official authority."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Visa", href: "/visa" },
          { label: "Countries" },
        ]}
      />
      <section className="section">
        <div className="container-px">
          <CountryExplorer countries={visaCountries} />
          <div className="mt-10">
            <Disclaimer />
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
