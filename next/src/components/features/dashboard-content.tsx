"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  AlertTriangle,
  Beef,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";

const MEAT_TYPES = [
  { name: "Bœuf", stock: 45, unit: "kg", status: "normal" as const },
  { name: "Mouton", stock: 23, unit: "kg", status: "low" as const },
  { name: "Chèvre", stock: 12, unit: "kg", status: "critical" as const },
  { name: "Poulet", stock: 67, unit: "kg", status: "normal" as const },
];

const RECENT = [
  {
    type: "reception",
    meat: "Bœuf",
    quantity: "25 kg",
    time: "10:30",
    status: "success",
  },
  {
    type: "vente",
    meat: "Mouton",
    quantity: "8 kg",
    time: "11:15",
    status: "success",
  },
  {
    type: "versement",
    meat: "150,000 FCFA",
    quantity: "",
    time: "14:20",
    status: "pending",
  },
  {
    type: "reception",
    meat: "Poulet",
    quantity: "30 kg",
    time: "16:45",
    status: "success",
  },
];

export const DashboardContent = () => {
  const t = useTranslations("dashboard");
  const role = useAuthStore((s) => s.user?.role ?? "butcher");

  const stats = useMemo(() => {
    const totalStock = MEAT_TYPES.reduce((acc, m) => acc + m.stock, 0);
    const alerts = MEAT_TYPES.filter(
      (m) => m.status === "low" || m.status === "critical",
    ).length;
    return {
      totalStock,
      alerts,
      todaySales: 45,
      todayRevenue: 275000,
    };
  }, []);

  const statusClass = (status: (typeof MEAT_TYPES)[number]["status"]) => {
    if (status === "normal") {
      return "bg-emerald-500/15 text-emerald-800";
    }
    if (status === "low") {
      return "bg-amber-500/15 text-amber-900";
    }
    return "bg-red-500/15 text-red-900";
  };

  const statusLabel = (status: (typeof MEAT_TYPES)[number]["status"]) => {
    if (status === "normal") {
      return t("statusNormal");
    }
    if (status === "low") {
      return t("statusLow");
    }
    return t("statusCritical");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-card p-6 text-center shadow-card ring-1 ring-black/[0.02] transition-shadow duration-200 hover:shadow-md">
          <Package className="mx-auto size-10 text-primary" aria-hidden />
          <p className="mt-3 text-3xl font-bold">{stats.totalStock}</p>
          <p className="text-sm text-muted-foreground">{t("totalStockKg")}</p>
          <p className="mt-2 text-xs font-medium text-primary">{t("tagMonth")}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-6 text-center shadow-card ring-1 ring-black/[0.02] transition-shadow duration-200 hover:shadow-md">
          <AlertTriangle
            className="mx-auto size-10 text-amber-600"
            aria-hidden
          />
          <p className="mt-3 text-3xl font-bold text-amber-700">
            {stats.alerts}
          </p>
          <p className="text-sm text-muted-foreground">{t("alerts")}</p>
          <p className="mt-2 text-xs font-medium text-amber-800">
            {t("tagAttention")}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-6 text-center shadow-card ring-1 ring-black/[0.02] transition-shadow duration-200 hover:shadow-md">
          <Beef className="mx-auto size-10 text-emerald-600" aria-hidden />
          <p className="mt-3 text-3xl font-bold text-emerald-700">
            {stats.todaySales}
          </p>
          <p className="text-sm text-muted-foreground">{t("salesToday")}</p>
          <p className="mt-2 text-xs font-medium text-emerald-800">
            {t("tagVsYesterday")}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-6 text-center shadow-card ring-1 ring-black/[0.02] transition-shadow duration-200 hover:shadow-md">
          <DollarSign className="mx-auto size-10 text-sky-600" aria-hidden />
          <p className="mt-3 text-3xl font-bold text-sky-800">
            {stats.todayRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">{t("revenueFcfa")}</p>
          <p className="mt-2 text-xs font-medium text-sky-900">
            {t("tagMonthRev")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ParentCard title={t("stockOverview")} subtitle={t("stockOverviewHint")}>
            <ul className="divide-y divide-border/80 overflow-hidden rounded-xl border border-border/70 bg-muted/20">
              {MEAT_TYPES.map((m) => (
                <li
                  key={m.name}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Beef className="size-5 text-primary" aria-hidden />
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {m.stock} {m.unit}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      statusClass(m.status),
                    )}
                  >
                    {statusLabel(m.status)}
                  </span>
                </li>
              ))}
            </ul>
          </ParentCard>
        </div>

        <div className="space-y-6">
          <ParentCard title={t("recentActivity")}>
            <ul className="space-y-3">
              {RECENT.map((a, i) => (
                <li
                  key={`${a.type}-${i}`}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <span className="font-medium capitalize">{a.type}</span>
                  <span className="text-right text-muted-foreground">
                    {a.meat} {a.quantity && `· ${a.quantity}`}
                    <span className="block text-xs">{a.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          </ParentCard>

          <ParentCard title={t("quickActions")}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {role === "butcher" ? (
                <>
                  <Link
                    href="/stock/reception"
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <TrendingUp className="size-4" aria-hidden />
                    {t("reception")}
                  </Link>
                  <Link
                    href="/vente/enregistrer"
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <DollarSign className="size-4" aria-hidden />
                    {t("sale")}
                  </Link>
                  <Link
                    href="/versement/enregistrer"
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Package className="size-4" aria-hidden />
                    {t("payment")}
                  </Link>
                  <Link
                    href="/stock/journal"
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Package className="size-4" aria-hidden />
                    {t("journal")}
                  </Link>
                </>
              ) : role === "supplier" ? (
                <>
                  <Link
                    href="/abattage/enregistrer"
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Beef className="size-4" aria-hidden />
                    {t("slaughterAction")}
                  </Link>
                  <Link
                    href="/versement/liste"
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Package className="size-4" aria-hidden />
                    {t("validationAction")}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/admin/platform"
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Package className="size-4" aria-hidden />
                    {t("adminPlatformAction")}
                  </Link>
                  <Link
                    href="/admin/users"
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Package className="size-4" aria-hidden />
                    {t("adminUsersAction")}
                  </Link>
                </>
              )}
            </div>
          </ParentCard>
        </div>
      </div>
    </div>
  );
};
