"use client";

import { useQuery } from "@tanstack/react-query";
import { boucherieV1 } from "@/lib/api";
import type { StatsParams } from "@/lib/api/services/boucherie-v1";
import { unwrapDataObject } from "@/lib/api/unwrap";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { UserRole } from "@/lib/schemas/auth";

export type StatsPeriode = NonNullable<StatsParams["periode"]>;

async function fetchStatsForRole(
  role: UserRole,
  periode: StatsPeriode,
): Promise<Record<string, unknown>> {
  const params = { periode };
  const raw =
    role === "admin"
      ? await boucherieV1.stats.admin(params)
      : role === "supplier"
        ? await boucherieV1.stats.fournisseur(params)
        : await boucherieV1.stats.boucher(params);
  return unwrapDataObject(raw);
}

export function useRoleStats(periode: StatsPeriode = "mois") {
  const role = useAuthStore((s) => s.user?.role ?? "butcher");
  return useQuery({
    queryKey: ["stats", role, periode],
    queryFn: () => fetchStatsForRole(role, periode),
  });
}
