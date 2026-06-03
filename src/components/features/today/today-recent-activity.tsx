"use client";

import { useTranslations } from "next-intl";
import {
  iconActivityDistribution,
  iconActivityReception,
  iconActivitySale,
  iconActivityVersement,
  iconSlaughterGroup,
} from "@/lib/icons";
import type { AppIcon } from "@/lib/icon-types";
import type { DashboardRecent } from "@/lib/schemas/dashboard-today";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<string, AppIcon> = {
  sale: iconActivitySale,
  reception: iconActivityReception,
  distribution: iconActivityDistribution,
  versement: iconActivityVersement,
  slaughter: iconSlaughterGroup,
};

function formatWhen(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function TodayRecentActivity({ items }: { items: DashboardRecent[] }) {
  const t = useTranslations("dashboard.today");

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">{t("recentTitle")}</h2>
      <ul className="space-y-2">
        {items.map((item) => {
          const Icon = KIND_ICON[item.kind] ?? iconActivitySale;
          return (
            <li
              key={`${item.kind}-${item.id}`}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-border/50 bg-card px-4 py-3 shadow-card",
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="text-xl" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug">
                  {t(`recent_${item.kind}`)}
                  {item.label ? (
                    <span className="text-muted-foreground"> — {item.label}</span>
                  ) : null}
                </p>
                {item.at ? (
                  <p className="text-xs text-muted-foreground">
                    {formatWhen(item.at)}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
