"use client";

import { useTranslations } from "next-intl";
import { iconCheck, iconError, iconScale } from "@/lib/icons";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { SlaughterLiveAnalysis } from "@/lib/abattage/slaughter-live-validation";

const ScaleIcon = iconScale;
const CheckIcon = iconCheck;
const ErrorIcon = iconError;

type SlaughterLiveSummaryProps = {
  analysis: SlaughterLiveAnalysis;
  categoryLabelByCode: Map<string, string>;
  animalPoidsVifKg?: number | null;
  className?: string;
};

export function SlaughterLiveSummary({
  analysis,
  categoryLabelByCode,
  animalPoidsVifKg,
  className,
}: SlaughterLiveSummaryProps) {
  const t = useTranslations("abattage");

  if (analysis.totalSlaughterKg <= 0) {
    return null;
  }

  const hasBlockingIssue = analysis.issues.length > 0;
  const overCategories = analysis.categoryStatuses.filter((c) => c.state === "over");

  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl border p-5 shadow-card max-md:rounded-3xl",
        hasBlockingIssue
          ? "border-destructive/50 bg-destructive/5"
          : "border-border/50 bg-card",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <ScaleIcon className="mt-0.5 shrink-0 text-lg text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold">{t("liveSummaryTitle")}</p>
          <p className="text-sm text-muted-foreground">
            {t("totalSlaughterWeight", {
              total: analysis.totalSlaughterKg.toFixed(1),
            })}
          </p>
          {animalPoidsVifKg != null && animalPoidsVifKg > 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("detailLiveWeight")} : {animalPoidsVifKg.toLocaleString("fr-FR")} kg
              {analysis.rendementPct != null
                ? ` · ${t("liveRendement", { pct: analysis.rendementPct })}`
                : null}
            </p>
          ) : null}
          <p className="text-sm font-medium">
            {t("totalDistributedWeight", {
              distributed: analysis.totalDistributedKg.toFixed(1),
              total: analysis.totalSlaughterKg.toFixed(1),
            })}
          </p>
          {analysis.totalRemainingKg > 0 ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {t("liveRemainingTotal", {
                kg: analysis.totalRemainingKg.toFixed(1),
              })}
            </p>
          ) : analysis.totalDistributedKg >= analysis.totalSlaughterKg ? (
            <p className="flex items-center gap-1 text-sm text-green-700 dark:text-green-400">
              <CheckIcon className="shrink-0 text-lg" aria-hidden />
              {t("liveFullyDistributed")}
            </p>
          ) : null}
        </div>
      </div>

      {hasBlockingIssue ? (
        <Alert variant="destructive" className="space-y-1 py-2">
          <div className="flex items-center gap-2">
            <ErrorIcon className="shrink-0 text-lg" aria-hidden />
            <p className="text-sm font-semibold">{t("liveErrorsTitle")}</p>
          </div>
          <ul className="list-inside list-disc text-sm">
            {analysis.issues.map((issue) => (
              <li key={issue.code}>{t(issue.code)}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {overCategories.length > 0 ? (
        <ul className="space-y-1 text-sm text-destructive">
          {overCategories.map((c) => {
            const label =
              categoryLabelByCode.get(c.categorieValeur) ??
              c.categorieValeur.replace(/_/g, " ");
            return (
              <li key={c.categorieValeur}>
                {t("statusOverCategoryMessage", {
                  category: label,
                  distributed: c.distributedKg.toFixed(1),
                  available: c.availableKg.toFixed(1),
                })}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
