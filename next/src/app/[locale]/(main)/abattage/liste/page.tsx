"use client";

import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ParentCard } from "@/components/shared/parent-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  MOCK_SLAUGHTER_ANIMALS,
  type SlaughterAnimal,
  type SlaughterButcher,
} from "@/lib/mock-data/slaughter";
import { nativeSelectClass } from "@/lib/ui-classes";
import { ScrollRegion } from "@/components/ui/scroll-region";
import { Beef, Eye, Pencil, Scale, Trash2, X } from "lucide-react";

export default function AbattageListePage() {
  const t = useTranslations("abattage");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("");
  const [animals, setAnimals] = useState<SlaughterAnimal[]>(MOCK_SLAUGHTER_ANIMALS);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedButchers, setSelectedButchers] = useState<SlaughterButcher[]>([]);

  const rows = useMemo(() => {
    let list = [...animals];
    if (filter === "high_weight") {
      list.sort((a, b) => b.weight - a.weight);
    } else if (filter === "high_price") {
      list.sort((a, b) => b.purchasePrice - a.purchasePrice);
    } else if (filter === "more_butchers") {
      list.sort((a, b) => b.butchers.length - a.butchers.length);
    } else if (filter === "recent") {
      list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          String(a.id).includes(q) ||
          a.date.toLowerCase().includes(q) ||
          a.butchers.some((b) => b.name.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [search, filter, animals]);

  const totalWeight = animals.reduce((acc, a) => acc + a.weight, 0);
  const totalValue = animals.reduce((acc, a) => acc + a.purchasePrice, 0);
  const butcherNames = new Set(
    animals.flatMap((a) => a.butchers.map((b) => b.name)),
  ).size;

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(n);

  const openModal = (butchers: SlaughterButcher[]) => {
    setSelectedButchers(butchers);
    setModalOpen(true);
  };

  const deleteAnimal = (animal: SlaughterAnimal) => {
    setAnimals((prev) => prev.filter((a) => a.id !== animal.id));
    toast.success(t("deletedOk"));
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
          <p className="text-2xl font-bold">{animals.length}</p>
          <p className="text-sm text-muted-foreground">{t("statsAnimals")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Scale className="mx-auto mb-2 size-8 text-emerald-600" />
          <p className="text-2xl font-bold">{totalWeight} kg</p>
          <p className="text-sm text-muted-foreground">{t("statsWeight")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="mb-2 text-2xl font-bold">{fmtMoney(totalValue)}</p>
          <p className="text-sm text-muted-foreground">{t("statsValue")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="mb-2 text-2xl font-bold">{butcherNames}</p>
          <p className="text-sm text-muted-foreground">{t("statsButchers")}</p>
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
            <Label htmlFor="filter">{t("filter")}</Label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={nativeSelectClass}
            >
              <option value="">—</option>
              <option value="high_weight">Poids élevé</option>
              <option value="high_price">Prix élevé</option>
              <option value="more_butchers">Plus de boucheries</option>
              <option value="recent">Récent</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <Button type="button" className="w-full sm:w-auto" asChild>
            <Link href="/abattage/enregistrer">{t("newSlaughter")}</Link>
          </Button>
        </div>
        <ScrollRegion>
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">{t("tableWeight")}</th>
                <th className="p-3">{t("tablePrice")}</th>
                <th className="p-3">{t("meatWeight")}</th>
                <th className="p-3">{t("tripes")}</th>
                <th className="p-3">{t("butchersCount")}</th>
                <th className="p-3">{t("tableDate")}</th>
                <th className="p-3">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-border">
                  <td className="p-3">{a.id}</td>
                  <td className="p-3">{a.weight} kg</td>
                  <td className="p-3">{fmtMoney(a.purchasePrice)}</td>
                  <td className="p-3">{a.meatWeight} kg</td>
                  <td className="p-3">{a.tripesWeight} kg</td>
                  <td className="p-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1">
                        {a.butchers.slice(0, 1).map((b) => (
                          <span
                            key={b.name}
                            className="inline-flex rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary"
                          >
                            {b.name}
                          </span>
                        ))}
                        {a.butchers.length > 1 ? (
                          <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            +{a.butchers.length - 1}
                          </span>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 min-h-8 px-2 text-xs"
                        onClick={() => openModal(a.butchers)}
                      >
                        <Eye className="size-4" />
                        {t("viewButchers")}
                      </Button>
                    </div>
                  </td>
                  <td className="p-3">{a.date}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <Link
                        href={`/abattage/detail_abattage/${a.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Eye className="me-1 size-4" />
                        {t("viewDetail")}
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 min-h-9 px-2.5 text-xs"
                        onClick={() => toast.info(t("editSoon"))}
                      >
                        <Pencil className="size-4" />
                        {t("edit")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 min-h-9 px-2.5 text-xs text-destructive hover:text-destructive"
                        onClick={() => deleteAnimal(a)}
                      >
                        <Trash2 className="size-4" />
                        {t("delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      </ParentCard>

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed inset-x-3 top-[8vh] z-50 max-h-[84vh] overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-lg sm:inset-x-auto sm:start-1/2 sm:w-[min(92vw,920px)] sm:-translate-x-1/2 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <Dialog.Title className="text-lg font-semibold">
                {t("distribution")}
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button type="button" variant="ghost" size="icon" aria-label={t("close")}>
                  <X className="size-5" />
                </Button>
              </Dialog.Close>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {selectedButchers.map((butcher) => (
                <div key={`${butcher.name}-${butcher.phone}`} className="rounded-xl border border-border p-4">
                  <p className="font-semibold">{butcher.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {butcher.weight} kg · {fmtMoney(butcher.price)}/kg
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {t("totalValue")}: {fmtMoney(butcher.weight * butcher.price)}
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>{butcher.address}</p>
                    <p>{butcher.phone}</p>
                    <p>{butcher.city}</p>
                  </div>
                </div>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
