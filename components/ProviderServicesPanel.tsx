"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardEmpty } from "@/components/DashboardEmpty";
import { Panel } from "@/components/DashboardLayout";
import {
  createProviderService,
  deleteProviderService,
  updateProviderService,
} from "@/lib/supabase/mvp-actions";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import {
  fetchProviderServices,
  type ProviderServiceRow,
} from "@/lib/supabase/mvp-queries";

export function ProviderServicesPanel({
  role,
  roleLabel,
}: {
  role: string;
  roleLabel: string;
}) {
  const user = useDashboardUser();
  const userId = user.result?.ok ? user.result.profile.id : "";
  const [services, setServices] = useState<ProviderServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    currency: "USD",
    duration_minutes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchProviderServices(userId, role).then((res) => {
      setServices(res.services);
      setTableMissing(Boolean(res.tableMissing));
      setLoading(false);
    });
  }, [userId, role]);

  function resetDraft() {
    setDraft({ title: "", description: "", category: "", price: "", currency: "USD", duration_minutes: "" });
    setEditingId(null);
  }

  function startEdit(s: ProviderServiceRow) {
    setEditingId(s.id);
    setDraft({
      title: s.title,
      description: s.description ?? "",
      category: s.category ?? "",
      price: String(s.price),
      currency: s.currency,
      duration_minutes: s.duration_minutes ? String(s.duration_minutes) : "",
    });
  }

  async function handleSave() {
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    const payload = {
      title: draft.title,
      description: draft.description,
      category: draft.category,
      price: Number(draft.price) || 0,
      currency: draft.currency,
      duration_minutes: draft.duration_minutes ? Number(draft.duration_minutes) : undefined,
    };
    const result = editingId && editingId !== "new"
      ? await updateProviderService(editingId, payload)
      : await createProviderService(role, payload);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      if (result.tableMissing) setTableMissing(true);
      return;
    }
    setSuccess(editingId === "new" ? "Service added." : "Service updated.");
    resetDraft();
    if (userId) {
      const res = await fetchProviderServices(userId, role);
      setServices(res.services);
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteProviderService(id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setServices((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) resetDraft();
  }

  if (tableMissing) {
    return (
      <DashboardEmpty
        title="Services table not set up"
        message="Run supabase/migrations/005_mvp_marketplace.sql in your Supabase SQL Editor to enable service listings."
        action={<Link href="/admin/setup" className="btn-primary px-5 py-2.5 text-sm">View setup guide</Link>}
      />
    );
  }

  return (
    <div className="space-y-5">
      <Panel title={`${roleLabel} services`} subtitle="Add real services — customers can pay via Stripe Checkout when they book your listed price">
        {loading ? (
          <p className="text-sm text-charcoal/50 py-4">Loading services…</p>
        ) : services.length === 0 && editingId !== "new" ? (
          <DashboardEmpty
            title="No services yet"
            message="Add your first service with a title, price, and description. Services appear on your provider profile."
            action={
              <button type="button" onClick={() => setEditingId("new")} className="btn-primary px-5 py-2.5 text-sm">
                Add first service
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-soft-200">
            {services.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-bold text-navy">{s.title}</p>
                  <p className="text-sm text-charcoal/55">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: s.currency }).format(Number(s.price))}
                    {s.category ? ` · ${s.category}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(s)} className="btn-outline px-3 py-1.5 text-xs">Edit</button>
                  <button type="button" onClick={() => handleDelete(s.id)} className="btn-outline px-3 py-1.5 text-xs text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(editingId === "new" || (editingId && editingId !== "new")) && (
          <div className="mt-4 space-y-3 rounded-xl border border-soft-200 bg-soft/50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Title</label>
                <input className="input" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
              </div>
              <div>
                <label className="label">Category</label>
                <input className="input" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} placeholder="e.g. Visa consultation" />
              </div>
              <div>
                <label className="label">Price</label>
                <input className="input" type="number" min="0" step="0.01" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} />
              </div>
              <div>
                <label className="label">Duration (minutes)</label>
                <input className="input" type="number" min="0" value={draft.duration_minutes} onChange={(e) => setDraft((d) => ({ ...d, duration_minutes: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-20" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            <div className="flex gap-2">
              <button type="button" disabled={saving} onClick={handleSave} className="btn-primary px-4 py-2 text-sm disabled:opacity-60">
                {saving ? "Saving…" : "Save service"}
              </button>
              <button type="button" onClick={resetDraft} className="btn-outline px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        )}

        {!editingId && services.length > 0 && (
          <button type="button" onClick={() => setEditingId("new")} className="mt-4 btn-outline px-4 py-2 text-sm">
            + Add service
          </button>
        )}
      </Panel>
    </div>
  );
}
