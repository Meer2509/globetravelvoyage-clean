"use client";

import { useState, useEffect, useRef } from "react";
import { submitContactModal } from "@/lib/supabase/actions";
import { FORM_SUBMIT_SUCCESS_MESSAGE } from "@/lib/site-config";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ContactMode =
  | "contact_expert"
  | "book_tour"
  | "book_stay"
  | "request_quote"
  | "property_inquiry"
  | "visa_lead"
  | "buy_ticket";

interface ModalConfig {
  title: string;
  subtitle: string;
  emoji: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
  fields: FormFieldDef[];
  showDisclaimer?: boolean;
  disclaimerText?: string;
}

interface FormFieldDef {
  key: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "select" | "textarea" | "number";
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

const CONFIGS: Record<ContactMode, ModalConfig> = {
  contact_expert: {
    title:         "Contact this expert",
    subtitle:      "Send a message to the expert. They respond within their stated response time.",
    emoji:         "👔",
    submitLabel:   "Send message",
    successTitle:  "Message sent!",
    successBody:   "Your message has been sent to the expert. Expect a reply within their response time. You'll receive a copy by email.",
    showDisclaimer: true,
    disclaimerText: "Globe Travel Voyage connects you with independent visa experts. We do not guarantee outcomes. Always agree terms in writing before paying.",
    fields: [
      { key: "name",        label: "Your full name",        type: "text",     placeholder: "Ahmed Khan",               required: true  },
      { key: "email",       label: "Email address",         type: "email",    placeholder: "you@example.com",           required: true  },
      { key: "phone",       label: "WhatsApp / phone",      type: "tel",      placeholder: "+971 50 000 0000" },
      { key: "nationality", label: "Your nationality",      type: "text",     placeholder: "Pakistani, Indian…" },
      { key: "destination", label: "Destination country",   type: "text",     placeholder: "USA, UK, Canada…" },
      { key: "purpose",     label: "Purpose of travel",     type: "select",   options: ["Tourism", "Business", "Study", "Family visit", "Work", "Transit", "Other"] },
      { key: "message",     label: "Additional message",    type: "textarea", placeholder: "Describe your case or ask a question…" },
    ],
  },
  book_tour: {
    title:        "Book this tour",
    subtitle:     "Submit a booking request. The guide will confirm availability within 24 hours.",
    emoji:        "🗺️",
    submitLabel:  "Send booking request",
    successTitle: "Booking request sent!",
    successBody:  "Your booking request has been sent to the tour guide. They'll confirm availability and send pricing within 24 hours.",
    showDisclaimer: true,
    disclaimerText: "This is a booking request, not a confirmed reservation. No payment is taken here. The guide contacts you to confirm details.",
    fields: [
      { key: "name",      label: "Your full name",    type: "text",   placeholder: "Ahmed Khan",      required: true },
      { key: "email",     label: "Email address",     type: "email",  placeholder: "you@example.com", required: true },
      { key: "phone",     label: "WhatsApp / phone",  type: "tel",    placeholder: "+971 50 000 0000" },
      { key: "date",      label: "Preferred date",    type: "date",                                   required: true },
      { key: "travelers", label: "Number of travelers", type: "number", placeholder: "2",             required: true },
      { key: "message",   label: "Special requests",  type: "textarea", placeholder: "Any special requirements, dietary needs, mobility concerns…" },
    ],
  },
  book_stay: {
    title:        "Book this stay",
    subtitle:     "Submit a booking request. The host or hotel responds within 24 hours.",
    emoji:        "🏨",
    submitLabel:  "Request booking",
    successTitle: "Booking request sent!",
    successBody:  "Your request has been forwarded to the host/hotel. They'll confirm availability and send a payment link within 24 hours.",
    showDisclaimer: true,
    disclaimerText: "No payment is taken here. This sends a booking request to the host/hotel who will confirm and provide payment details.",
    fields: [
      { key: "name",      label: "Your full name",     type: "text",   placeholder: "Ahmed Khan",      required: true },
      { key: "email",     label: "Email address",      type: "email",  placeholder: "you@example.com", required: true },
      { key: "phone",     label: "Phone / WhatsApp",   type: "tel",    placeholder: "+971 50 000 0000" },
      { key: "checkin",   label: "Check-in date",      type: "date",                                   required: true },
      { key: "checkout",  label: "Check-out date",     type: "date",                                   required: true },
      { key: "guests",    label: "Number of guests",   type: "number", placeholder: "2",               required: true },
      { key: "message",   label: "Special requests",   type: "textarea", placeholder: "Early check-in, dietary requirements, etc." },
    ],
  },
  request_quote: {
    title:        "Request a travel quote",
    subtitle:     "Send your requirements to the agency. They'll prepare a personalised quote.",
    emoji:        "🏢",
    submitLabel:  "Request quote",
    successTitle: "Quote request sent!",
    successBody:  "Your requirements have been sent to the travel agency. Expect a personalised quote within 24–48 business hours.",
    fields: [
      { key: "name",        label: "Your full name",       type: "text",   placeholder: "Ahmed Khan",      required: true },
      { key: "email",       label: "Email address",        type: "email",  placeholder: "you@example.com", required: true },
      { key: "phone",       label: "Phone / WhatsApp",     type: "tel",    placeholder: "+971 50 000 0000" },
      { key: "destination", label: "Destination(s)",       type: "text",   placeholder: "Dubai, Istanbul, Thailand…" },
      { key: "travelers",   label: "Number of travelers",  type: "number", placeholder: "2" },
      { key: "dates",       label: "Approximate dates",    type: "text",   placeholder: "July 10–20, flexible…" },
      { key: "budget",      label: "Approximate budget",   type: "text",   placeholder: "$3,000 total, per person…" },
      { key: "message",     label: "Requirements",         type: "textarea", placeholder: "Flights, hotel type, tours, special occasions…", required: true },
    ],
  },
  property_inquiry: {
    title:        "Property inquiry",
    subtitle:     "Contact the host or seller. They respond directly via your contact details.",
    emoji:        "🏠",
    submitLabel:  "Send inquiry",
    successTitle: "Inquiry sent!",
    successBody:  "Your inquiry has been sent to the host/seller. They'll be in touch within 24–48 hours.",
    showDisclaimer: true,
    disclaimerText: "Globe Travel Voyage is not a real estate broker. Always verify ownership and terms independently. Never pay without a signed agreement.",
    fields: [
      { key: "name",      label: "Your full name",      type: "text",   placeholder: "Ahmed Khan",      required: true },
      { key: "email",     label: "Email address",       type: "email",  placeholder: "you@example.com", required: true },
      { key: "phone",     label: "Phone / WhatsApp",    type: "tel",    placeholder: "+971 50 000 0000" },
      { key: "intent",    label: "I am looking to",     type: "select", options: ["Rent short-term", "Rent long-term", "Purchase property", "Get more information"] },
      { key: "moveDate",  label: "Preferred move/start date", type: "date" },
      { key: "message",   label: "Your message",        type: "textarea", placeholder: "Share any questions or requirements…", required: true },
    ],
  },
  visa_lead: {
    title:        "Start visa application",
    subtitle:     "A verified visa expert will review your case and contact you within 24 hours.",
    emoji:        "🛂",
    submitLabel:  "Start my application",
    successTitle: "Application request submitted!",
    successBody:  "A verified visa expert will review your details and contact you within 24 hours. Check your email for next steps.",
    showDisclaimer: true,
    disclaimerText: "Globe Travel Voyage is not a government authority or immigration attorney. Submitting this form does not guarantee any visa outcome. This connects you with an independent expert on our marketplace.",
    fields: [
      { key: "name",         label: "Your full name",         type: "text",   placeholder: "Ahmed Khan",      required: true },
      { key: "email",        label: "Email address",          type: "email",  placeholder: "you@example.com", required: true },
      { key: "phone",        label: "WhatsApp / phone",       type: "tel",    placeholder: "+971 50 000 0000", required: true },
      { key: "nationality",  label: "Your nationality",       type: "text",   placeholder: "Pakistani, Indian…", required: true },
      { key: "currentCountry", label: "Country you live in",  type: "text",   placeholder: "UAE, Saudi Arabia…" },
      { key: "destination",  label: "Visa destination",       type: "text",   placeholder: "USA, UK, Canada…",  required: true },
      { key: "purpose",      label: "Purpose",                type: "select", options: ["Tourism", "Business", "Study", "Family visit", "Work", "Medical", "Other"] },
      { key: "travelDate",   label: "Expected travel date",   type: "date" },
      { key: "message",      label: "Additional info",        type: "textarea", placeholder: "Previous refusals, special circumstances…" },
    ],
  },
  buy_ticket: {
    title:        "Get tickets",
    subtitle:     "Submit your request. We'll confirm availability and send a payment link.",
    emoji:        "🎟️",
    submitLabel:  "Request tickets",
    successTitle: "Ticket request sent!",
    successBody:  "Your ticket request has been confirmed. Check your email for payment and collection details.",
    fields: [
      { key: "name",     label: "Your full name",  type: "text",   placeholder: "Ahmed Khan",      required: true },
      { key: "email",    label: "Email address",   type: "email",  placeholder: "you@example.com", required: true },
      { key: "date",     label: "Visit date",      type: "date",                                   required: true },
      { key: "quantity", label: "Number of tickets", type: "number", placeholder: "2",             required: true },
      { key: "message",  label: "Special requirements", type: "textarea", placeholder: "Accessibility needs, group/family info…" },
    ],
  },
};

// ── Modal component ───────────────────────────────────────────────────────────

export interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  mode: ContactMode;
  subjectName?: string;
  subjectMeta?: string;
}

