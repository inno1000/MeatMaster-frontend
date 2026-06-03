"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/schemas/auth";
import { getSimpleMobileDockTabs } from "@/lib/simple-nav-config";

export function DashboardSimpleShortcuts({ role }: { role: UserRole }) {
  const tSimple = useTranslations("simple");
  const tNav = useTranslations("nav");
  const tabs = getSimpleMobileDockTabs(role).filter((tab) => tab.href !== "/dashboard");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{tSimple("dashboardShortcuts")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-[7rem] flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card p-6 shadow-card transition-all hover:border-primary/35 hover:shadow-card-hover max-md:rounded-3xl",
              )}
            >
              <Icon className="text-5xl text-primary" aria-hidden />
              <span className="text-xl font-bold">{tNav(tab.titleKey)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
