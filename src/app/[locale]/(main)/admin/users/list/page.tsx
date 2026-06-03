"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
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
import { extractBoucherieIdsFromUserSrc } from "@/lib/api/services/auth";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { formatError } from "@/lib/format-error";
import { isApiEnabled } from "@/lib/api/config";
import { mapApiBoucherieRow } from "@/lib/api/mappers/boucherie-record";

function AdminUsersListPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const apiOk = isApiEnabled();

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => unwrapDataArray(await boucherieV1.users.list()),
    enabled: apiOk,
  });

  const boucheriesQuery = useQuery({
    queryKey: ["boucheries", "admin-users-scope"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.boucheries.list()).map(mapApiBoucherieRow),
    enabled: apiOk,
  });

  const butcheryNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const row of boucheriesQuery.data ?? []) {
      const id = String(row.id ?? "");
      if (!id) continue;
      const name = String(row.name ?? "").trim();
      m.set(id, name || tCommon("noLabel"));
    }
    return m;
  }, [boucheriesQuery.data, tCommon]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("listUsersTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("listUsersSubtitle")}</p>
      </div>

      <ParentCard title={t("listUsersTitle")} titleIcon={Users}>
        {!apiOk ? (
          <Alert variant="destructive">
            <AlertDescription>{tCommon("apiNotConfigured")}</AlertDescription>
          </Alert>
        ) : null}
        {apiOk && usersQuery.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : null}
        {apiOk && usersQuery.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{formatError(usersQuery.error)}</AlertDescription>
          </Alert>
        ) : null}
        {apiOk &&
        !usersQuery.isPending &&
        !usersQuery.isError &&
        (usersQuery.data?.length ?? 0) === 0 ? (
          <p className="text-center text-muted-foreground">{tCommon("noData")}</p>
        ) : null}
        {apiOk &&
        !usersQuery.isPending &&
        !usersQuery.isError &&
        (usersQuery.data?.length ?? 0) > 0 ? (
          <>
            <MobileCardList>
              {(usersQuery.data ?? []).map((item, idx) => {
                const row = item as Record<string, unknown>;
                const ids = extractBoucherieIdsFromUserSrc(row);
                const resolved = ids.map(
                  (id) => butcheryNameById.get(id) ?? tCommon("noLabel"),
                );
                const scope =
                  ids.length === 0
                    ? "—"
                    : ids.length <= 2
                      ? resolved.join(", ")
                      : `${ids.length} ${t("listUsersButcheriesCount")}`;
                return (
                  <MobileDataCard key={String(row.id ?? row.email ?? idx)}>
                    <MobileDataRow
                      label={t("listUsersColName")}
                      value={String(row.name ?? "—")}
                      emphasize
                    />
                    <MobileDataRow
                      label={t("listUsersColEmail")}
                      value={String(row.email ?? "—")}
                    />
                    <MobileDataRow
                      label={t("listUsersColRole")}
                      value={String(row.role ?? "—")}
                    />
                    <MobileDataRow
                      label={t("listUsersColButcheries")}
                      value={scope}
                    />
                  </MobileDataCard>
                );
              })}
            </MobileCardList>
            <DesktopDataTable>
              <ScrollRegion>
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="p-3">{t("listUsersColName")}</th>
                      <th className="p-3">{t("listUsersColEmail")}</th>
                      <th className="p-3">{t("listUsersColRole")}</th>
                      <th className="p-3">{t("listUsersColButcheries")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usersQuery.data ?? []).map((item, idx) => {
                      const row = item as Record<string, unknown>;
                      const ids = extractBoucherieIdsFromUserSrc(row);
                      const resolved = ids.map(
                        (id) => butcheryNameById.get(id) ?? tCommon("noLabel"),
                      );
                      const scope =
                        ids.length === 0
                          ? "—"
                          : ids.length <= 2
                            ? resolved.join(", ")
                            : `${ids.length} ${t("listUsersButcheriesCount")}`;
                      return (
                        <tr
                          key={String(row.id ?? row.email ?? idx)}
                          className="border-b border-border"
                        >
                          <td className="p-3 font-medium">{String(row.name ?? "—")}</td>
                          <td className="p-3 text-muted-foreground">
                            {String(row.email ?? "—")}
                          </td>
                          <td className="p-3">{String(row.role ?? "—")}</td>
                          <td
                            className="max-w-[220px] truncate p-3 text-muted-foreground"
                            title={resolved.join(", ")}
                          >
                            {scope}
                          </td>
                        </tr>
                      );
                    })}
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

export default withLocaleParams(AdminUsersListPage);
