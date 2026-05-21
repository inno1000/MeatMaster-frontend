"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { AlertTriangle, Package } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollRegion } from "@/components/ui/scroll-region";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { useRoleStats, type StatsPeriode } from "@/lib/reports/use-role-stats";
import { nativeSelectClass } from "@/lib/ui-classes";

function ReportsStocksPage() {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState<StatsPeriode>("mois");

  const statsQuery = useRoleStats(periode);

  const stocksQuery = useQuery({
    queryKey: ["reports", "stocks"],
    queryFn: async () => unwrapDataArray(await boucherieV1.stocks.list()),
  });

  const rows = useMemo(() => {
    return (stocksQuery.data ?? [])
      .map((item) => {
        const row = item as Record<string, unknown>;
        const produit = (row.produit ?? {}) as Record<string, unknown>;
        const qty = Number(row.quantite ?? 0);
        const seuil = Number(row.seuil_alerte ?? 0);
        const enAlerte = Boolean(
          row.en_alerte ?? (seuil > 0 && qty <= seuil),
        );
        const name = String(produit.nom ?? "").trim() || tCommon("noLabel");
        return {
          id: String(row.id ?? ""),
          name,
          qty,
          unit: String(produit.unite ?? "kg"),
          seuil,
          enAlerte,
        };
      })
      .filter((r) =>
        search
          ? r.name.toLowerCase().includes(search.toLowerCase())
          : true,
      );
  }, [stocksQuery.data, search, tCommon]);

  const statsStocks = (statsQuery.data?.stocks ?? {}) as Record<string, unknown>;
  const alertCount = Number(
    statsStocks.alertes_rupture ?? rows.filter((r) => r.enAlerte).length,
  );
  const refCount = Number(
    statsStocks.total_references ?? rows.length,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("stocksTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("stocksSubtitle")}
        </p>
      </div>

      <div className="mb-2 max-w-xs space-y-2">
        <Label>{t("periode")}</Label>
        <select
          className={nativeSelectClass}
          value={periode}
          onChange={(e) => setPeriode(e.target.value as StatsPeriode)}
        >
          <option value="semaine">{t("periodeWeek")}</option>
          <option value="mois">{t("periodeMonth")}</option>
          <option value="annee">{t("periodeYear")}</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <Package className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">{t("stockRefs")}</p>
            <p className="text-2xl font-semibold">{refCount}</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700">
            <AlertTriangle className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">{t("stockAlerts")}</p>
            <p className="text-2xl font-semibold text-amber-700">{alertCount}</p>
          </div>
        </div>
      </div>

      <ParentCard title={t("stocksTitle")} titleIcon={Package}>
        <div className="mb-4 max-w-md space-y-2">
          <Label>{t("searchProduct")}</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchProduct")}
          />
        </div>

        {stocksQuery.isPending ? (
          <Skeleton className="h-48 w-full" />
        ) : stocksQuery.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{formatError(stocksQuery.error)}</AlertDescription>
          </Alert>
        ) : rows.length === 0 ? (
          <p className="text-center text-muted-foreground">{tCommon("noData")}</p>
        ) : (
          <ScrollRegion>
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="p-3">{t("tableProduct")}</th>
                  <th className="p-3">{t("tableQty")}</th>
                  <th className="p-3">{t("tableThreshold")}</th>
                  <th className="p-3">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border">
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">
                      {r.qty} {r.unit}
                    </td>
                    <td className="p-3">{r.seuil > 0 ? r.seuil : "—"}</td>
                    <td className="p-3">
                      {r.enAlerte ? t("statusAlert") : t("statusOk")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollRegion>
        )}
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(ReportsStocksPage);
