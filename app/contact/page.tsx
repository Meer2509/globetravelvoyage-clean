import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/ContactForm";
import { TrustBadge } from "@/components/TrustBadge";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Globe Travel Voyage. Ask a question, become a partner, or report an issue.",
};

const contactInfo = [
  {
    icon: "globe" as const,
    title: "General inquiries",
    text: "For questions about our platform, services or how we work.",
  },
  {
    icon: "agent" as const,
    title: "Partner & agent applications",
    text: "Want to list as a verified agent, agency, guide or host? Use the contact form.",
  },
  {
    icon: "shield" as const,
    title: "Trust & safety",
    text: "Report a suspicious listing, fake review, or safety concern.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        subtitle="We'd love to hear from you. Fill in the form and our team will respond within 24–48 hours."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="section">
        <div className="container-px grid gap-12 lg:grid-cols-[1fr_420px]">
          <div>
            <ContactForm />
          </div>

          <aside className="space-y-5">
            <div className="card p-6">
              <div className="flex items-center gap-2 text-gold">
                <Icon name="sparkles" className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wide text-navy">
                  AI assistant available 24/7
                </span>
              </div>
              <p className="mt-2 text-sm text-navy/65">
                For instant help with visa questions, trip planning or finding the
                right service — use the AI assistant bubble on any page.
              </p>
            </div>

            {contactInfo.map((c) => (
              <TrustBadge key={c.title} icon={c.icon} title={c.title} text={c.text} />
            ))}

            <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
              <p className="text-xs leading-relaxed text-navy/70">
                <span className="font-semibold text-navy/80">Disclaimer:</span>{" "}
                Globe Travel Voyage is an independent travel marketplace. We are
                not a government agency, embassy, immigration lawyer, airline,
                cruise company, real estate broker, or official visa authority.
                Please do not send confidential documents via this form.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
