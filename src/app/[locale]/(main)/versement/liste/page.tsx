"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { iconPaymentsGroup } from "@/lib/icons";
import { ParentCard } from "@/components/shared/parent-card";
import { ScrollRegion } from "@/components/ui/scroll-region";
import {
  DesktopDataTable,
  MobileCardList,
  MobileDataActions,
  MobileDataCard,
  MobileDataRow,
} from "@/components/shared/mobile-data-card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { mapApiBoucherieRow } from "@/lib/api/mappers/boucherie-record";
import { pickDisplayLabel } from "@/lib/display/reference-label";
import { VersementListeSimple } from "@/components/simple/versement-liste-simple";
import { normalizeAppRole } from "@/lib/authz";
import {
  VersementRejectDialog,
  type VersementRejectSummary,
} from "@/components/features/versement-reject-dialog";
import { rejectVersement } from "@/lib/versement/reject-versement";

function VersementListePage() {
  const t = useTranslations("versement");
  const tCommon = useTranslations("common");
  const user = useAuthStore((s) => s.user);
  const appRole = normalizeAppRole(user?.role);
  const isSupplier = appRole === "supplier";
  const [rejectTarget, setRejectTarget] = useState<VersementRejectSummary | null>(
    null,
  );
  const [rejectLoading, setRejectLoading] = useState(false);
  const queryClient = useQueryClient();

  const rowsQuery = useQuery({
    queryKey: ["versements"],
    queryFn: async () => {
      const raw = await boucherieV1.versements.list();
      return unwrapDataArray(raw);
    },
  });

  const boucheriesQuery = useQuery({
    queryKey: ["boucheries", "versement-liste-labels"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.boucheries.list()).map(mapApiBoucherieRow),
  });

  const visibleRows = useMemo(() => {
    const butcherById = new Map<string, string>();
    for (const row of boucheriesQuery.data ?? []) {
      const id = String(row.id ?? "");
      if (!id) continue;
      const name = String(row.name ?? "").trim();
      butcherById.set(id, name || tCommon("noLabel"));
    }

    const rows = (rowsQuery.data ?? []).map((item) => {
      const row = item as Record<string, unknown>;
      const bcId = String(row.boucherie_id ?? "");
      const nested = row.boucherie as Record<string, unknown> | undefined;
      const butcherLabel =
        pickDisplayLabel(nested) ||
        (bcId ? butcherById.get(bcId) : undefined) ||
        tCommon("noLabel");
      return {
        id: String(row.id ?? ""),
        date: String(row.date_versement ?? row.created_at ?? ""),
        butcher: butcherLabel,
        supplierId: String(row.fournisseur_user_id ?? ""),
        amount: Number(row.montant ?? 0),
        method: String(row.mode_paiement ?? ""),
        reference: String(row.reference ?? ""),
        status: String(row.statut ?? "en_attente"),
        supplierComment: String(row.motif_rejet ?? ""),
      };
    });
    if (!user) {
      return [];
    }
    if (user.role === "admin") {
      return rows;
    }
    if (isSupplier) {
      const uid = user.id ?? "";
      return rows.filter((row) => (uid ? row.supplierId === uid : false));
    }
    return rows;
  }, [rowsQuery.data, user, boucheriesQuery.data, tCommon, isSupplier]);

  const onAccept = async (id: string) => {
    try {
      await boucherieV1.versements.valider(id);
      await queryClient.invalidateQueries({ queryKey: ["versements"] });
      toast.success(t("validatedOk"));
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const onConfirmReject = async (motif: string, audioBlobs: Blob[]) => {
    if (!rejectTarget) {
      return;
    }
    setRejectLoading(true);
    try {
      await rejectVersement(rejectTarget.id, {
        motif,
        audioBlobs,
        defaultMotifIfVoiceOnly: t("defaultRejectReason"),
        fallbackMotif: t("defaultRejectReason"),
      });
      await queryClient.invalidateQueries({ queryKey: ["versements"] });
      toast.success(t("rejectedOk"));
      setRejectTarget(null);
    } catch (error) {
      toast.error(formatError(error));
      throw error;
    } finally {
      setRejectLoading(false);
    }
  };

  if (isSupplier) {
    return <VersementListeSimple />;
  }

  const renderStatus = (status: string) => {
    const classes =
      status === "valide"
        ? "bg-accent/20 text-accent-foreground"
        : status === "rejete"
          ? "bg-destructive/15 text-destructive"
          : "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    const label =
      status === "valide"
        ? t("statusAccepted")
        : status === "rejete"
          ? t("statusRejected")
          : t("statusPending");
    return (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("listTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("listSubtitle")}
        </p>
      </div>
      <ParentCard title={t("listTitle")} titleIcon={iconPaymentsGroup}>
        {visibleRows.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">{tCommon("noData")}</p>
        ) : (
          <>
            <MobileCardList>
              {visibleRows.map((r) => (
                <MobileDataCard key={r.id}>
                  <MobileDataRow
                    label={t("tableAmount")}
                    value={`${r.amount.toLocaleString()} FCFA`}
                    emphasize
                  />
                  <MobileDataRow label={t("tableButcher")} value={r.butcher} />
                  <MobileDataRow label={t("tableDate")} value={r.date} />
                  <MobileDataRow label={t("tableMethod")} value={r.method || "—"} />
                  <MobileDataRow label={t("tableRef")} value={r.reference || "—"} />
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{t("tableStatus")}</span>
                    <div className="text-end">
                      {renderStatus(r.status)}
                      {r.supplierComment ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {r.supplierComment}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {isSupplier && r.status === "en_attente" ? (
                    <MobileDataActions>
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-11 w-full"
                        onClick={() => void onAccept(r.id)}
                      >
                        {t("accept")}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="min-h-11 w-full"
                        onClick={() =>
                          setRejectTarget({
                            id: r.id,
                            butcher: r.butcher,
                            amount: r.amount,
                            reference: r.reference,
                          })
                        }
                      >
                        {t("reject")}
                      </Button>
                    </MobileDataActions>
                  ) : isSupplier ? (
                    <p className="text-xs text-muted-foreground">{t("alreadyProcessed")}</p>
                  ) : null}
                </MobileDataCard>
              ))}
            </MobileCardList>
            <DesktopDataTable>
              <ScrollRegion>
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="p-3">{t("tableDate")}</th>
                      <th className="p-3">{t("tableButcher")}</th>
                      <th className="p-3">{t("tableAmount")}</th>
                      <th className="p-3">{t("tableMethod")}</th>
                      <th className="p-3">{t("tableRef")}</th>
                      <th className="p-3">{t("tableStatus")}</th>
                      {isSupplier ? (
                        <th className="p-3">{t("tableValidation")}</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((r) => (
                      <tr key={r.id} className="border-b border-border">
                        <td className="p-3">{r.date}</td>
                        <td className="p-3">{r.butcher}</td>
                        <td className="p-3">{r.amount.toLocaleString()} FCFA</td>
                        <td className="p-3">{r.method}</td>
                        <td className="p-3">{r.reference}</td>
                        <td className="space-y-1 p-3">
                          {renderStatus(r.status)}
                          {r.supplierComment ? (
                            <p className="text-xs text-muted-foreground">
                              {r.supplierComment}
                            </p>
                          ) : null}
                        </td>
                        {isSupplier ? (
                          <td className="p-3">
                            {r.status === "en_attente" ? (
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-8 min-h-8 px-2 text-xs"
                                  onClick={() => void onAccept(r.id)}
                                >
                                  {t("accept")}
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  className="h-8 min-h-8 px-2 text-xs"
                                  onClick={() =>
                                    setRejectTarget({
                                      id: r.id,
                                      butcher: r.butcher,
                                      amount: r.amount,
                                      reference: r.reference,
                                    })
                                  }
                                >
                                  {t("reject")}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {t("alreadyProcessed")}
                              </span>
                            )}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollRegion>
            </DesktopDataTable>
          </>
        )}
      </ParentCard>

      <VersementRejectDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
          }
        }}
        summary={rejectTarget}
        onConfirm={onConfirmReject}
        loading={rejectLoading}
      />
    </div>
  );
}

export default withLocaleParams(VersementListePage);
