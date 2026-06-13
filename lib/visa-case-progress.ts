import type { VisaCaseData } from "@/lib/supabase/payment-queries";

const DONE_STATUSES = new Set(["prepared", "uploaded", "reviewed"]);

function hasStoredFile(item: VisaCaseData["checklist"][number]): boolean {
  return Boolean(item.storagePath || item.fileUrl || item.fileName);
}

export function summarizeChecklistStatus(checklist: VisaCaseData["checklist"]) {
  const required = checklist.filter((d) => d.required !== false);
  const pool = required.length > 0 ? required : checklist;

  let pending = 0;
  let preparedOnly = 0;
  let uploaded = 0;
  let reviewed = 0;

  for (const item of pool) {
    if (item.status === "reviewed") {
      reviewed += 1;
      continue;
    }
    if (hasStoredFile(item) || item.status === "uploaded") {
      uploaded += 1;
      continue;
    }
    if (item.status === "prepared") {
      preparedOnly += 1;
      continue;
    }
    pending += 1;
  }

  return { pending, preparedOnly, uploaded, reviewed, total: pool.length };
}

export function computeCaseProgress(checklist: VisaCaseData["checklist"]) {
  const required = checklist.filter((d) => d.required !== false);
  const pool = required.length > 0 ? required : checklist;
  const total = pool.length || 1;
  const done = pool.filter((d) => DONE_STATUSES.has(d.status)).length;
  const uploaded = pool.filter(
    (d) => d.status === "reviewed" || (d.status === "uploaded" && hasStoredFile(d)) || hasStoredFile(d)
  ).length;

  let progressPercent = 15;
  if (total > 0) {
    progressPercent = 15 + Math.round((done / total) * 70);
  }
  if (done >= total && total > 0) {
    progressPercent = Math.max(progressPercent, 85);
  }

  let currentStep = "Upload required documents";
  let status = "documents_needed";

  if (done === 0) {
    currentStep = "Upload required documents";
    status = "documents_needed";
  } else if (done < total) {
    currentStep = "Continue preparing your documents";
    status = "documents_needed";
  } else {
    currentStep =
      uploaded > 0
        ? "Documents submitted — expert review next"
        : "Documents prepared — ready for expert review";
    status = "documents_uploaded";
  }

  return { progressPercent, currentStep, status, done, total, uploaded };
}
