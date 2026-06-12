import { paymentServiceLabel } from "@/lib/payments-display";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";

function statusText(status: string) {
  if (status === "reviewed") return "Reviewed";
  if (status === "uploaded") return "Uploaded";
  if (status === "prepared") return "Prepared";
  return "Pending";
}

export function buildChecklistText(visaCase: VisaCaseData): string {
  const service = paymentServiceLabel(visaCase.serviceProductKey, visaCase.serviceName);
  const lines = [
    "Globe Travel Voyage — Visa Document Checklist",
    "===========================================",
    "",
    `Case number: ${visaCase.caseNumber}`,
    `Service: ${service}`,
    `Progress: ${visaCase.progressPercent}%`,
    "",
    "Documents:",
    ...visaCase.checklist.map(
      (d, i) =>
        `${i + 1}. ${d.name} [${d.required !== false ? "Required" : "Optional"}] — ${statusText(d.status)}`
    ),
    "",
    "Visa approval is never guaranteed. Globe Travel Voyage assists with preparation only.",
  ];
  return lines.join("\n");
}

export function downloadCaseChecklist(visaCase: VisaCaseData) {
  const text = buildChecklistText(visaCase);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${visaCase.caseNumber}-checklist.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function printCaseChecklist(visaCase: VisaCaseData) {
  const service = paymentServiceLabel(visaCase.serviceProductKey, visaCase.serviceName);
  const rows = visaCase.checklist
    .map(
      (d) =>
        `<tr><td>${d.name}</td><td>${d.required !== false ? "Required" : "Optional"}</td><td>${statusText(d.status)}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><title>${visaCase.caseNumber} Checklist</title>
<style>
body{font-family:Georgia,serif;color:#081c3a;padding:40px;max-width:720px;margin:0 auto}
h1{font-size:22px;margin:0 0 4px} .gold{color:#c9a227;font-size:12px;letter-spacing:2px;text-transform:uppercase}
table{width:100%;border-collapse:collapse;margin-top:24px} th,td{border:1px solid #e8ecf0;padding:10px;text-align:left;font-size:13px}
th{background:#f8f9fb}
</style></head><body>
<p class="gold">Globe Travel Voyage</p>
<h1>Visa Document Checklist</h1>
<p><strong>Case:</strong> ${visaCase.caseNumber}<br><strong>Service:</strong> ${service}</p>
<table><thead><tr><th>Document</th><th>Type</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
<p style="font-size:11px;color:#8896a8;margin-top:32px">Visa approval is never guaranteed.</p>
<script>window.onload=()=>window.print()</script></body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
