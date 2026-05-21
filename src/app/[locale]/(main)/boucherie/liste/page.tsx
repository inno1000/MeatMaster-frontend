"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useTranslations } from "next-intl";
import { Store } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { useButchers } from "@/lib/hooks/use-butchers";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatError } from "@/lib/format-error";
import { ScrollRegion } from "@/components/ui/scroll-region";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isApiEnabled } from "@/lib/api/config";

function BoucherieListePage() {
  const t = useTranslations("boucherie");
  const tCommon = useTranslations("common");
  const apiOk = isApiEnabled();
  const { data, isLoading, error } = useButchers();
  const user = useAuthStore((s) => s.user);
  const visibleData =
    user?.role === "butcher" && data
      ? data.filter((row) => user.butcheries.includes(String(row.name ?? "")))
      : user?.role === "supplier" && data
        ? data.filter((row) => {
            const rowId = String(row.id ?? "");
            const ids = user.butcheryIds ?? [];
            if (ids.length > 0 && rowId) {
              return ids.includes(rowId);
            }
            const names = user.butcheries ?? [];
            if (names.length > 0) {
              return names.includes(String(row.name ?? ""));
            }
            return true;
          })
        : data;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("listTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("listSubtitle")}
        </p>
      </div>
      <ParentCard title={t("listTitle")} titleIcon={Store}>
        {!apiOk ? (
          <Alert variant="destructive">
            <AlertDescription>{tCommon("apiNotConfigured")}</AlertDescription>
          </Alert>
        ) : null}
        {apiOk && isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : null}
        {apiOk && error ? (
          <Alert variant="destructive">
            <AlertDescription>{formatError(error)}</AlertDescription>
          </Alert>
        ) : null}
        {apiOk && !isLoading && !error && visibleData && visibleData.length === 0 ? (
          <p className="text-center text-muted-foreground">{tCommon("noData")}</p>
        ) : null}
        {apiOk && !isLoading && !error && visibleData && visibleData.length > 0 ? (
          <ScrollRegion>
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="p-3">{t("tableName")}</th>
                  <th className="p-3">{t("tableCity")}</th>
                  <th className="p-3">{t("tablePhone")}</th>
                </tr>
              </thead>
              <tbody>
                {visibleData.map((row, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="p-3">
                      {String(row.name ?? row["name"] ?? "—")}
                    </td>
                    <td className="p-3">
                      {String(row.city ?? row["city"] ?? "—")}
                    </td>
                    <td className="p-3">
                      {String(row.phone ?? row["phone"] ?? "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollRegion>
        ) : null}
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(BoucherieListePage);
