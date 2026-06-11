"use server";

import { readFileSync } from "fs";
import { join } from "path";
import { createAdminClient, isAdminClientConfigured } from "./admin";
import { isDatabaseSetupError } from "./profile-utils";

export interface SupabaseSetupStatus {
  hasSupabaseJs: boolean;
  hasSupabaseSsr: boolean;
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

function readPackageDeps(): { hasSupabaseJs: boolean; hasSupabaseSsr: boolean } {
  try {
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf8");
    const pkg = JSON.parse(raw) as { dependencies?: Record<string, string> };
    const deps = pkg.dependencies ?? {};
    return {
      hasSupabaseJs: Boolean(deps["@supabase/supabase-js"]),
      hasSupabaseSsr: Boolean(deps["@supabase/ssr"]),
    };
  } catch {
    return { hasSupabaseJs: false, hasSupabaseSsr: false };
  }
}

export async function getSupabaseSetupStatus(): Promise<SupabaseSetupStatus> {
  const packages = readPackageDeps();
  const tablesFound: string[] = [];

  if (!isAdminClientConfigured) {
    return {
      ...packages,
      schemaExecuted: false,
      tablesFound,
      rlsStatus: "todo",
    };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      ...packages,
      schemaExecuted: false,
      tablesFound,
      rlsStatus: "todo",
    };
  }

  for (const table of CORE_TABLES) {
    const { error } = await admin.from(table).select("id", { head: true, count: "exact" });
    if (!error) {
      tablesFound.push(table);
      continue;
    }
    if (!isDatabaseSetupError(error)) {
      tablesFound.push(table);
    }
  }

  const schemaExecuted = tablesFound.includes("profiles");
  const rlsStatus: SupabaseSetupStatus["rlsStatus"] = schemaExecuted
    ? tablesFound.length >= CORE_TABLES.length
      ? "done"
      : "partial"
    : "todo";

  return {
    ...packages,
    schemaExecuted,
    tablesFound,
    rlsStatus,
  };
}
