"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Building2 } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollRegion } from "@/components/ui/scroll-region";
import {
  DesktopDataTable,
  MobileCardList,
  MobileDataCard,
  MobileDataRow,
} from "@/components/shared/mobile-data-card";
import { boucherieV1 } from "@/lib/api";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { mapApiBoucherieRow } from "@/lib/api/mappers/boucherie-record";
import { formatError } from "@/lib/format-error";
import { isApiEnabled } from "@/lib/api/config";

function AdminButcheriesListPage() {
  const t = useTranslations("admin");
  const tBoucherie = useTranslations("boucherie");
  const tCommon = useTranslations("common");
  const apiOk = isApiEnabled();

  const query = useQuery({
    queryKey: ["admin", "boucheries", "list"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.boucheries.list()).map(mapApiBoucherieRow),
    enabled: apiOk,
  });

  const rows = query.data ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("listButcheriesTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("listButcheriesSubtitle")}</p>
      </div>

      <ParentCard title={t("listButcheriesTitle")} titleIcon={Building2}>
        {!apiOk ? (
          <Alert variant="destructive">
            <AlertDescription>{tCommon("apiNotConfigured")}</AlertDescription>
          </Alert>
        ) : null}
        {apiOk && query.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : null}
        {apiOk && query.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{formatError(query.error)}</AlertDescription>
          </Alert>
        ) : null}
        {apiOk && !query.isPending && !query.isError && rows.length === 0 ? (
          <p className="text-center text-muted-foreground">{tCommon("noData")}</p>
        ) : null}
        {apiOk && !query.isPending && !query.isError && rows.length > 0 ? (
          <>
            <MobileCardList>
              {rows.map((row, idx) => (
                <MobileDataCard key={String(row.id ?? idx)}>
                  <MobileDataRow
                    label={tBoucherie("tableName")}
                    value={String(row.name ?? "—")}
                    emphasize
                  />
                  <MobileDataRow
                    label={tBoucherie("tableCity")}
                    value={String(row.city ?? "—")}
                  />
                  <MobileDataRow
                    label={tBoucherie("tablePhone")}
                    value={String(row.phone ?? "—")}
                  />
                </MobileDataCard>
              ))}
            </MobileCardList>
            <DesktopDataTable>
              <ScrollRegion>
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="p-3">{tBoucherie("tableName")}</th>
                      <th className="p-3">{tBoucherie("tableCity")}</th>
                      <th className="p-3">{tBoucherie("tablePhone")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr
                        key={String(row.id ?? idx)}
                        className="border-b border-border"
                      >
                        <td className="p-3 font-medium">
                          {String(row.name ?? "—")}
                        </td>
                        <td className="p-3">{String(row.city ?? "—")}</td>
                        <td className="p-3">{String(row.phone ?? "—")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollRegion>
            </DesktopDataTable>
          </>
        ) : null}
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(AdminButcheriesListPage);
