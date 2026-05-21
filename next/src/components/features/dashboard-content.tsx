"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  Beef,
  Clock,
  DollarSign,
  Inbox,
  ListOrdered,
  Package,
  Settings,
  Share2,
  ShoppingCart,
  Users,
  Warehouse,
  Wallet,
  Zap,
  ScrollText,
} from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { NavTone } from "@/lib/nav-tone";
import {
  navToneCardHoverClass,
} from "@/lib/nav-tone";
import { useAuthStore } from "@/lib/stores/auth-store";
import { boucherieV1 } from "@/lib/api";
import { unwrapDataArray, unwrapPaginatedRows } from "@/lib/api/unwrap";
import { Skeleton } from "@/components/ui/skeleton";

function localIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseTimeMs(value: string): number {
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : 0;
}

function formatActivityLabel(iso: string): string {
  if (!iso) {
    return "—";
  }
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) {
    return iso;
  }
  return new Date(t).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type StockRow = {
  id: string;
  name: string;
  qty: number;
  unit: string;
  status: "normal" | "critical";
};

type ActivityKind = "sale" | "reception" | "distribution" | "versement";

type ActivityItem = {
  key: string;
  kind: ActivityKind;
  kindLabel: string;
  detail: string;
  when: string;
};

const ACTIVITY_ICONS: Record<ActivityKind, LucideIcon> = {
  sale: ShoppingCart,
  reception: Inbox,
  distribution: Share2,
  versement: Wallet,
};

const ACTIVITY_ROW_CLASS: Record<ActivityKind, string> = {
  sale: "bg-zone-amber/16 text-zone-amber",
  reception: "bg-zone-ocean/16 text-zone-ocean",
  distribution: "bg-zone-teal/16 text-zone-teal",
  versement: "bg-zone-sage/16 text-zone-sage",
};

