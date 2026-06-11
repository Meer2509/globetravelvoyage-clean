"use client";

import { useState } from "react";
import { submitContactForm } from "@/lib/supabase/actions";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", topic: "General question", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await submitContactForm(form);

    setLoading(false);

    if (!result.ok) {
      if (result.demo) { setSent(true); return; }
      setError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <span className="text-4xl">✅</span>
        <h3 className="mt-3 text-xl font-bold text-navy">Message received</h3>
        <p className="mt-2 text-sm text-navy/65">
          Thanks for reaching out. We&apos;ll get back to you at <strong>{form.email}</strong> as soon as possible.
        </p>
        <button className="btn-outline mt-5 px-5 py-2.5" onClick={() => { setSent(false); setForm({ name: "", email: "", topic: "General question", message: "" }); }}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="card space-y-4 p-8" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input className="input" placeholder="Your name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" placeholder="you@example.com" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="label">Topic</label>
        <select className="input" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}>
          <option>General question</option>
          <option>Visa guidance</option>
          <option>Become a partner</option>
          <option>Report an issue</option>
        </select>
      </div>
      <div>
        <label className="label">Message</label>
        <textarea className="input min-h-32" placeholder="How can we help?" required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-70">
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
