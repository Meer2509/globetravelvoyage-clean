"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  INTAKE_STATUS_STYLES,
  getIntakeStatusesForTable,
  rowsToCsv,
} from "@/lib/admin/intake-status";
import {
  updateAdminIntakeNotes,
  updateAdminIntakeStatus,
  type AdminIntakeTable,
} from "@/lib/admin/admin-intake-actions";
import type { AdminIntakeRow } from "@/lib/admin/fetch-intake";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const blob = new Blob([rowsToCsv(headers, rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminIntakeConsole({
  title,
  subtitle,
  table,
  initialRows,
  fetchError,
  primaryFields,
}: {
  title: string;
  subtitle: string;
  table: AdminIntakeTable;
  initialRows: AdminIntakeRow[];
  fetchError?: string;
  primaryFields: { label: string; key: string }[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const statusOptions = getIntakeStatusesForTable(table);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      const hay = JSON.stringify(r).toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, statusFilter]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleStatus(id: string, status: string) {
    setBusyId(id);
    const result = await updateAdminIntakeStatus(table, id, status);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    showToast("Status updated");
  }

  async function handleNotes(id: string, notes: string) {
    setBusyId(id);
    const result = await updateAdminIntakeNotes(table, id, notes);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, admin_notes: notes } : r)));
    showToast("Notes saved");
  }

  function exportCsv() {
    const headers = ["id", "status", "created_at", ...primaryFields.map((f) => f.key), "admin_notes"];
    const data = filtered.map((r) =>
      headers.map((h) => String(r[h] ?? r.admin_notes ?? ""))
    );
    downloadCsv(`${table}-export.csv`, headers, data);
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
                ← Command center
              </Link>
              <h1 className="mt-2 text-2xl font-extrabold text-navy">{title}</h1>
              <p className="mt-1 text-sm text-muted">{subtitle}</p>
            </div>
            <button type="button" onClick={exportCsv} className="btn-outline px-4 py-2 text-sm">
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="container-px py-8 space-y-4">
        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {fetchError}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="input flex-1 text-sm"
            placeholder="Search by name, email, destination…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input select text-sm min-w-[10rem]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-sm text-muted">
            {rows.length === 0 ? "No requests yet." : "No records match your filters."}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((row) => (
              <div key={row.id} className="card p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono text-charcoal/40">{row.id.slice(0, 8)}…</p>
                    <p className="mt-1 font-bold text-navy">
                      {String(row.full_name ?? row.subject ?? row.title ?? row.referral_code ?? "Request")}
                    </p>
                    <p className="text-xs text-muted">{formatDate(row.created_at)}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      INTAKE_STATUS_STYLES[row.status] ?? INTAKE_STATUS_STYLES.pending
                    }`}
                  >
                    {row.status}
                  </span>
                </div>

                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                  {primaryFields.map((f) => (
                    <div key={f.key}>
                      <dt className="text-xs text-charcoal/45">{f.label}</dt>
                      <dd className="font-medium text-navy break-all">
                        {String(row[f.key] ?? "—")}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-wrap items-center gap-3 border-t border-soft-200 pt-4">
                  <select
                    className="input select py-1.5 text-xs min-w-[9rem]"
                    value={row.status}
                    disabled={busyId === row.id}
                    onChange={(e) => handleStatus(row.id, e.target.value)}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input flex-1 text-xs"
                    placeholder="Internal admin notes…"
                    defaultValue={row.admin_notes ?? ""}
                    onBlur={(e) => {
                      if ((row.admin_notes ?? "") !== e.target.value) {
                        void handleNotes(row.id, e.target.value);
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
