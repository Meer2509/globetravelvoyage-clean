import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Globe Travel Voyage Terms of Service — your agreement with us when using the platform.",
};

const sections = [
  {
    title: "Acceptance of terms",
    body: "By accessing or using Globe Travel Voyage, you agree to be bound by these Terms of Service and our Privacy Policy and Disclaimer. If you do not agree to these terms, please do not use the platform.",
  },
  {
    title: "Platform description",
    body: "Globe Travel Voyage is an AI-powered travel marketplace that provides informational guidance and connects users with third-party service providers. We are not a government agency, embassy, immigration lawyer, airline, cruise company, real estate broker, or official visa authority. All features are provided for informational and marketplace purposes only.",
  },
  {
    title: "User accounts",
    body: "To access certain features, you may create an account. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You must provide accurate information and promptly update it if it changes. We reserve the right to suspend or terminate accounts that violate these terms.",
  },
  {
    title: "Permitted use",
    body: "You may use Globe Travel Voyage only for lawful purposes and in accordance with these terms. You agree not to use the platform to violate any law or regulation, impersonate any person, transmit spam or malicious code, scrape or harvest data without permission, or engage in any activity that interferes with the platform.",
  },
  {
    title: "Provider listings",
    body: "Third-party providers (visa agents, travel agencies, tour guides, property hosts) are independent parties and not employees or agents of Globe Travel Voyage. We perform verification checks but do not warrant the quality, accuracy, or reliability of any provider. You engage providers at your own risk.",
  },
  {
    title: "AI-generated content",
    body: "The AI assistant and AI trip planner generate informational responses based on sample data. AI-generated content is not legal, immigration, financial, or professional advice. It may contain errors or inaccuracies and should not be relied upon as a sole source of information. Always verify important information with official sources.",
  },
  {
    title: "Payments",
    body: "Selected platform services are processed via Stripe Checkout. Third-party travel services may have separate payment terms with their providers. We do not guarantee any specific pricing for third-party services. See our Refund Policy and Cancellation Policy for platform payments.",
  },
  {
    title: "Intellectual property",
    body: "All content on Globe Travel Voyage — including text, images, logos, and software — is owned by Globe Travel Voyage or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.",
  },
  {
    title: "Limitation of liability",
    body: "To the maximum extent permitted by law, Globe Travel Voyage and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the platform, including but not limited to visa refusals, flight price changes, property transaction disputes, or reliance on AI-generated guidance.",
  },
  {
    title: "Changes to terms",
    body: "We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated date. Your continued use of the platform after changes are posted constitutes your acceptance of the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="Please read these terms carefully before using Globe Travel Voyage."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Legal", href: "/legal/disclaimer" },
          { label: "Terms of Service" },
        ]}
      />

      <section className="section">
        <div className="container-px max-w-4xl">
          <div className="space-y-6">
            {sections.map((s, i) => (
              <div key={s.title}>
                <h2 className="text-base font-bold text-navy">
                  {i + 1}. {s.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-navy/70">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-soft-200 pt-8 text-sm text-navy/55">
            <p>Last updated: June 2025</p>
            <p className="mt-2">
              For questions about these terms, please{" "}
              <Link href="/contact" className="font-semibold text-blue underline">
                contact us
              </Link>
              .
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link href="/legal/disclaimer" className="text-blue hover:underline">
                Disclaimer
              </Link>
              <Link href="/legal/privacy" className="text-blue hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
