"use client";

import { usePreferencesStore } from "@/lib/stores/preferences-store";
import { normalizeAppRole } from "@/lib/authz";
import { useAuthStore } from "@/lib/stores/auth-store";

/** Mode simplifié actif pour boucher et fournisseur uniquement. */
export function useSimpleMode(): boolean {
  const simpleMode = usePreferencesStore((s) => s.simpleMode);
  const role = useAuthStore((s) => s.user?.role);
  const appRole = normalizeAppRole(role);
  if (appRole === "admin") {
    return false;
  }
  return simpleMode;
}
