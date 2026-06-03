"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ParentCard } from "@/components/shared/parent-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ListCard } from "@/components/shared/list-card";
import { FilterPillGroup } from "@/components/shared/filter-pill";
import { SearchField } from "@/components/shared/search-field";
import { EmptyState } from "@/components/shared/empty-state";
import {
  DesktopDataTable,
  MobileCardList,
  StatusPill,
} from "@/components/shared/mobile-data-card";
import { ScrollRegion } from "@/components/ui/scroll-region";
import {
  iconAdd,
  iconCancel,
  iconDistributionList,
  iconEmptyList,
  iconScale,
  iconSlaughterCreate,
} from "@/lib/icons";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { enumLabel } from "@/lib/i18n/enum-label";
import { statusVariantFromCode } from "@/lib/i18n/status-variant";
import {
  filterDistributionRows,
  formatDistributionListDate,
  mapDistributionListRow,
} from "@/lib/distributions/list-display";
import {
  ListPageSkeleton,
  StatsCardsSkeleton,
} from "@/components/shared/loading-skeletons";

const AddIcon = iconAdd;
const CancelIcon = iconCancel;
const ScaleIcon = iconScale;

export function DistributionsListView() {
  const t = useTranslations("abattage");
  const tCommon = useTranslations("common");
  const tStock = useTranslations("stockManagement");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");

  const distributionsQuery = useQuery({
    queryKey: ["distributions", "list", statut],
    queryFn: async () => {
      const raw = await boucherieV1.distributions.list({
        statut: statut || undefined,
        limit: 100,
      });
      return unwrapDataArray(raw);
    },
  });

  const allRows = useMemo(
    () =>
      (distributionsQuery.data ?? []).map((item) =>
        mapDistributionListRow(item, locale, tCommon),
      ),
    [distributionsQuery.data, locale, tCommon],
  );

  const rows = useMemo(
    () => filterDistributionRows(allRows, search, tCommon),
    [allRows, search, tCommon],
  );

  const stats = useMemo(() => {
    const pending = allRows.filter((r) => r.statut === "en_attente").length;
    const totalKg = allRows.reduce((acc, r) => acc + r.quantite, 0);
    return { count: allRows.length, pending, totalKg };
  }, [allRows]);

  const statusFilterOptions = useMemo(
    () => [
      { value: "" as const, label: tStock("all") },
      ...(["en_attente", "acceptee", "rejetee"] as const).map((code) => ({
        value: code,
        label: enumLabel(tCommon, code),
      })),
    ],
    [tCommon, tStock],
  );

  const cancelDistribution = async (id: string, boucherieLabel: string) => {
    if (
      !window.confirm(
        t("cancelDistributionConfirm", { butcher: boucherieLabel }),
      )
    ) {
      return;
    }
    try {
      await boucherieV1.distributions.annuler(id);
      await queryClient.invalidateQueries({ queryKey: ["distributions"] });
      toast.success(t("distributionCancelled"));
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const isLoading = distributionsQuery.isPending;
  const hasError = distributionsQuery.isError;
  const isEmpty = !isLoading && !hasError && rows.length === 0;

  const newSlaughterButton = (
    <Button type="button" className="gap-2" asChild>
      <Link href="/abattage/enregistrer">
        <AddIcon className="shrink-0 text-lg" aria-hidden />
        {t("newSlaughter")}
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title={t("distributionsListTitle")}
        subtitle={t("distributionsListSubtitle")}
        action={
          <div className="hidden sm:block">{newSlaughterButton}</div>
        }
      />

      {hasError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {formatError(distributionsQuery.error)}
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <StatsCardsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <StatCard
            icon={iconDistributionList}
            value={stats.pending}
            label={t("statPendingDistributions")}
            tone="rust"
          />
          <StatCard
            icon={iconSlaughterCreate}
            value={stats.count}
            label={t("distributionsCount")}
            tone="ocean"
          />
          <StatCard
            icon={ScaleIcon}
            value={`${stats.totalKg.toLocaleString(locale)} kg`}
            label={t("totalQtyLabel")}
            tone="sage"
            className="col-span-2 sm:col-span-1"
          />
        </div>
      )}

      <ParentCard
        title={t("distributionsListCardTitle")}
        titleIcon={iconDistributionList}
      >
        <div className="mb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="distribution-search">{t("searchDistributions")}</Label>
            <SearchField
              id="distribution-search"
              value={search}
              onChange={setSearch}
              placeholder={t("searchDistributionsPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("filterStatus")}</Label>
            <FilterPillGroup
              options={statusFilterOptions}
              value={statut}
              onChange={setStatut}
              aria-label={t("filterStatus")}
            />
          </div>
        </div>

        <div className="mb-4 sm:hidden">{newSlaughterButton}</div>

        {isLoading ? (
          <ListPageSkeleton />
        ) : isEmpty ? (
          <EmptyState
            icon={iconEmptyList}
            message={
              search.trim() || statut
                ? t("emptyDistributionsFiltered")
                : t("emptyDistributions")
            }
            action={
              <Button type="button" asChild>
                <Link href="/abattage/enregistrer">{t("newSlaughter")}</Link>
              </Button>
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("resultsCount", { count: rows.length })}
            </p>
            <MobileCardList>
              {rows.map((row) => (
                <ListCard
                  key={row.id}
                  title={row.boucherieLabel}
                  statusLabel={
                    row.statut ? enumLabel(tCommon, row.statut) : undefined
                  }
                  statusVariant={statusVariantFromCode(row.statut)}
                  fields={[
                    {
                      label: t("tableSummary"),
                      value: row.summaryLabel || "—",
                    },
                    {
                      label: t("tableQty"),
                      value: `${row.quantite.toLocaleString(locale)} kg`,
                    },
                    {
                      label: t("tableSlaughter"),
                      value: row.abattageLabel,
                    },
                    {
                      label: t("tableDate"),
                      value: formatDistributionListDate(row.dateIso, locale),
                    },
                  ]}
                  actions={
                    <>
                      {row.abattageId ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="min-h-11 w-full sm:flex-1"
                          asChild
                        >
                          <Link
                            href={`/abattage/detail_abattage?id=${encodeURIComponent(row.abattageId)}`}
                          >
                            {t("viewDetail")}
                          </Link>
                        </Button>
                      ) : null}
                      {row.canCancel ? (
                        <Button
                          type="button"
                          variant="destructive"
                          className="min-h-11 w-full gap-2 sm:flex-1"
                          onClick={() =>
                            void cancelDistribution(row.id, row.boucherieLabel)
                          }
                        >
                          <CancelIcon className="shrink-0 text-lg" aria-hidden />
                          {tCommon("cancel")}
                        </Button>
                      ) : null}
                    </>
                  }
                />
              ))}
            </MobileCardList>
            <DesktopDataTable>
              <ScrollRegion>
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="p-3 font-semibold">{t("tableButchery")}</th>
                      <th className="p-3 font-semibold">{t("tableSummary")}</th>
                      <th className="p-3 font-semibold">{t("tableQty")}</th>
                      <th className="p-3 font-semibold">{t("tableSlaughter")}</th>
                      <th className="p-3 font-semibold">{t("tableDate")}</th>
                      <th className="p-3 font-semibold">{t("tableStatus")}</th>
                      <th className="p-3 font-semibold">{t("tableActions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-border/80 transition-colors hover:bg-muted/30"
                      >
                        <td className="p-3 font-medium">{row.boucherieLabel}</td>
                        <td className="max-w-[14rem] p-3 text-muted-foreground">
                          {row.summaryLabel || "—"}
                        </td>
                        <td className="p-3 tabular-nums">
                          {row.quantite.toLocaleString(locale)} kg
                        </td>
                        <td className="p-3">{row.abattageLabel}</td>
                        <td className="p-3 whitespace-nowrap">
                          {formatDistributionListDate(row.dateIso, locale)}
                        </td>
                        <td className="p-3">
                          {row.statut ? (
                            <StatusPill variant={statusVariantFromCode(row.statut)}>
                              {enumLabel(tCommon, row.statut)}
                            </StatusPill>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap items-center gap-1">
                            {row.abattageId ? (
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-9 min-h-9 px-2.5 text-xs"
                                asChild
                              >
                                <Link
                                  href={`/abattage/detail_abattage?id=${encodeURIComponent(row.abattageId)}`}
                                >
                                  {t("viewDetail")}
                                </Link>
                              </Button>
                            ) : null}
                            {row.canCancel ? (
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-9 min-h-9 gap-1 px-2.5 text-xs text-destructive hover:text-destructive"
                                onClick={() =>
                                  void cancelDistribution(
                                    row.id,
                                    row.boucherieLabel,
                                  )
                                }
                              >
                                <CancelIcon className="text-lg" aria-hidden />
                                {tCommon("cancel")}
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollRegion>
            </DesktopDataTable>
          </>
        )}
      </ParentCard>
    </div>
  );
}