export function ContactModal({ open, onClose, mode, subjectName, subjectMeta }: ContactModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <ContactModalForm
      key={mode}
      mode={mode}
      onClose={onClose}
      subjectName={subjectName}
      subjectMeta={subjectMeta}
    />
  );
}

function ContactModalForm({
  mode,
  onClose,
  subjectName,
  subjectMeta,
}: Omit<ContactModalProps, "open">) {
  const [values, setValues]     = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const overlayRef              = useRef<HTMLDivElement>(null);

  const config = CONFIGS[mode];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await submitContactModal(mode, values, subjectName, subjectMeta);

    setLoading(false);

    if (!result.ok) {
      if (result.demo) { setSubmitted(true); return; }
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-[var(--shadow-premium)]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 rounded-t-3xl bg-white border-b border-soft-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-xl">
              {config.emoji}
            </span>
            <div>
              <h2 className="font-extrabold text-navy">{config.title}</h2>
              {subjectName && (
                <p className="text-sm font-semibold text-blue">{subjectName}{subjectMeta ? ` · ${subjectMeta}` : ""}</p>
              )}
              {!subjectName && (
                <p className="text-xs text-charcoal/50">{config.subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-charcoal/40 hover:bg-soft hover:text-navy transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {subjectName && (
                <p className="text-xs text-charcoal/50 -mt-1">{config.subtitle}</p>
              )}
              {config.fields.map((field) => (
                <div key={field.key}>
                  <label className="label">{field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      className="input min-h-[80px] resize-y"
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                    />
                  ) : field.type === "select" ? (
                    <select
                      className="input"
                      required={field.required}
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                    >
                      <option value="">Select…</option>
                      {(field.options ?? []).map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type ?? "text"}
                      className="input"
                      placeholder={field.placeholder}
                      required={field.required}
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}

              {config.showDisclaimer && config.disclaimerText && (
                <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-xs text-charcoal/55 leading-relaxed">
                  ⚠ {config.disclaimerText}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                    </svg>
                    Submitting…
                  </span>
                ) : config.submitLabel}
              </button>
            </form>
          ) : (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
                ✅
              </div>
              <h3 className="text-xl font-extrabold text-navy">Thank you!</h3>
              <p className="mt-2 text-sm text-charcoal/60 leading-relaxed">{FORM_SUBMIT_SUCCESS_MESSAGE}</p>
              <button
                onClick={onClose}
                className="btn-primary mt-6 py-3 px-8"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
