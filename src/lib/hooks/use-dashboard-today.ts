"use client";

import { useQuery } from "@tanstack/react-query";
import { boucherieV1 } from "@/lib/api";
import { unwrapDataObject } from "@/lib/api/unwrap";
import {
  dashboardTodaySchema,
  type DashboardToday,
} from "@/lib/schemas/dashboard-today";

export function useDashboardToday() {
  return useQuery({
    queryKey: ["dashboard", "today"],
    queryFn: async (): Promise<DashboardToday> => {
      const raw = unwrapDataObject(await boucherieV1.dashboard.today());
      return dashboardTodaySchema.parse(raw);
    },
    staleTime: 60_000,
  });
}
