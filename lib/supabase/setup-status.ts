"use server";

import { readFileSync } from "fs";
import { join } from "path";
import { checkDatabaseHealth } from "./database-health";

export interface SupabaseSetupStatus {
  hasSupabaseJs: boolean;
  hasSupabaseSsr: boolean;
  hasStripe: boolean;
  schemaExecuted: boolean;
  tablesFound: string[];
  rlsStatus: "done" | "partial" | "todo";
}

const CORE_TABLES = [
  "profiles",
  "user_roles",
  "visa_experts",
  "visa_applications",
  "reviews",
  "lead_requests",
];

function readPackageDeps(): { hasSupabaseJs: boolean; hasSupabaseSsr: boolean; hasStripe: boolean } {
  try {
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf8");
    const pkg = JSON.parse(raw) as { dependencies?: Record<string, string> };
    const deps = pkg.dependencies ?? {};
    return {
      hasSupabaseJs: Boolean(deps["@supabase/supabase-js"]),
      hasSupabaseSsr: Boolean(deps["@supabase/ssr"]),
      hasStripe: Boolean(deps["stripe"]),
    };
  } catch {
    return { hasSupabaseJs: false, hasSupabaseSsr: false, hasStripe: false };
  }
}

export async function getSupabaseSetupStatus(): Promise<SupabaseSetupStatus> {
  const packages = readPackageDeps();
  const health = await checkDatabaseHealth();

  const tablesFound = CORE_TABLES.filter((table) => {
    if (table === "profiles") return health.tables.profiles;
    if (table === "user_roles") return health.tables.user_roles;
    if (table === "visa_experts") return health.tables.visa_experts;
    return health.ok;
  });

  const schemaExecuted = health.tables.profiles && health.tables.user_roles;
  const rlsStatus: SupabaseSetupStatus["rlsStatus"] = health.ok
    ? "done"
    : schemaExecuted
      ? "partial"
      : "todo";

  return {
    ...packages,
    schemaExecuted,
    tablesFound,
    rlsStatus,
  };
}
