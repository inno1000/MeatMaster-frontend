"use client";

import { useTranslations } from "next-intl";
import { StatCard } from "@/components/shared/stat-card";
import {
  iconAdminButcheriesMetric,
  iconAdminDashboard,
  iconStatAlert,
  iconStatRevenue,
  iconStatSales,
  iconStatStock,
} from "@/lib/icons";
import type { DashboardToday } from "@/lib/schemas/dashboard-today";
import type { NavTone } from "@/lib/nav-tone";

type SummaryItem = {
  key: string;
  icon: typeof iconStatStock;
  value: React.ReactNode;
  label: string;
  tone?: NavTone;
};

function num(summary: Record<string, unknown>, key: string): number {
  const v = summary[key];
  return typeof v === "number" ? v : Number(v ?? 0);
}

export function TodaySummaryStrip({ data }: { data: DashboardToday }) {
  const t = useTranslations("dashboard.today");

  const items: SummaryItem[] = [];

  if (data.role === "butcher") {
    const s = data.summary;
    items.push(
      {
        key: "sales",
        icon: iconStatSales,
        value: num(s, "ventes_jour"),
        label: t("summarySalesToday"),
        tone: "amber",
      },
      {
        key: "revenue",
        icon: iconStatRevenue,
        value: `${num(s, "ca_jour").toLocaleString()} FCFA`,
        label: t("summaryRevenueToday"),
        tone: "wine",
      },
      {
        key: "alerts",
        icon: iconStatAlert,
        value: num(s, "alertes_stock"),
        label: t("summaryStockAlerts"),
        tone: "rust",
      },
      {
        key: "receptions",
        icon: iconStatStock,
        value: num(s, "receptions_en_attente"),
        label: t("summaryReceptionsPending"),
        tone: "ocean",
      },
    );
  } else if (data.role === "supplier") {
    const s = data.summary;
    items.push(
      {
        key: "animals",
        icon: iconStatStock,
        value: num(s, "animaux_en_attente"),
        label: t("summaryAnimalsPending"),
        tone: "rust",
      },
      {
        key: "versements",
        icon: iconStatRevenue,
        value: num(s, "versements_en_attente"),
        label: t("summaryVersementsPending"),
        tone: "sage",
      },
      {
        key: "distributions",
        icon: iconStatSales,
        value: num(s, "distributions_en_attente"),
        label: t("summaryDistributionsPending"),
        tone: "teal",
      },
    );
  } else {
    const s = data.summary;
    items.push(
      {
        key: "users",
        icon: iconAdminDashboard,
        value: num(s, "users_total"),
        label: t("summaryUsers"),
        tone: "plum",
      },
      {
        key: "butcheries",
        icon: iconAdminButcheriesMetric,
        value: num(s, "butcheries_total"),
        label: t("summaryButcheries"),
        tone: "ocean",
      },
      {
        key: "versements",
        icon: iconStatRevenue,
        value: num(s, "versements_en_attente"),
        label: t("summaryVersementsPending"),
        tone: "amber",
      },
    );
  }

  return (
    <div
      className={
        items.length >= 4
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
          : "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
      }
    >
      {items.map((item) => (
        <StatCard
          key={item.key}
          icon={item.icon}
          value={item.value}
          label={item.label}
          tone={item.tone}
        />
      ))}
    </div>
  );
}
