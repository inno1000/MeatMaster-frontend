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
import { Button } from "@/components/ui/button";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";

function VenteListePage() {
  const t = useTranslations("vente");
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
      toast.success("Statut mis à jour.");
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
            <Label>{t("date")} (from)</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("date")} (to)</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Type de vente</Label>
            <select
              className={nativeSelectClass}
              value={typeVente}
              onChange={(e) => setTypeVente(e.target.value)}
            >
              <option value="">—</option>
              <option value="comptoir">Comptoir</option>
              <option value="livraison">Livraison</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Statut</Label>
            <select
              className={nativeSelectClass}
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
            >
              <option value="">—</option>
              <option value="en_attente">En attente</option>
              <option value="payee">Payée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
        </div>
        <ScrollRegion>
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3">{t("tableDate")}</th>
                <th className="p-3">Type</th>
                <th className="p-3">Statut</th>
                <th className="p-3">{t("total")}</th>
                <th className="p-3">{t("tableCustomer")}</th>
                <th className="p-3">Actions</th>
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
                        Payée
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => void updateStatus(s.id, "annulee")}
                      >
                        Annuler
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(VenteListePage);
