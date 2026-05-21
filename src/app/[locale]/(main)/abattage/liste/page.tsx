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
import { Beef, ClipboardList, Plus, Scale, XCircle } from "lucide-react";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { mapApiBoucherieRow } from "@/lib/api/mappers/boucherie-record";
import { pickDisplayLabel } from "@/lib/display/reference-label";

export default function AbattageListePage() {
  const t = useTranslations("abattage");
  const tCommon = useTranslations("common");
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

  const boucheriesQuery = useQuery({
    queryKey: ["boucheries", "ref-labels"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.boucheries.list()).map(mapApiBoucherieRow),
  });

  const produitsQuery = useQuery({
    queryKey: ["produits", "ref-labels"],
    queryFn: async () => unwrapDataArray(await boucherieV1.produits.list()),
  });

  const abattagesQuery = useQuery({
    queryKey: ["abattages", "ref-labels"],
    queryFn: async () => unwrapDataArray(await boucherieV1.abattages.list()),
  });

  const rows = useMemo(() => {
    const boucherieById = new Map<string, string>();
    for (const row of boucheriesQuery.data ?? []) {
      const id = String(row.id ?? "");
      if (!id) continue;
      const name = String(row.name ?? "").trim();
      boucherieById.set(id, name || tCommon("noLabel"));
    }

    const produitById = new Map<string, string>();
    for (const item of produitsQuery.data ?? []) {
      const r = item as Record<string, unknown>;
      const id = String(r.id ?? "");
      if (!id) continue;
      produitById.set(id, pickDisplayLabel(r) || tCommon("noLabel"));
    }

    const abattageById = new Map<string, string>();
    for (const item of abattagesQuery.data ?? []) {
      const r = item as Record<string, unknown>;
      const id = String(r.id ?? "");
      if (!id) continue;
      const label = String(r.date_abattage ?? "").trim();
      abattageById.set(id, label || tCommon("noLabel"));
    }

    const mapped = (distributionsQuery.data ?? []).map((item) => {
      const row = item as Record<string, unknown>;
      const abId = String(row.abattage_id ?? "");
      const bcId = String(row.boucherie_id ?? "");
      const prId = String(row.produit_id ?? "");
      const abNested = row.abattage as Record<string, unknown> | undefined;
      const bcNested = row.boucherie as Record<string, unknown> | undefined;
      const prNested = row.produit as Record<string, unknown> | undefined;

      const abattageLabel =
        String(abNested?.date_abattage ?? "").trim() ||
        pickDisplayLabel(abNested, ["reference", "nom", "name"]) ||
        (abId ? abattageById.get(abId) : undefined) ||
        tCommon("noLabel");

      const boucherieLabel =
        pickDisplayLabel(bcNested) ||
        (bcId ? boucherieById.get(bcId) : undefined) ||
        tCommon("noLabel");

      const produitLabel =
        pickDisplayLabel(prNested) ||
        (prId ? produitById.get(prId) : undefined) ||
        tCommon("noLabel");

      return {
        id: String(row.id ?? ""),
        abattageLabel,
        boucherieLabel,
        produitLabel,
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
        a.abattageLabel.toLowerCase().includes(q) ||
        a.boucherieLabel.toLowerCase().includes(q) ||
        a.produitLabel.toLowerCase().includes(q) ||
        a.statut.toLowerCase().includes(q),
    );
  }, [
    distributionsQuery.data,
    search,
    boucheriesQuery.data,
    produitsQuery.data,
    abattagesQuery.data,
    tCommon,
  ]);

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
          <Scale className="mx-auto mb-2 size-8 text-accent" aria-hidden />
          <p className="text-2xl font-bold">{totalWeight.toFixed(2)} kg</p>
          <p className="text-sm text-muted-foreground">Quantité totale</p>
        </div>
      </div>

      <ParentCard title={t("listTitle")} titleIcon={ClipboardList}>
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
          <Button type="button" className="w-full gap-2 sm:w-auto" asChild>
            <Link href="/abattage/enregistrer">
              <Plus className="size-4 shrink-0" aria-hidden />
              {t("newSlaughter")}
            </Link>
          </Button>
        </div>
        <ScrollRegion>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3">{t("tableSlaughter")}</th>
                <th className="p-3">{t("tableButchery")}</th>
                <th className="p-3">{t("tableProduct")}</th>
                <th className="p-3">{t("tableQty")}</th>
                <th className="p-3">{t("tableStatus")}</th>
                <th className="p-3">{t("tableDate")}</th>
                <th className="p-3">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-border">
                  <td className="p-3">{a.abattageLabel}</td>
                  <td className="p-3">{a.boucherieLabel}</td>
                  <td className="p-3">{a.produitLabel}</td>
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
