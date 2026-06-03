"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Receipt } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nativeSelectClass } from "@/lib/ui-classes";
import { ScrollRegion } from "@/components/ui/scroll-region";
import {
  DesktopDataTable,
  MobileCardList,
  MobileDataActions,
  MobileDataCard,
  MobileDataRow,
} from "@/components/shared/mobile-data-card";
import { Button } from "@/components/ui/button";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { enumLabel } from "@/lib/i18n/enum-label";

function VenteListePage() {
  const t = useTranslations("vente");
  const tCommon = useTranslations("common");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [typeVente, setTypeVente] = useState("");
  const [statut, setStatut] = useState("");
  const queryClient = useQueryClient();

  const salesQuery = useQuery({
    queryKey: ["ventes", from, to, typeVente, statut],
    queryFn: async () => {
      const raw = await boucherieV1.ventes.list({
        date_debut: from || undefined,
        date_fin: to || undefined,
        type_vente: typeVente || undefined,
        statut: statut || undefined,
      });
      return unwrapDataArray(raw);
    },
  });

  const rows = useMemo(() => {
    return (salesQuery.data ?? []).map((item) => {
      const row = item as Record<string, unknown>;
      const client = (row.client ?? {}) as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        date: String(row.created_at ?? row.date_vente ?? ""),
        typeVente: String(row.type_vente ?? ""),
        statut: String(row.statut ?? ""),
        totalAmount: Number(row.montant_total ?? 0),
        customer: String(client.nom ?? client.name ?? "—"),
      };
    });
  }, [salesQuery.data]);

  const updateStatus = async (saleId: string, status: string) => {
    if (!saleId || !status) {
      return;
    }
    try {
      await boucherieV1.ventes.patchStatut(saleId, { statut: status });
      await queryClient.invalidateQueries({ queryKey: ["ventes"] });
      toast.success(t("statusUpdated"));
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("listTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("listSubtitle")}
        </p>
      </div>
      <ParentCard title={t("listTitle")} titleIcon={Receipt}>
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{t("dateFrom")}</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("dateTo")}</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("filterSaleType")}</Label>
            <select
              className={nativeSelectClass}
              value={typeVente}
              onChange={(e) => setTypeVente(e.target.value)}
            >
              <option value="">{tCommon("selectPlaceholder")}</option>
              {(["comptoir", "livraison"] as const).map((code) => (
                <option key={code} value={code}>
                  {enumLabel(tCommon, code)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t("filterStatus")}</Label>
            <select
              className={nativeSelectClass}
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
            >
              <option value="">{tCommon("selectPlaceholder")}</option>
              {(["en_attente", "payee", "annulee"] as const).map((code) => (
                <option key={code} value={code}>
                  {enumLabel(tCommon, code)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {rows.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">{tCommon("noData")}</p>
        ) : (
          <>
            <MobileCardList>
              {rows.map((s) => (
                <MobileDataCard key={s.id}>
                  <MobileDataRow
                    label={t("total")}
                    value={`${s.totalAmount.toLocaleString()} FCFA`}
                    emphasize
                  />
                  <MobileDataRow label={t("tableDate")} value={s.date} />
                  <MobileDataRow
                    label={t("tableType")}
                    value={s.typeVente ? enumLabel(tCommon, s.typeVente) : "—"}
                  />
                  <MobileDataRow
                    label={t("tableStatus")}
                    value={s.statut ? enumLabel(tCommon, s.statut) : "—"}
                  />
                  <MobileDataRow label={t("tableCustomer")} value={s.customer} />
                  <MobileDataActions>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 w-full sm:w-auto"
                      onClick={() => void updateStatus(s.id, "payee")}
                    >
                      {enumLabel(tCommon, "payee")}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      className="min-h-11 w-full sm:w-auto"
                      onClick={() => void updateStatus(s.id, "annulee")}
                    >
                      {t("cancelSale")}
                    </Button>
                  </MobileDataActions>
                </MobileDataCard>
              ))}
            </MobileCardList>
            <DesktopDataTable>
              <ScrollRegion>
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="p-3">{t("tableDate")}</th>
                      <th className="p-3">{t("tableType")}</th>
                      <th className="p-3">{t("tableStatus")}</th>
                      <th className="p-3">{t("total")}</th>
                      <th className="p-3">{t("tableCustomer")}</th>
                      <th className="p-3">{tCommon("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((s) => (
                      <tr key={s.id} className="border-b border-border">
                        <td className="p-3">{s.date}</td>
                        <td className="p-3">{s.typeVente}</td>
                        <td className="p-3">{s.statut}</td>
                        <td className="p-3">{s.totalAmount.toLocaleString()}</td>
                        <td className="p-3">{s.customer}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => void updateStatus(s.id, "payee")}
                            >
                              {enumLabel(tCommon, "payee")}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => void updateStatus(s.id, "annulee")}
                            >
                              {t("cancelSale")}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollRegion>
            </DesktopDataTable>
          </>
        )}
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(VenteListePage);
