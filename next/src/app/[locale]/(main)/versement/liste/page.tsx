"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ParentCard } from "@/components/shared/parent-card";
import { ScrollRegion } from "@/components/ui/scroll-region";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";

export default function VersementListePage() {
  const t = useTranslations("versement");
  const user = useAuthStore((s) => s.user);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const queryClient = useQueryClient();

  const rowsQuery = useQuery({
    queryKey: ["versements"],
    queryFn: async () => {
      const raw = await boucherieV1.versements.list();
      return unwrapDataArray(raw);
    },
  });

  const visibleRows = useMemo(() => {
    const rows = (rowsQuery.data ?? []).map((item) => {
      const row = item as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        date: String(row.date_versement ?? row.created_at ?? ""),
        butcher: String(row.boucherie_id ?? ""),
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
    if (user.role === "supplier") {
      return rows.filter((row) => row.supplierId === String((user as { id?: unknown }).id ?? ""));
    }
    return rows;
  }, [rowsQuery.data, user]);

  const onValidate = async (
    id: string,
    status: "valide" | "rejete",
  ) => {
    try {
      if (status === "valide") {
        await boucherieV1.versements.valider(id);
      } else {
        await boucherieV1.versements.rejeter(id, {
          motif_rejet: rejectionReason || t("defaultRejectReason"),
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["versements"] });
      toast.success(status === "valide" ? t("validatedOk") : t("rejectedOk"));
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const renderStatus = (status: string) => {
    const classes =
      status === "valide"
        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
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
      <ParentCard title={t("listTitle")}>
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
                {user?.role === "supplier" ? (
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
                  {user?.role === "supplier" ? (
                    <td className="p-3">
                      {r.status === "en_attente" ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 min-h-8 px-2 text-xs"
                            onClick={() => void onValidate(r.id, "valide")}
                          >
                            {t("accept")}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            className="h-8 min-h-8 px-2 text-xs"
                            onClick={() => void onValidate(r.id, "rejete")}
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
      </ParentCard>
      {user?.role === "supplier" ? (
        <ParentCard title="Motif de rejet (optionnel)">
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={t("defaultRejectReason")}
          />
        </ParentCard>
      ) : null}
    </div>
  );
}
