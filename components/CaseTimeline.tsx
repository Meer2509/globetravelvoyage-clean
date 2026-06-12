"use client";

import { TimelineItem } from "@/components/DashboardLayout";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";

type StepState = "done" | "active" | "upcoming";

function stepFor(
  key: string,
  visaCase: VisaCaseData
): StepState {
  const required = visaCase.checklist.filter((d) => d.required !== false);
  const pool = required.length > 0 ? required : visaCase.checklist;
  const done = pool.filter((d) => ["prepared", "uploaded", "reviewed"].includes(d.status)).length;
  const allDone = pool.length > 0 && done >= pool.length;
  const hasUpload = pool.some((d) => d.status === "uploaded" || d.status === "reviewed");
  const status = visaCase.status;

  switch (key) {
    case "payment":
      return visaCase.paymentStatus === "paid" ? "done" : "active";
    case "created":
      return "done";
    case "requested":
      if (allDone) return "done";
      return done === 0 ? "active" : "done";
    case "prepared":
      if (allDone) return "done";
      return done > 0 ? "active" : "upcoming";
    case "review":
      if (["under_review", "expert_assigned", "prep_in_progress"].includes(status)) return "active";
      if (["ready_for_submission", "completed"].includes(status)) return "done";
      return allDone && hasUpload ? "active" : "upcoming";
    case "next":
      if (["ready_for_submission", "completed"].includes(status)) return "active";
      return "upcoming";
    default:
      return "upcoming";
  }
}

const STEPS = [
  { key: "payment", title: "Payment confirmed" },
  { key: "created", title: "Case created" },
  { key: "requested", title: "Documents requested" },
  { key: "prepared", title: "Documents prepared or uploaded" },
  { key: "review", title: "Expert review" },
  { key: "next", title: "Ready for next step" },
];

export function CaseTimeline({ visaCase }: { visaCase: VisaCaseData }) {
  return (
    <div className="space-y-1">
      {STEPS.map((step, i) => (
        <TimelineItem
          key={step.key}
          title={step.title}
          date=""
          status={stepFor(step.key, visaCase)}
          last={i === STEPS.length - 1}
        />
      ))}
    </div>
  );
}
