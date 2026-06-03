"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { iconPaymentsGroup } from "@/lib/icons";
import { SimpleStepLayout } from "@/components/simple/simple-step-layout";
import { Button } from "@/components/ui/button";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { mapApiBoucherieRow } from "@/lib/api/mappers/boucherie-record";
import { pickDisplayLabel } from "@/lib/display/reference-label";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  VersementRejectDialog,
  type VersementRejectSummary,
} from "@/components/features/versement-reject-dialog";
import { rejectVersement } from "@/lib/versement/reject-versement";

export function VersementListeSimple() {
  const t = useTranslations("simple");
  const tVersement = useTranslations("versement");
  const tCommon = useTranslations("common");
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<VersementRejectSummary | null>(
    null,
  );
  const [rejectLoading, setRejectLoading] = useState(false);

  const rowsQuery = useQuery({
    queryKey: ["versements"],
    queryFn: async () => unwrapDataArray(await boucherieV1.versements.list()),
  });

  const boucheriesQuery = useQuery({
    queryKey: ["boucheries", "versement-liste-simple"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.boucheries.list()).map(mapApiBoucherieRow),
  });

  const [tab, setTab] = useState<"pending" | "history">("pending");

  const allRows = useMemo(() => {
    const butcherById = new Map<string, string>();
    for (const row of boucheriesQuery.data ?? []) {
      const id = String(row.id ?? "");
      if (id) {
        butcherById.set(id, String(row.name ?? "").trim() || tCommon("noLabel"));
      }
    }
    const uid = user?.id ?? "";
    return (rowsQuery.data ?? [])
      .map((item) => {
        const row = item as Record<string, unknown>;
        const bcId = String(row.boucherie_id ?? "");
        const nested = row.boucherie as Record<string, unknown> | undefined;
        const butcherLabel =
          pickDisplayLabel(nested) ||
          (bcId ? butcherById.get(bcId) : undefined) ||
          tCommon("noLabel");
        return {
          id: String(row.id ?? ""),
          butcher: butcherLabel,
          amount: Number(row.montant ?? 0),
          reference: String(row.reference ?? ""),
          status: String(row.statut ?? "en_attente"),
          supplierId: String(row.fournisseur_user_id ?? ""),
        };
      })
      .filter((r) => (uid ? r.supplierId === uid : true));
  }, [rowsQuery.data, user, boucheriesQuery.data, tCommon]);

  const pendingRows = useMemo(
    () => allRows.filter((r) => r.status === "en_attente"),
    [allRows],
  );

  const historyRows = useMemo(
    () => allRows.filter((r) => r.status !== "en_attente"),
    [allRows],
  );

  const displayRows = tab === "pending" ? pendingRows : historyRows;

  const onAccept = async (id: string) => {
    try {
      await boucherieV1.versements.valider(id);
      await queryClient.invalidateQueries({ queryKey: ["versements"] });
      toast.success(tVersement("validatedOk"));
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
        defaultMotifIfVoiceOnly: tVersement("defaultRejectReason"),
        fallbackMotif: tVersement("defaultRejectReason"),
      });
      await queryClient.invalidateQueries({ queryKey: ["versements"] });
      toast.success(tVersement("rejectedOk"));
      setRejectTarget(null);
    } catch (error) {
      toast.error(formatError(error));
      throw error;
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <>
      <SimpleStepLayout
        icon={iconPaymentsGroup}
        title={t("paymentsListTitle")}
        step={1}
        totalSteps={1}
      >
        <div className="flex gap-2 pb-2">
          <Button
            type="button"
            variant={tab === "pending" ? "primary" : "outline"}
            className="flex-1"
            onClick={() => setTab("pending")}
          >
            {t("tabPending")}
          </Button>
          <Button
            type="button"
            variant={tab === "history" ? "primary" : "outline"}
            className="flex-1"
            onClick={() => setTab("history")}
          >
            {t("tabHistory")}
          </Button>
        </div>
        <div className="space-y-4 pb-24">
          {displayRows.length === 0 ? (
            <p className="text-center text-lg text-muted-foreground">
              {tCommon("noData")}
            </p>
          ) : (
            displayRows.map((r) => (
              <div
                key={r.id}
                className="space-y-4 rounded-2xl border-2 border-border bg-card p-5"
              >
                <p className="text-center text-3xl font-bold tabular-nums">
                  {t("amountBig", { amount: r.amount.toLocaleString() })}
                </p>
                <p className="text-center text-lg font-medium">{r.butcher}</p>
                {r.reference ? (
                  <p className="text-center text-sm text-muted-foreground">
                    {r.reference}
                  </p>
                ) : null}
                {tab === "pending" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      className="min-h-14 text-lg"
                      onClick={() => void onAccept(r.id)}
                    >
                      {t("accept")}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      className="min-h-14 text-lg"
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
                  <p className="text-center text-sm font-semibold capitalize text-muted-foreground">
                    {r.status}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </SimpleStepLayout>

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
    </>
  );
}
