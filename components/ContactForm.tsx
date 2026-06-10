"use client";

import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <span className="text-4xl">✅</span>
        <h3 className="mt-3 text-xl font-bold text-navy">Message received</h3>
        <p className="mt-2 text-sm text-navy/60">
          Thanks for reaching out. This is a demo form — no message was actually
          sent. We'll connect real messaging in a later phase.
        </p>
        <button className="btn-outline mt-5 px-5 py-2.5" onClick={() => setSent(false)}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      className="card space-y-4 p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input className="input" placeholder="Your name" required />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" placeholder="you@example.com" required />
        </div>
      </div>
      <div>
        <label className="label">Topic</label>
        <select className="input">
          <option>General question</option>
          <option>Visa guidance</option>
          <option>Become a partner</option>
          <option>Report an issue</option>
        </select>
      </div>
      <div>
        <label className="label">Message</label>
        <textarea className="input min-h-32" placeholder="How can we help?" required />
      </div>
      <button type="submit" className="btn-primary w-full py-3">
        Send message
      </button>
    </form>
  );
}
