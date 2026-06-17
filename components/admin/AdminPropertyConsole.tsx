"use client";

import { useState } from "react";
import Link from "next/link";
import { publishPropertyListing } from "@/lib/supabase/property-actions";
import { updateAdminIntakeStatus } from "@/lib/admin/admin-intake-actions";

export function AdminPropertyConsole({
  listings,
  inquiries,
  listingsError,
  inquiriesError,
}: {
  listings: Array<Record<string, unknown>>;
  inquiries: Array<Record<string, unknown>>;
  listingsError?: string;
  inquiriesError?: string;
}) {
  const [listingRows, setListingRows] = useState(listings);
  const [inquiryRows] = useState(inquiries);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handlePublish(id: string) {
    setBusyId(id);
    const result = await publishPropertyListing(id);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setListingRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "published" } : r))
    );
    showToast("Property published");
  }

  async function handleListingStatus(id: string, status: string) {
    setBusyId(id);
    const result = await updateAdminIntakeStatus("property_listings", id, status);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setListingRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    showToast("Status updated");
  }

  return (
    <div className="min-h-screen bg-soft">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-premium)]">
          {toast}
        </div>
      )}
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Property marketplace</h1>
          <p className="mt-1 text-sm text-muted">Approve listings and view property inquiries.</p>
        </div>
      </div>
      <div className="container-px py-8 space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-navy">Listing requests</h2>
          {listingsError && <p className="text-sm text-red-600">{listingsError}</p>}
          {listingRows.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">No property listing requests.</div>
          ) : (
            listingRows.map((row) => {
              const r = row as {
                id: string;
                title: string;
                city: string;
                status: string;
                contact_name: string;
                contact_email: string;
                created_at: string;
                admin_notes: string | null;
              };
              return (
                <div key={r.id} className="card p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-navy">{r.title}</p>
                      <p className="text-sm text-muted">{r.city} · {r.contact_name} · {r.contact_email}</p>
                    </div>
                    <span className="chip text-xs capitalize">{r.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.status !== "published" && (
                      <button type="button" disabled={busyId === r.id} onClick={() => handlePublish(r.id)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        Publish to marketplace
                      </button>
                    )}
                    <select
                      className="input select py-1.5 text-xs"
                      value={r.status}
                      disabled={busyId === r.id}
                      onChange={(e) => handleListingStatus(r.id, e.target.value)}
                    >
                      {["new", "pending", "reviewing", "approved", "published", "rejected", "closed"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-navy">Property inquiries</h2>
          {inquiriesError && <p className="text-sm text-red-600">{inquiriesError}</p>}
          {inquiryRows.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">No property inquiries yet.</div>
          ) : (
            inquiryRows.map((row) => {
              const r = row as {
                id: string;
                full_name: string;
                email: string;
                message: string;
                status: string;
                created_at: string;
                property_listings?: { title: string; city: string } | null;
              };
              return (
                <div key={r.id} className="card p-5">
                  <p className="font-bold text-navy">{r.property_listings?.title ?? "Property"}</p>
                  <p className="text-sm text-muted">{r.full_name} · {r.email}</p>
                  <p className="mt-2 text-sm text-charcoal/65">{r.message}</p>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
