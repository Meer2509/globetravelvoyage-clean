export function visaCaseWorkspacePath(caseId: string, section?: "documents" | "support"): string {
  const base = `/dashboard/visa-cases/${caseId}`;
  if (section === "documents") return `${base}#documents`;
  if (section === "support") return `${base}#support`;
  return base;
}
