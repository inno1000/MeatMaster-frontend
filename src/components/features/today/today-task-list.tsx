"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { DashboardTask } from "@/lib/schemas/dashboard-today";
import { getSimpleMobileDockTabs } from "@/lib/simple-nav-config";
import type { UserRole } from "@/lib/schemas/auth";
const PRIORITY_CLASS: Record<DashboardTask["priority"], string> = {
  high: "border-destructive/35 bg-destructive/8",
  medium: "border-amber-500/35 bg-amber-500/10",
  low: "border-border/60 bg-card",
};

export function TodayTaskList({
  tasks,
  role,
  showQuickActions,
}: {
  tasks: DashboardTask[];
  role: UserRole;
  showQuickActions?: boolean;
}) {
  const t = useTranslations("dashboard.today");
  const tNav = useTranslations("nav");
  const priorityTasks = tasks.filter((task) => task.priority !== "low");
  const quickTabs = showQuickActions
    ? getSimpleMobileDockTabs(role).filter((tab) => tab.href !== "/dashboard")
    : [];

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-bold">{t("tasksTitle")}</h2>
        {priorityTasks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/60 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            {t("tasksEmpty")}
          </p>
        ) : (
          <ul className="space-y-3">
            {priorityTasks.map((task) => (
              <li key={task.id}>
                <Link
                  href={task.href as "/dashboard"}
                  className={cn(
                    "flex min-h-[4.25rem] items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-card transition-shadow hover:shadow-card-hover",
                    PRIORITY_CLASS[task.priority],
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">
                      {t(`task_${task.action}`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(`priority_${task.priority}`)}
                    </p>
                  </div>
                  {task.count > 0 ? (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-lg font-bold text-primary">
                      {task.count}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {quickTabs.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">{t("quickActionsTitle")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex min-h-[5rem] flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-card p-4 shadow-card transition-all hover:border-primary/30 hover:shadow-card-hover"
                >
                  <Icon className="text-3xl text-primary" aria-hidden />
                  <span className="text-center text-sm font-bold">
                    {tNav(tab.titleKey)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {tasks.some((t) => t.priority === "low") ? (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {t("optionalActions")}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {tasks
              .filter((task) => task.priority === "low")
              .map((task) => (
                <li key={task.id}>
                  <Link
                    href={task.href as "/dashboard"}
                    className="inline-flex rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-semibold hover:border-primary/30"
                  >
                    {t(`task_${task.action}`)}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
