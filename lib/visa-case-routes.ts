import { customerDashboardPath } from "@/lib/dashboard-routes";

export function visaCaseWorkspacePath(caseId: string, section?: "documents" | "support"): string {
  const base = `/dashboard/visa-cases/${caseId}`;
  if (section === "documents") return `${base}?section=documents`;
  if (section === "support") return `${base}?section=support`;
  return base;
}

export function dashboardBillingPath(): string {
  return customerDashboardPath("payments");
}

export function dashboardPaymentsPath(): string {
  return customerDashboardPath("payments");
}

export function dashboardSupportPath(_caseId?: string): string {
  void _caseId;
  return customerDashboardPath("support");
}

export function dashboardDocumentsPath(caseId?: string): string {
  if (caseId) return visaCaseWorkspacePath(caseId, "documents");
  return customerDashboardPath("documents");
}

export function dashboardVisaCasesPath(): string {
  return customerDashboardPath("visa-cases");
}
