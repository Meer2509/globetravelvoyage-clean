import type { VisaCaseData } from "@/lib/supabase/payment-queries";

const DONE_STATUSES = new Set(["prepared", "uploaded", "reviewed"]);

export function computeCaseProgress(checklist: VisaCaseData["checklist"]) {
  const required = checklist.filter((d) => d.required !== false);
  const pool = required.length > 0 ? required : checklist;
  const total = pool.length || 1;
  const done = pool.filter((d) => DONE_STATUSES.has(d.status)).length;
  const uploaded = pool.filter((d) => d.status === "uploaded" || d.status === "reviewed").length;

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
