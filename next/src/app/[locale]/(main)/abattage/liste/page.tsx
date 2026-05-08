"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ParentCard } from "@/components/shared/parent-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { nativeSelectClass } from "@/lib/ui-classes";
import { ScrollRegion } from "@/components/ui/scroll-region";
import { Beef, XCircle } from "lucide-react";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";

export default function AbattageListePage() {
  const t = useTranslations("abattage");
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");
  const queryClient = useQueryClient();

  const distributionsQuery = useQuery({
    queryKey: ["distributions", statut],
    queryFn: async () => {
      const raw = await boucherieV1.distributions.list({ statut: statut || undefined });
      return unwrapDataArray(raw);
    },
  });

  const rows = useMemo(() => {
    const mapped = (distributionsQuery.data ?? []).map((item) => {
      const row = item as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        abattageId: String(row.abattage_id ?? ""),
        boucherieId: String(row.boucherie_id ?? ""),
        produitId: String(row.produit_id ?? ""),
        quantite: Number(row.quantite ?? 0),
        statut: String(row.statut ?? ""),
        date: String(row.created_at ?? ""),
      };
    });
    if (!search.trim()) {
      return mapped;
    }
    const q = search.toLowerCase();
    return mapped.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.abattageId.toLowerCase().includes(q) ||
        a.boucherieId.toLowerCase().includes(q),
    );
  }, [distributionsQuery.data, search]);

  const totalWeight = rows.reduce((acc, a) => acc + a.quantite, 0);
  const cancelDistribution = async (id: string) => {
    try {
      await boucherieV1.distributions.annuler(id);
      await queryClient.invalidateQueries({ queryKey: ["distributions"] });
      toast.success("Distribution annulée.");
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("listTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("listSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Beef className="mx-auto mb-2 size-8 text-primary" />
          <p className="text-2xl font-bold">{rows.length}</p>
          <p className="text-sm text-muted-foreground">Distributions</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{totalWeight.toFixed(2)} kg</p>
          <p className="text-sm text-muted-foreground">Quantité totale</p>
        </div>
      </div>

      <ParentCard title={t("listTitle")}>
        <div className="mb-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="search">{t("search")}</Label>
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter">Statut</Label>
            <select
              id="filter"
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className={nativeSelectClass}
            >
              <option value="">—</option>
              <option value="en_attente">En attente</option>
              <option value="acceptee">Acceptée</option>
              <option value="rejetee">Rejetée</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <Button type="button" className="w-full sm:w-auto" asChild>
            <Link href="/abattage/enregistrer">{t("newSlaughter")}</Link>
          </Button>
        </div>
        <ScrollRegion>
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Abattage</th>
                <th className="p-3">Boucherie</th>
                <th className="p-3">Produit</th>
                <th className="p-3">Quantité</th>
                <th className="p-3">Statut</th>
                <th className="p-3">{t("tableDate")}</th>
                <th className="p-3">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-border">
                  <td className="p-3">{a.id}</td>
                  <td className="p-3">{a.abattageId}</td>
                  <td className="p-3">{a.boucherieId}</td>
                  <td className="p-3">{a.produitId}</td>
                  <td className="p-3">{a.quantite}</td>
                  <td className="p-3">{a.statut}</td>
                  <td className="p-3">{a.date}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 min-h-9 px-2.5 text-xs text-destructive hover:text-destructive"
                        onClick={() => void cancelDistribution(a.id)}
                        disabled={a.statut !== "en_attente"}
                      >
                        <XCircle className="size-4" />
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