const quickLinkBase =
  "flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export const DashboardContent = () => {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const role = useAuthStore((s) => s.user?.role ?? "butcher");

  const today = useMemo(() => localIsoDate(new Date()), []);
  const from7d = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return localIsoDate(d);
  }, []);

  const butcherQuery = useQuery({
    queryKey: ["dashboard", "butcher", today, from7d],
    enabled: role === "butcher",
    queryFn: async () => {
      const [stRaw, vTodayRaw, rRaw, vWeekRaw] = await Promise.all([
        boucherieV1.stocks.list(),
        boucherieV1.ventes.list({ date_debut: today, date_fin: today }),
        boucherieV1.receptions.list(),
        boucherieV1.ventes.list({ date_debut: from7d, date_fin: today }),
      ]);
      return {
        stocks: unwrapDataArray(stRaw),
        ventesToday: unwrapDataArray(vTodayRaw),
        receptions: unwrapDataArray(rRaw),
        ventesWeek: unwrapDataArray(vWeekRaw),
      };
    },
  });

  const supplierQuery = useQuery({
    queryKey: ["dashboard", "supplier"],
    enabled: role === "supplier",
    queryFn: async () => {
      const [abattagesRaw, achatsRaw, distRaw, verseRaw] = await Promise.all([
        boucherieV1.abattages.list(),
        boucherieV1.achatsFournisseurs.list(),
        boucherieV1.distributions.list(),
        boucherieV1.versements.list(),
      ]);
      return {
        abattages: unwrapDataArray(abattagesRaw),
        achats: unwrapDataArray(achatsRaw),
        distributions: unwrapDataArray(distRaw),
        versementsAll: unwrapDataArray(verseRaw),
      };
    },
  });

  const adminQuery = useQuery({
    queryKey: ["dashboard", "admin"],
    enabled: role === "admin",
    queryFn: async () => {
      const [uRaw, bRaw] = await Promise.all([
        boucherieV1.users.list(),
        boucherieV1.boucheries.list(),
      ]);
      const usersPaginated = unwrapPaginatedRows(uRaw);
      const boucheriesPaginated = unwrapPaginatedRows(bRaw);
      return {
        usersTotal: usersPaginated.total,
        boucheriesTotal: boucheriesPaginated.total,
      };
    },
  });

  const butcherMetrics = useMemo(() => {
    if (!butcherQuery.data) {
      return null;
    }
    const stocks = butcherQuery.data.stocks;
    let totalKg = 0;
    let alerts = 0;
    const rows: StockRow[] = [];
    for (const item of stocks) {
      const row = item as Record<string, unknown>;
      const produit = (row.produit ?? {}) as Record<string, unknown>;
      const qty = Number(row.quantite ?? 0);
      const seuil = Number(row.seuil_alerte ?? 0);
      const enAlerte = Boolean(row.en_alerte ?? (seuil > 0 && qty <= seuil));
      totalKg += qty;
      const status: StockRow["status"] = enAlerte ? "critical" : "normal";
      if (status !== "normal") {
        alerts += 1;
      }
      rows.push({
        id: String(row.id ?? ""),
        name: String(produit.nom ?? "").trim() || tCommon("noLabel"),
        qty,
        unit: String(produit.unite ?? "kg"),
        status,
      });
    }

    const ventesToday = butcherQuery.data.ventesToday;
    let salesCount = 0;
    let revenue = 0;
    for (const item of ventesToday) {
      const row = item as Record<string, unknown>;
      const statut = String(row.statut ?? "");
      if (statut === "annulee") {
        continue;
      }
      salesCount += 1;
      revenue += Number(row.montant_total ?? 0);
    }

    return {
      totalKg,
      alerts,
      salesCount,
      revenue,
      stockRows: rows,
    };
  }, [butcherQuery.data, tCommon]);

  const butcherActivity = useMemo((): ActivityItem[] => {
    if (!butcherQuery.data) {
      return [];
    }
    const items: ActivityItem[] = [];
    for (const item of butcherQuery.data.ventesWeek) {
      const row = item as Record<string, unknown>;
      const client = (row.client ?? {}) as Record<string, unknown>;
      const when = String(row.created_at ?? row.date_vente ?? "");
      items.push({
        key: `v-${String(row.id ?? when)}`,
        kind: "sale",
        kindLabel: t("activitySale"),
        detail: `${String(client.nom ?? client.name ?? "—")} · ${Number(row.montant_total ?? 0).toLocaleString()} FCFA`,
        when,
      });
    }
    for (const item of butcherQuery.data.receptions) {
      const row = item as Record<string, unknown>;
      const when = String(row.created_at ?? row.date_reception ?? "");
      items.push({
        key: `r-${String(row.id ?? when)}`,
        kind: "reception",
        kindLabel: t("activityReception"),
        detail: `${Number(row.quantite_recue ?? 0)} kg`,
        when,
      });
    }
    return items
      .sort((a, b) => parseTimeMs(b.when) - parseTimeMs(a.when))
      .slice(0, 12)
      .filter((i) => i.when);
  }, [butcherQuery.data, t]);

  const supplierMetrics = useMemo(() => {
    if (!supplierQuery.data) {
      return null;
    }
    let pendingVersements = 0;
    for (const item of supplierQuery.data.versementsAll) {
      const row = item as Record<string, unknown>;
      if (String(row.statut ?? "") === "en_attente") {
        pendingVersements += 1;
      }
    }
    return {
      abattagesCount: supplierQuery.data.abattages.length,
      achatsCount: supplierQuery.data.achats.length,
      distributionsCount: supplierQuery.data.distributions.length,
      pendingVersements,
    };
  }, [supplierQuery.data]);

  const supplierActivity = useMemo((): ActivityItem[] => {
    if (!supplierQuery.data) {
      return [];
    }
    const items: ActivityItem[] = [];
    for (const item of supplierQuery.data.abattages) {
      const row = item as Record<string, unknown>;
      const when = String(row.date_abattage ?? row.created_at ?? "");
      items.push({
        key: `a-${String(row.id ?? when)}`,
        kind: "distribution",
        kindLabel: t("slaughterAction"),
        detail: `${Number(row.poids_carcasse_kg ?? 0)} kg`,
        when,
      });
    }
    for (const item of supplierQuery.data.distributions) {
      const row = item as Record<string, unknown>;
      const when = String(row.created_at ?? row.updated_at ?? "");
      items.push({
        key: `d-${String(row.id ?? when)}`,
        kind: "distribution",
        kindLabel: t("activityDistribution"),
        detail: String(row.statut ?? ""),
        when,
      });
    }
    for (const item of supplierQuery.data.versementsAll) {
      const row = item as Record<string, unknown>;
      const when = String(row.date_versement ?? row.created_at ?? "");
      items.push({
        key: `p-${String(row.id ?? when)}`,
        kind: "versement",
        kindLabel: t("activityVersement"),
        detail: `${Number(row.montant ?? 0).toLocaleString()} FCFA · ${String(row.statut ?? "")}`,
        when,
      });
    }
    return items
      .sort((a, b) => parseTimeMs(b.when) - parseTimeMs(a.when))
      .slice(0, 12)
      .filter((i) => i.when);
  }, [supplierQuery.data, t]);

  const statusClass = (status: StockRow["status"]) => {
    if (status === "normal") {
      return "bg-accent/20 text-accent-foreground";
    }
    return "bg-destructive/15 text-destructive";
  };

  const statusLabel = (status: StockRow["status"]) => {
    if (status === "normal") {
      return t("statusNormal");
    }
    return t("statusCritical");
  };

  const statsLoading =
    (role === "butcher" && butcherQuery.isPending) ||
    (role === "supplier" && supplierQuery.isPending) ||
    (role === "admin" && adminQuery.isPending);

  const showStats =
    !statsLoading &&
    !(role === "butcher" && butcherQuery.isError) &&
    !(role === "supplier" && supplierQuery.isError) &&
    !(role === "admin" && adminQuery.isError) &&
    ((role === "butcher" && butcherMetrics !== null) ||
      (role === "supplier" && supplierMetrics !== null) ||
      (role === "admin" && adminQuery.data !== undefined));

  const statsCards: Array<{
    key: string;
    icon: LucideIcon;
    value: string | number;
    valueClass: string;
    label: string;
    tag: string;
    tagClass: string;
    iconClass: string;
    tone: NavTone;
  }> =
    role === "butcher" && butcherMetrics
      ? [
          {
            key: "stock",
            icon: Package,
            value: Math.round(butcherMetrics.totalKg * 100) / 100,
            valueClass: "text-zone-sage",
            label: t("totalStockKg"),
            tag: t("stockQuantityHint"),
            tagClass: "text-muted-foreground",
            iconClass: "text-zone-sage",
            tone: "sage",
          },
          {
            key: "alerts",
            icon: AlertTriangle,
            value: butcherMetrics.alerts,
            valueClass: "text-zone-amber",
            label: t("alerts"),
            tag: t("alertThresholdHint"),
            tagClass: "text-zone-amber/90",
            iconClass: "text-zone-amber",
            tone: "amber",
          },
          {
            key: "sales",
            icon: Beef,
            value: butcherMetrics.salesCount,
            valueClass: "text-zone-amber",
            label: t("salesToday"),
            tag: t("periodToday"),
            tagClass: "text-zone-amber/85",
            iconClass: "text-zone-amber",
            tone: "amber",
          },
          {
            key: "revenue",
            icon: DollarSign,
            value: butcherMetrics.revenue.toLocaleString(),
            valueClass: "text-zone-ocean",
            label: t("revenueFcfa"),
            tag: t("periodToday"),
            tagClass: "text-zone-ocean/90",
            iconClass: "text-zone-ocean",
            tone: "ocean",
          },
        ]
      : role === "supplier" && supplierMetrics
        ? [
            {
              key: "abattages",
              icon: Beef,
              value: supplierMetrics.abattagesCount,
              valueClass: "text-zone-rust",
              label: tNav("slaughterList"),
              tag: t("distributionsHint"),
              tagClass: "text-muted-foreground",
              iconClass: "text-zone-rust",
              tone: "rust",
            },
            {
              key: "achats",
              icon: ShoppingCart,
              value: supplierMetrics.achatsCount,
              valueClass: "text-zone-amber",
              label: tNav("slaughterPurchase"),
              tag: t("distributionsHint"),
              tagClass: "text-muted-foreground",
              iconClass: "text-zone-amber",
              tone: "amber",
            },
            {
              key: "distributions",
              icon: Package,
              value: supplierMetrics.distributionsCount,
              valueClass: "text-zone-ocean",
              label: tNav("slaughterGroup"),
              tag: t("distributionsHint"),
              tagClass: "text-zone-ocean/90",
              iconClass: "text-zone-ocean",
              tone: "ocean",
            },
            {
              key: "payments",
              icon: DollarSign,
              value: supplierMetrics.pendingVersements,
              valueClass: "text-zone-plum",
              label: tNav("paymentsGroup"),
              tag: t("versementsPendingHint"),
              tagClass: "text-muted-foreground",
              iconClass: "text-zone-plum",
              tone: "plum",
            },
          ]
        : role === "admin" && adminQuery.data
          ? [
              {
                key: "users",
                icon: Users,
                value: adminQuery.data.usersTotal,
                valueClass: "text-zone-plum",
                label: t("metricUsers"),
                tag: t("metricUsersHint"),
                tagClass: "text-muted-foreground",
                iconClass: "text-zone-plum",
                tone: "plum",
              },
              {
                key: "boucheries",
                icon: Warehouse,
                value: adminQuery.data.boucheriesTotal,
                valueClass: "text-zone-clay",
                label: t("metricButcheries"),
                tag: t("metricButcheriesHint"),
                tagClass: "text-muted-foreground",
                iconClass: "text-zone-clay",
                tone: "clay",
              },
            ]
          : [];

  const activityItems =
    role === "butcher"
      ? butcherActivity
      : role === "supplier"
        ? supplierActivity
        : [];

  const showStockOverview =
    role === "butcher" &&
    !butcherQuery.isError &&
    Boolean(butcherMetrics?.stockRows.length);

  const showActivity = activityItems.length > 0;

  const statsSkeletonCount = role === "admin" ? 2 : 4;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
      </div>

      {statsLoading ? (
        <div
          className={cn(
            "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4",
            statsSkeletonCount >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-2",
          )}
        >
          {Array.from({ length: statsSkeletonCount }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="rounded-2xl border border-border/70 bg-card p-6"
            >
              <Skeleton className="mx-auto size-10 rounded-full" />
              <Skeleton className="mx-auto mt-3 h-9 w-24" />
              <Skeleton className="mx-auto mt-2 h-4 w-40" />
              <Skeleton className="mx-auto mt-2 h-3 w-28" />
            </div>
          ))}
        </div>
      ) : null}

      {showStats && statsCards.length > 0 ? (
        <div
          className={cn(
            "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4",
            statsCards.length >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-2",
          )}
        >
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className={cn(
                  "rounded-2xl border border-border/70 bg-card p-6 text-center transition-colors duration-200",
                  navToneCardHoverClass[card.tone],
                )}
              >
                <Icon className={cn("mx-auto size-10", card.iconClass)} aria-hidden />
                <p className={cn("mt-3 text-3xl font-bold", card.valueClass)}>
                  {card.value}
                </p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className={cn("mt-2 text-xs font-medium", card.tagClass)}>{card.tag}</p>
              </div>
            );
          })}
        </div>
      ) : null}

      <div
        className={cn(
          "grid gap-6",
          showStockOverview ? "lg:grid-cols-3" : "",
        )}
      >
        {showStockOverview && butcherMetrics ? (
          <div className="lg:col-span-2">
            <ParentCard
              title={t("stockOverview")}
              subtitle={t("stockOverviewHint")}
              titleIcon={Warehouse}
            >
              <ul className="divide-y divide-border/80 overflow-hidden rounded-xl border border-border/70 bg-muted/20">
                {butcherMetrics.stockRows.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zone-sage/15 text-zone-sage">
                        <Package className="size-[1.125rem]" aria-hidden />
                      </span>
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {m.qty} {m.unit}
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
        ) : null}

        <div
          className={cn(
            "space-y-6",
            !showStockOverview ? "lg:col-span-full max-w-4xl" : "",
          )}
        >
          {role !== "admin" && showActivity ? (
            <ParentCard title={t("recentActivity")} titleIcon={Clock}>
              <ul className="space-y-3">
                {activityItems.map((a) => {
                  const ActIcon = ACTIVITY_ICONS[a.kind];
                  return (
                    <li key={a.key} className="flex gap-3 text-sm">
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          ACTIVITY_ROW_CLASS[a.kind],
                        )}
                      >
                        <ActIcon className="size-4" aria-hidden />
                      </span>
                      <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                        <span className="font-medium">{a.kindLabel}</span>
                        <span className="text-right text-muted-foreground">
                          {a.detail}
                          <span className="block text-xs">
                            {formatActivityLabel(a.when)}
                          </span>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ParentCard>
          ) : null}

          <ParentCard title={t("quickActions")} titleIcon={Zap}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {role === "butcher" ? (
                <>
                  <Link href="/stock/reception" className={quickLinkBase}>
                    <Inbox className="size-4 shrink-0 text-primary" aria-hidden />
                    {t("reception")}
                  </Link>
                  <Link href="/vente/enregistrer" className={quickLinkBase}>
                    <ShoppingCart
                      className="size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    {t("sale")}
                  </Link>
                  <Link href="/versement/enregistrer" className={quickLinkBase}>
                    <Banknote className="size-4 shrink-0 text-primary" aria-hidden />
                    {t("payment")}
                  </Link>
                  <Link href="/stock/journal" className={quickLinkBase}>
                    <ScrollText className="size-4 shrink-0 text-primary" aria-hidden />
                    {t("journal")}
                  </Link>
                </>
              ) : role === "supplier" ? (
                <>
                  <Link href="/abattage/achats" className={quickLinkBase}>
                    <ShoppingCart
                      className="size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    {tNav("slaughterPurchase")}
                  </Link>
                  <Link href="/abattage/enregistrer" className={quickLinkBase}>
                    <Beef className="size-4 shrink-0 text-primary" aria-hidden />
                    {t("slaughterAction")}
                  </Link>
                  <Link href="/abattage/liste" className={quickLinkBase}>
                    <ListOrdered className="size-4 shrink-0 text-primary" aria-hidden />
                    {tNav("slaughterList")}
                  </Link>
                  <Link href="/versement/liste" className={quickLinkBase}>
                    <Wallet className="size-4 shrink-0 text-primary" aria-hidden />
                    {t("validationAction")}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/reports/sales" className={quickLinkBase}>
                    <BarChart3 className="size-4 shrink-0 text-primary" aria-hidden />
                    {tNav("reportSales")}
                  </Link>
                  <Link href="/reports/stocks" className={quickLinkBase}>
                    <Warehouse className="size-4 shrink-0 text-primary" aria-hidden />
                    {tNav("reportStocks")}
                  </Link>
                  <Link href="/settings/profile" className={quickLinkBase}>
                    <Settings className="size-4 shrink-0 text-primary" aria-hidden />
                    {tNav("settingsProfile")}
                  </Link>
                  <Link href="/admin/users/list" className={quickLinkBase}>
                    <Users className="size-4 shrink-0 text-primary" aria-hidden />
                    {tNav("adminListUsers")}
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
