"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clampReportDateRange,
  todayIsoDateLocal,
} from "@/lib/date-utils";

type ReportDateRangeFieldsProps = {
  from: string;
  to: string;
  onFromChange: (from: string, to: string) => void;
  onToChange: (to: string) => void;
  className?: string;
};

/** Filtres date début / fin des rapports — aucune date après aujourd'hui. */
export function ReportDateRangeFields({
  from,
  to,
  onFromChange,
  onToChange,
  className,
}: ReportDateRangeFieldsProps) {
  const t = useTranslations("reports");
  const todayMax = useMemo(() => todayIsoDateLocal(), []);

  return (
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="report-date-from">{t("dateFrom")}</Label>
          <Input
            id="report-date-from"
            type="date"
            value={from}
            max={todayMax}
            onChange={(e) => {
              const { from: nextFrom, to: nextTo } = clampReportDateRange(
                e.target.value,
                to,
              );
              onFromChange(nextFrom, nextTo);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="report-date-to">{t("dateTo")}</Label>
          <Input
            id="report-date-to"
            type="date"
            value={to}
            max={todayMax}
            min={from || undefined}
            onChange={(e) => {
              const { to: nextTo } = clampReportDateRange(from, e.target.value);
              onToChange(nextTo);
            }}
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t("dateMaxTodayHint")}</p>
    </div>
  );
}
