"use client";

import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { TodayOnboardingBanner } from "@/components/features/today/today-onboarding-banner";
import { TodayRecentActivity } from "@/components/features/today/today-recent-activity";
import { TodaySummaryStrip } from "@/components/features/today/today-summary-strip";
import { TodayTaskList } from "@/components/features/today/today-task-list";
import { useDashboardToday } from "@/lib/hooks/use-dashboard-today";
import { useAuthStore } from "@/lib/stores/auth-store";
import { normalizeAppRole } from "@/lib/authz";
import { formatError } from "@/lib/format-error";
import type { UserRole } from "@/lib/schemas/auth";

export function TodayHub() {
  const t = useTranslations("dashboard");
  const query = useDashboardToday();
  const user = useAuthStore((s) => s.user);
  const appRole = normalizeAppRole(user?.role) as UserRole;
  const showQuickActions = appRole !== "admin";
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "";

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        greeting={displayName ? t("greeting", { name: displayName }) : undefined}
      />

      {appRole !== "admin" ? <TodayOnboardingBanner role={appRole} /> : null}

      {query.isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      ) : null}

      {query.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{formatError(query.error)}</AlertDescription>
        </Alert>
      ) : null}

      {query.data ? (
        <>
          <TodaySummaryStrip data={query.data} />
          <TodayTaskList
            tasks={query.data.tasks}
            role={appRole}
            showQuickActions={showQuickActions}
          />
          <TodayRecentActivity items={query.data.recent} />
        </>
      ) : null}
    </div>
  );
}
