"use client";

import { useEffect, useState } from "react";
import { fetchDashboardUser, type DashboardUserResult } from "@/lib/supabase/queries";
import { getInitials } from "@/lib/supabase/profile-utils";
import { ROLE_LABELS } from "@/lib/auth";
import type { UserRole } from "@/lib/supabase/types";

export interface DashboardUserState {
  loading: boolean;
  result: DashboardUserResult | null;
  displayName: string;
  email: string;
  initials: string;
  roleLabel: string;
  role: UserRole;
  completion: number;
  missingFields: string[];
  verified: boolean;
  setupMessage: string | null;
}

const FALLBACK: DashboardUserState = {
  loading: false,
  result: null,
  displayName: "Your Account",
  email: "",
  initials: "GT",
  roleLabel: "Traveler",
  role: "customer",
  completion: 0,
  missingFields: [],
  verified: false,
  setupMessage: null,
};

export function useDashboardUser(): DashboardUserState {
  const [state, setState] = useState<DashboardUserState>({ ...FALLBACK, loading: true });

  useEffect(() => {
    fetchDashboardUser().then((result) => {
      if (!result.ok) {
        setState({
          ...FALLBACK,
          loading: false,
          result,
          setupMessage:
            result.reason === "table_missing" || result.reason === "not_configured"
              ? result.message
              : null,
        });
        return;
      }

      const name = result.profile.full_name?.trim() || "Your Account";
      setState({
        loading: false,
        result,
        displayName: name,
        email: result.profile.email,
        initials: getInitials(name),
        roleLabel: ROLE_LABELS[result.role] ?? "Traveler",
        role: result.role,
        completion: result.completion,
        missingFields: result.missingFields,
        verified: result.visaExpert?.verification_status === "verified",
        setupMessage: null,
      });
    });
  }, []);

  return state;
}
