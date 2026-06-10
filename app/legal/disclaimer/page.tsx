import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Important disclaimers about Globe Travel Voyage. We are an independent travel marketplace — not a government, embassy, airline, or immigration authority.",
};

const sections = [
  {
    title: "Who we are",
    body: "Globe Travel Voyage is an independent, AI-powered travel marketplace. We connect travelers with information, tools and third-party service providers. We are NOT a government agency, embassy, consulate, immigration lawyer, immigration consultant, airline, cruise company, hotel chain, real estate broker, or official visa authority of any kind.",
  },
  {
    title: "No visa guarantee",
    body: "Nothing on this platform — including any AI assistant response, visa guide, agent recommendation, or document checklist — constitutes a guarantee or prediction of visa approval. Visa decisions are made solely and exclusively by the relevant government authority. We have no influence over those decisions.",
  },
  {
    title: "Not legal or immigration advice",
    body: "Information provided on Globe Travel Voyage is for general guidance and informational purposes only. It does not constitute legal advice, immigration advice, or professional advice of any kind. Always consult a qualified immigration lawyer or licensed consultant for your specific situation.",
  },
  {
    title: "No price guarantee on flights or tickets",
    body: "All flight prices, ticket prices, hotel rates, car rental rates, cruise prices, and tour prices displayed on this platform are sample or estimated figures for demonstration purposes. They are not guaranteed rates and may change at any time based on availability, season, airline policy, and other factors. Always confirm the final price directly with the provider before booking.",
  },
  {
    title: "Third-party providers",
    body: "Globe Travel Voyage provides a marketplace to connect users with third-party service providers including visa agents, travel agencies, tour guides, property hosts, and others. We perform identity and business checks on verified partners, but we are not liable for the acts or omissions of those third parties. Always do your own due diligence before engaging or paying any provider.",
  },
  {
    title: "AI assistant",
    body: "Our AI assistant provides sample, informational responses based on publicly available data. It does not have access to your personal immigration history, real-time airline systems, or live visa authority databases. AI responses are not a substitute for advice from a qualified professional.",
  },
  {
    title: "Property listings",
    body: "Globe Travel Voyage is not a licensed real estate broker in any jurisdiction. Property listings on this platform are informational and for general inquiry purposes only. We do not handle property transactions, escrow, or legal conveyancing.",
  },
  {
    title: "No warranties",
    body: "This platform is provided 'as is' without warranties of any kind, express or implied. We do not warrant the accuracy, completeness, or fitness for a particular purpose of any information on this platform.",
  },
];

export default function DisclaimerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Disclaimer"
        subtitle="Please read this disclaimer carefully before using Globe Travel Voyage."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Legal", href: "/legal/disclaimer" },
          { label: "Disclaimer" },
        ]}
      />

      <section className="section">
        <div className="container-px max-w-4xl">
          <div className="mb-8 flex items-start gap-4 rounded-2xl border border-gold/30 bg-gold/5 p-5">
            <Icon name="shield" className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
            <div>
              <p className="text-sm font-bold text-navy">Summary</p>
              <p className="mt-1 text-sm leading-relaxed text-navy/70">
                Globe Travel Voyage is an independent travel marketplace. We are
                NOT a government agency, embassy, immigration lawyer, airline,
                cruise company, real estate broker, or official visa authority.
                We do NOT guarantee visa approvals, legal outcomes, or ticket
                prices. All information is for guidance only.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {sections.map((s, i) => (
              <div key={s.title}>
                <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-extrabold text-gold">
                    {i + 1}
                  </span>
                  {s.title}
                </h2>
                <p className="mt-3 leading-relaxed text-navy/70">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-soft-200 pt-8 text-sm text-navy/55">
            <p>Last updated: June 2025</p>
            <p className="mt-2">
              For questions about this disclaimer, please{" "}
              <Link href="/contact" className="font-semibold text-blue underline">
                contact us
              </Link>
              .
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link href="/legal/privacy" className="text-blue hover:underline">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="text-blue hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
