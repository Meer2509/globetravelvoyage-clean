"use client";

import { useState } from "react";
import Link from "next/link";
import {
  approvePropertyListing,
  rejectPropertyListing,
  setPropertyFeatured,
  updatePropertyListingStatus,
  updatePropertyListingAdminNotes,
  deletePropertyListing,
} from "@/lib/supabase/property-actions";
import { PROPERTY_LISTING_STATUSES, type PropertyListingRow } from "@/lib/supabase/property-types";
import { updatePropertyInquiryStatus } from "@/lib/admin/phase1-actions";

const STATUS_STYLE: Record<string, string> = {
  new: "bg-blue/10 text-blue",
  pending: "bg-gold/10 text-gold",
  reviewing: "bg-purple-50 text-purple-700",
  approved: "bg-emerald-50 text-emerald-700",
  published: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
  closed: "bg-charcoal/10 text-charcoal/50",
};

function formatPrice(price: number | null, period: string | null, listingType: string): string {
  if (price == null) return "—";
  const formatted = `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (listingType === "sale") return formatted;
  const per = period === "night" ? "/night" : period === "week" ? "/week" : period === "year" ? "/year" : "/month";
  return `${formatted}${per}`;
}

export function AdminPropertyConsole({
  listings,
  inquiries,
  listingsError,
  inquiriesError,
}: {
  listings: PropertyListingRow[];
  inquiries: Array<Record<string, unknown>>;
  listingsError?: string;
  inquiriesError?: string;
}) {
  const [listingRows, setListingRows] = useState(listings);
  const [inquiryRows, setInquiryRows] = useState(inquiries);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function runAction(id: string, action: () => Promise<{ ok: boolean; error?: string }>, onSuccess: () => void) {
    setBusyId(id);
    const result = await action();
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error ?? "Action failed");
      return;
    }
    onSuccess();
  }

  function patchListing(id: string, patch: Partial<PropertyListingRow>) {
    setListingRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
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
          <p className="mt-1 text-sm text-muted">
            Approve listings for the public marketplace, feature properties, and manage inquiries.
          </p>
        </div>
      </div>
      <div className="container-px py-8 space-y-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-navy">All property listings ({listingRows.length})</h2>
            <Link href="/properties" className="text-xs font-semibold text-blue hover:underline">
              View public marketplace →
            </Link>
          </div>
          {listingsError && <p className="text-sm text-red-600">{listingsError}</p>}
          {listingRows.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">No property listings in Supabase yet.</div>
          ) : (
            listingRows.map((r) => (
              <div key={r.id} className="card space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-navy">{r.title}</p>
                      {r.is_featured && (
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">Featured</span>
                      )}
                    </div>
                    <p className="text-sm text-muted">
                      {r.city}
                      {r.country ? `, ${r.country}` : ""} · {formatPrice(r.price, r.price_period, r.listing_type)} ·{" "}
                      {r.contact_name} · {r.contact_email}
                    </p>
                    <p className="mt-1 text-xs text-charcoal/45">
                      Submitted {new Date(r.created_at).toLocaleString()} · ID {r.id.slice(0, 8)}…
                    </p>
                  </div>
                  <span className={`chip text-xs capitalize ${STATUS_STYLE[r.status] ?? ""}`}>{r.status}</span>
                </div>

                {r.description && (
                  <p className="text-sm text-charcoal/65 line-clamp-3">{r.description}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {r.status !== "approved" && (
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() =>
                        runAction(r.id, () => approvePropertyListing(r.id), () => {
                          patchListing(r.id, { status: "approved" });
                          showToast("Listing approved — visible on /properties");
                        })
                      }
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() =>
                        runAction(r.id, () => rejectPropertyListing(r.id), () => {
                          patchListing(r.id, { status: "rejected", is_featured: false });
                          showToast("Listing rejected");
                        })
                      }
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                    >
                      Reject
                    </button>
                  )}
                  {r.status === "approved" && !r.is_featured && (
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() =>
                        runAction(r.id, () => setPropertyFeatured(r.id, true), () => {
                          patchListing(r.id, { is_featured: true });
                          showToast("Listing featured");
                        })
                      }
                      className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold"
                    >
                      Feature
                    </button>
                  )}
                  {r.is_featured && (
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() =>
                        runAction(r.id, () => setPropertyFeatured(r.id, false), () => {
                          patchListing(r.id, { is_featured: false });
                          showToast("Feature removed");
                        })
                      }
                      className="rounded-lg border border-soft-200 px-3 py-1.5 text-xs font-semibold text-charcoal/60"
                    >
                      Unfeature
                    </button>
                  )}
                  <select
                    className="input select py-1.5 text-xs"
                    value={r.status}
                    disabled={busyId === r.id}
                    onChange={(e) => {
                      const status = e.target.value;
                      runAction(r.id, () => updatePropertyListingStatus(r.id, status), () => {
                        patchListing(r.id, {
                          status,
                          is_featured: status === "approved" ? r.is_featured : false,
                        });
                        showToast("Status updated");
                      });
                    }}
                  >
                    {PROPERTY_LISTING_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {r.status === "approved" && (
                    <Link
                      href={`/properties/${r.id}`}
                      className="rounded-lg border border-blue/20 bg-blue/5 px-3 py-1.5 text-xs font-semibold text-blue"
                    >
                      View live →
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => {
                      if (!window.confirm(`Remove listing "${r.title}" permanently?`)) return;
                      runAction(r.id, () => deletePropertyListing(r.id), () => {
                        setListingRows((prev) => prev.filter((row) => row.id !== r.id));
                        showToast("Listing deleted");
                      });
                    }}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </div>

                <div className="border-t border-soft-200 pt-3">
                  <label className="label text-xs">Admin notes</label>
                  <textarea
                    className="input min-h-16 text-sm"
                    value={notesDraft[r.id] ?? r.admin_notes ?? ""}
                    onChange={(e) => setNotesDraft((d) => ({ ...d, [r.id]: e.target.value }))}
                    placeholder="Internal notes for this listing…"
                  />
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() =>
                      runAction(
                        r.id,
                        () => updatePropertyListingAdminNotes(r.id, notesDraft[r.id] ?? r.admin_notes ?? ""),
                        () => {
                          patchListing(r.id, { admin_notes: notesDraft[r.id] ?? r.admin_notes ?? null });
                          showToast("Notes saved");
                        }
                      )
                    }
                    className="mt-2 rounded-lg border border-soft-200 px-3 py-1.5 text-xs font-semibold text-navy"
                  >
                    Save notes
                  </button>
                </div>
              </div>
            ))
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
                <div key={r.id} className="card p-5 space-y-3">
                  <p className="font-bold text-navy">{r.property_listings?.title ?? "Property"}</p>
                  <p className="text-sm text-muted">
                    {r.full_name} · {r.email} · {new Date(r.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-charcoal/65">{r.message}</p>
                  <select
                    className="input select py-1.5 text-xs max-w-xs"
                    value={r.status}
                    disabled={busyId === r.id}
                    onChange={(e) => {
                      const status = e.target.value;
                      runAction(r.id, () => updatePropertyInquiryStatus(r.id, status), () => {
                        setInquiryRows((prev) =>
                          prev.map((inq) =>
                            (inq as { id: string }).id === r.id ? { ...inq, status } : inq
                          )
                        );
                        showToast("Inquiry status updated");
                      });
                    }}
                  >
                    {["new", "pending", "contacted", "closed", "converted"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
