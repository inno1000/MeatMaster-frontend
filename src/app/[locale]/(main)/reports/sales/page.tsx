"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { PieChart, Receipt } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nativeSelectClass } from "@/lib/ui-classes";
import { ScrollRegion } from "@/components/ui/scroll-region";
import {
  DesktopDataTable,
  MobileCardList,
  MobileDataCard,
  MobileDataRow,
} from "@/components/shared/mobile-data-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  aggregateTopProduits,
  filterVenteRows,
  mapVentesToReportRows,
} from "@/lib/reports/ventes-report";
import { useRoleStats, type StatsPeriode } from "@/lib/reports/use-role-stats";
import { enumLabel } from "@/lib/i18n/enum-label";
import { clampReportDateRange } from "@/lib/date-utils";
import { ReportDateRangeFields } from "@/components/reports/report-date-range-fields";

function ReportsSalesPage() {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");
  const role = useAuthStore((s) => s.user?.role ?? "butcher");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [statut, setStatut] = useState("");
  const [periode, setPeriode] = useState<StatsPeriode>("mois");

  const dateRange = useMemo(
    () => clampReportDateRange(from, to),
    [from, to],
  );

  const statsQuery = useRoleStats(periode);

  const ventesQuery = useQuery({
    queryKey: ["reports", "ventes", dateRange.from, dateRange.to, statut],
    enabled: role === "butcher" || role === "admin",
    queryFn: async () => {
      const raw = await boucherieV1.ventes.list({
        date_debut: dateRange.from || undefined,
        date_fin: dateRange.to || undefined,
        statut: statut || undefined,
      });
      return mapVentesToReportRows(raw);
    },
  });

  const filtered = useMemo(
    () =>
      filterVenteRows(ventesQuery.data ?? [], {
        from: dateRange.from,
        to: dateRange.to,
        statut,
      }),
    [ventesQuery.data, dateRange.from, dateRange.to, statut],
  );

  const statsVentes = (statsQuery.data?.ventes ?? {}) as Record<string, unknown>;
  const totalSales = filtered.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalFromStats = Number(statsVentes.montant_total ?? 0);
  const displayTotal =
    dateRange.from || dateRange.to
      ? totalSales
      : totalFromStats > 0
        ? totalFromStats
        : totalSales;
  const salesCount = filtered.length;
  const avgFromStats = Number(statsVentes.montant_moyen ?? 0);
  const avg =
    avgFromStats > 0 && !dateRange.from && !dateRange.to
      ? Math.round(avgFromStats)
      : salesCount > 0
        ? Math.round(displayTotal / salesCount)
        : 0;

  const byProduit = useMemo(() => {
    const top = statsQuery.data?.top_produits;
    if (Array.isArray(top) && top.length > 0) {
      return aggregateTopProduits(top as Array<Record<string, unknown>>);
    }
    return [];
  }, [statsQuery.data]);

  const showTable = role === "butcher" || role === "admin";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("salesTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("salesSubtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-2">
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
      </div>

      {statsQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{formatError(statsQuery.error)}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {statsQuery.isPending ? (
          <>
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{t("totalAmount")}</p>
              <p className="text-xl font-semibold">
                {displayTotal.toLocaleString()} FCFA
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{t("salesCount")}</p>
              <p className="text-xl font-semibold">
                {Number(statsVentes.total ?? salesCount)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{t("avgSale")}</p>
              <p className="text-xl font-semibold">{avg.toLocaleString()} FCFA</p>
            </div>
          </>
        )}
      </div>

      {showTable ? (
        <ParentCard title={t("salesTitle")} titleIcon={Receipt}>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <ReportDateRangeFields
              className="sm:col-span-2"
              from={from}
              to={to}
              onFromChange={(nextFrom, nextTo) => {
                setFrom(nextFrom);
                setTo(nextTo);
              }}
              onToChange={setTo}
            />
            <div className="space-y-2">
              <Label>{t("status")}</Label>
              <select
                className={nativeSelectClass}
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
              >
                <option value="">{tCommon("selectPlaceholder")}</option>
                {(["en_cours", "payee", "annulee"] as const).map((code) => (
                  <option key={code} value={code}>
                    {enumLabel(tCommon, code)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {ventesQuery.isPending ? (
            <Skeleton className="h-48 w-full" />
          ) : ventesQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>{formatError(ventesQuery.error)}</AlertDescription>
            </Alert>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground">{tCommon("noData")}</p>
          ) : (
            <>
              <MobileCardList>
                {filtered.map((s) => (
                  <MobileDataCard key={s.id}>
                    <MobileDataRow
                      label={t("tableTotal")}
                      value={`${s.totalAmount.toLocaleString()} FCFA`}
                      emphasize
                    />
                    <MobileDataRow label={t("tableDate")} value={s.date} />
                    <MobileDataRow label={t("tableCustomer")} value={s.customer} />
                    <MobileDataRow
                      label={t("tableType")}
                      value={s.typeVente ? enumLabel(tCommon, s.typeVente) : "—"}
                    />
                    <MobileDataRow
                      label={t("status")}
                      value={s.statut ? enumLabel(tCommon, s.statut) : "—"}
                    />
                  </MobileDataCard>
                ))}
              </MobileCardList>
              <DesktopDataTable>
                <ScrollRegion>
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-border bg-muted/50">
                      <tr>
                        <th className="p-3">{t("tableDate")}</th>
                        <th className="p-3">{t("tableCustomer")}</th>
                        <th className="p-3">{t("tableType")}</th>
                        <th className="p-3">{t("status")}</th>
                        <th className="p-3">{t("tableTotal")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr key={s.id} className="border-b border-border">
                          <td className="p-3">{s.date}</td>
                          <td className="p-3">{s.customer}</td>
                          <td className="p-3">{s.typeVente || "—"}</td>
                          <td className="p-3">{s.statut || "—"}</td>
                          <td className="p-3">{s.totalAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollRegion>
              </DesktopDataTable>
            </>
          )}
        </ParentCard>
      ) : null}

      <ParentCard title={t("byMeat")} titleIcon={PieChart}>
        {statsQuery.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : byProduit.length === 0 ? (
          <p className="text-muted-foreground">{tCommon("noData")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {byProduit.map((v) => (
              <li
                key={v.name}
                className="flex justify-between border-b border-border py-2"
              >
                <span>{v.name}</span>
                <span>
                  {v.quantity} · {v.amount.toLocaleString()} FCFA
                </span>
              </li>
            ))}
          </ul>
        )}
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(ReportsSalesPage);
