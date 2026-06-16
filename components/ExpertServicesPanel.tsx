"use client";

import { useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { saveExpertServices } from "@/lib/supabase/agent-data";
import { newExpertService, type ExpertService } from "@/lib/expert-services";

export function ExpertServicesPanel({
  initialServices,
  onSaved,
}: {
  initialServices: ExpertService[];
  onSaved?: (services: ExpertService[]) => void;
}) {
  const servicesKey = initialServices.map((s) => s.id).join(",") || "empty";
  return (
    <ExpertServicesPanelInner
      key={servicesKey}
      initialServices={initialServices}
      onSaved={onSaved}
    />
  );
}

function ExpertServicesPanelInner({
  initialServices,
  onSaved,
}: {
  initialServices: ExpertService[];
  onSaved?: (services: ExpertService[]) => void;
}) {
  const [services, setServices] = useState<ExpertService[]>(initialServices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExpertService | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function startAdd() {
    const service = newExpertService();
    setDraft(service);
    setEditingId(service.id);
  }

  function startEdit(service: ExpertService) {
    setDraft({ ...service });
    setEditingId(service.id);
  }

  function cancelEdit() {
    setDraft(null);
    setEditingId(null);
  }

  async function persist(next: ExpertService[]) {
    setSaving(true);
    setError("");
    setSuccess(false);
    const result = await saveExpertServices(next);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setServices(result.data);
    onSaved?.(result.data);
    setSuccess(true);
    return true;
  }

  async function handleSaveDraft() {
    if (!draft?.name.trim()) {
      setError("Service name is required.");
      return;
    }
    const exists = services.some((s) => s.id === draft.id);
    const next = exists
      ? services.map((s) => (s.id === draft.id ? draft : s))
      : [...services, draft];
    const ok = await persist(next);
    if (ok) {
      setDraft(null);
      setEditingId(null);
    }
  }

  async function handleDelete(id: string) {
    const next = services.filter((s) => s.id !== id);
    await persist(next);
    if (editingId === id) cancelEdit();
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ Services saved successfully.
        </div>
      )}

      {services.length === 0 && !editingId && (
        <div className="card p-8 text-center">
          <p className="text-sm text-charcoal/55">No services listed yet. Add your first service and pricing.</p>
          <button type="button" onClick={startAdd} className="btn-primary mt-4 px-5 py-2.5 text-sm">
            + Add first service
          </button>
        </div>
      )}

      {services.map((s) =>
        editingId === s.id && draft ? (
          <ServiceEditor
            key={s.id}
            draft={draft}
            onChange={setDraft}
            onSave={handleSaveDraft}
            onCancel={cancelEdit}
            saving={saving}
          />
        ) : (
          <div key={s.id} className="card flex items-center justify-between p-5">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-navy">{s.name}</p>
                {s.popular && <span className="chip bg-gold/15 text-navy text-xs">Most popular</span>}
              </div>
              <p className="mt-0.5 text-sm text-charcoal/55">{s.desc || "No description"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold text-navy">{s.price || "—"}</span>
              <button
                type="button"
                disabled={saving}
                onClick={() => startEdit(s)}
                className="btn-outline px-3 py-1.5 text-xs disabled:opacity-60"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleDelete(s.id)}
                className="text-xs font-semibold text-red-500/80 hover:text-red-600 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        )
      )}

      {editingId && draft && !services.some((s) => s.id === editingId) && (
        <ServiceEditor
          draft={draft}
          onChange={setDraft}
          onSave={handleSaveDraft}
          onCancel={cancelEdit}
          saving={saving}
        />
      )}

      {services.length > 0 && !editingId && (
        <button
          type="button"
          disabled={saving}
          onClick={startAdd}
          className="btn-outline px-5 py-2.5 text-sm disabled:opacity-60"
        >
          + Add new service
        </button>
      )}

      <Disclaimer variant="inline" />
    </div>
  );
}

function ServiceEditor({
  draft,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  draft: ExpertService;
  onChange: (s: ExpertService) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Service name</label>
          <input
            className="input"
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Price</label>
          <input
            className="input"
            value={draft.price}
            onChange={(e) => onChange({ ...draft, price: e.target.value })}
            placeholder="e.g. $120"
          />
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input min-h-20"
          value={draft.desc}
          onChange={(e) => onChange({ ...draft, desc: e.target.value })}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-charcoal/70">
        <input
          type="checkbox"
          checked={draft.popular}
          onChange={(e) => onChange({ ...draft, popular: e.target.checked })}
          className="rounded border-soft-200"
        />
        Mark as most popular
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save service"}
        </button>
        <button type="button" disabled={saving} onClick={onCancel} className="btn-outline px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}
