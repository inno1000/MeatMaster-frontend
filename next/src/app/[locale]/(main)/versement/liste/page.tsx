"use client";

/**
 * UI « Versements » : à aligner sur les **paiements** API (`GET/POST …/ventes/{vente}/paiements`).
 * Données encore mockées jusqu’à sélection / liste des ventes côté API.
 */
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ParentCard } from "@/components/shared/parent-card";
import { ScrollRegion } from "@/components/ui/scroll-region";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";

const ROWS = [
  {
    id: 1,
    date: "2024-01-15",
    butcher: "Boucherie Halal",
    supplierEmail: "fournisseur@meatmaster.local",
    amount: 150000,
    method: "Mobile money",
    reference: "MM-10293",
    status: "pending" as const,
    supplierComment: "",
  },
  {
    id: 2,
    date: "2024-01-14",
    butcher: "Boucherie Centrale",
    supplierEmail: "fournisseur@meatmaster.local",
    amount: 89000,
    method: "Espèces",
    reference: "CASH-882",
    status: "accepted" as const,
    supplierComment: "",
  },
  {
    id: 3,
    date: "2024-01-13",
    butcher: "Boucherie du Marché",
    supplierEmail: "fournisseur2@meatmaster.local",
    amount: 112000,
    method: "Virement",
    reference: "TR-4431",
    status: "rejected" as const,
    supplierComment: "Référence non conforme",
  },
];

export default function VersementListePage() {
  const t = useTranslations("versement");
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState(ROWS);

  const visibleRows = useMemo(() => {
    if (!user) {
      return [];
    }
    if (user.role === "admin") {
      return rows;
    }
    if (user.role === "supplier") {
      return rows.filter((row) => row.supplierEmail === user.email);
    }
    return rows.filter((row) => user.butcheries.includes(row.butcher));
  }, [rows, user]);

  const onValidate = (
    id: number,
    status: "accepted" | "rejected",
    comment = "",
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, status, supplierComment: comment } : row,
      ),
    );
    toast.success(
      status === "accepted" ? t("validatedOk") : t("rejectedOk"),
    );
  };

  const renderStatus = (status: (typeof ROWS)[number]["status"]) => {
    const classes =
      status === "accepted"
        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
        : status === "rejected"
          ? "bg-destructive/15 text-destructive"
          : "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    const label =
      status === "accepted"
        ? t("statusAccepted")
        : status === "rejected"
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
                      {r.status === "pending" ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 min-h-8 px-2 text-xs"
                            onClick={() => onValidate(r.id, "accepted")}
                          >
                            {t("accept")}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            className="h-8 min-h-8 px-2 text-xs"
                            onClick={() =>
                              onValidate(r.id, "rejected", t("defaultRejectReason"))
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
      </ParentCard>
    </div>
  );
}
