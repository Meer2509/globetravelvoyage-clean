export function visaCaseWorkspacePath(caseId: string, section?: "documents" | "support"): string {
  const base = `/dashboard/visa-cases/${caseId}`;
  if (section === "documents") return `${base}#documents`;
  if (section === "support") return `${base}#support`;
  return base;
}

export function dashboardBillingPath(): string {
  return "/dashboard/billing";
}

export function dashboardSupportPath(caseId?: string): string {
  if (caseId) return visaCaseWorkspacePath(caseId, "support");
  return "/dashboard/support";
}

export function dashboardDocumentsPath(caseId: string): string {
  return visaCaseWorkspacePath(caseId, "documents");
}
