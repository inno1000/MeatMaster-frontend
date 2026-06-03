"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { iconBanknote, iconPaymentsGroup } from "@/lib/icons";
import { ParentCard } from "@/components/shared/parent-card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { formatError } from "@/lib/format-error";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRoleStats, type StatsPeriode } from "@/lib/reports/use-role-stats";
import { nativeSelectClass } from "@/lib/ui-classes";

type VersementBucket = { count?: unknown; montant?: unknown };

function fmtMoney(n: number) {
  return `${n.toLocaleString()} FCFA`;
}

function bucketAmount(b: VersementBucket | undefined): number {
  return Number(b?.montant ?? 0);
}

function bucketCount(b: VersementBucket | undefined): number {
  return Number(b?.count ?? 0);
}

function ReportsFinancialPage() {
  const t = useTranslations("reports");
  const role = useAuthStore((s) => s.user?.role ?? "butcher");
  const [periode, setPeriode] = useState<StatsPeriode>("mois");

  const statsQuery = useRoleStats(periode);

  const versements = (statsQuery.data?.versements ?? {}) as Record<
    string,
    VersementBucket | number
  >;

  const cards = useMemo(() => {
    const enAttente = versements.en_attente as VersementBucket | undefined;
    const valides = versements.valides as VersementBucket | undefined;
    const rejetes = versements.rejetes as VersementBucket | undefined;

    const base = [
      {
        key: "pending",
        label: t("versementPending"),
        count: bucketCount(enAttente),
        amount: bucketAmount(enAttente),
      },
      {
        key: "valid",
        label: t("versementValid"),
        count: bucketCount(valides),
        amount: bucketAmount(valides),
      },
      {
        key: "rejected",
        label: t("versementRejected"),
        count: bucketCount(rejetes),
        amount: bucketAmount(rejetes),
      },
    ];

    if (role === "supplier") {
      const totalDu = Number(versements.total_du ?? 0);
      const totalPercu = Number(versements.total_percu ?? 0);
      return [
        ...base,
        {
          key: "due",
          label: t("totalDue"),
          count: 0,
          amount: totalDu,
        },
        {
          key: "received",
          label: t("totalReceived"),
          count: 0,
          amount: totalPercu,
        },
      ];
    }

    return base;
  }, [versements, role, t]);

  const abattages = statsQuery.data?.abattages as
    | Record<string, unknown>
    | undefined;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("financialTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("financialSubtitle")}
        </p>
      </div>

      <div className="max-w-xs space-y-2">
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

      {statsQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{formatError(statsQuery.error)}</AlertDescription>
        </Alert>
      ) : null}

      {role === "supplier" && abattages ? (
        <ParentCard title={t("supplierActivity")} titleIcon={iconBanknote}>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">{t("slaughterCount")}</dt>
              <dd className="text-lg font-semibold">
                {Number(abattages.total ?? 0)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("slaughterWeight")}</dt>
              <dd className="text-lg font-semibold">
                {Number(abattages.poids_total_kg ?? 0)} kg
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("avgYield")}</dt>
              <dd className="text-lg font-semibold">
                {Number(abattages.rendement_moyen ?? 0)} %
              </dd>
            </div>
          </dl>
        </ParentCard>
      ) : null}

      <ParentCard title={t("versementsTitle")} titleIcon={iconPaymentsGroup}>
        {statsQuery.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <div
                key={c.key}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <p className="text-sm text-muted-foreground">{c.label}</p>
                {c.count > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {c.count} {t("operations")}
                  </p>
                ) : null}
                <p className="mt-1 text-xl font-semibold">
                  {fmtMoney(c.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(ReportsFinancialPage);
