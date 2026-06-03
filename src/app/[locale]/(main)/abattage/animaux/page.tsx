"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import {
  iconAdd,
  iconAnimalsList,
  iconDelete,
  iconEdit,
  iconEmptyAnimals,
} from "@/lib/icons";

const AddIcon = iconAdd;
const EditIcon = iconEdit;
const DeleteIcon = iconDelete;
import { ParentCard } from "@/components/shared/parent-card";
import { PageHeader } from "@/components/shared/page-header";
import { FilterPillGroup } from "@/components/shared/filter-pill";
import { SearchField } from "@/components/shared/search-field";
import { AnimalCompactCard } from "@/components/shared/animal-compact-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DesktopDataTable } from "@/components/shared/mobile-data-card";
import {
  AnimalEditDialog,
  type AnimalEditValues,
  type AnimalListItem,
} from "@/components/features/animal-edit-dialog";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { ListPageSkeleton } from "@/components/shared/loading-skeletons";

type AnimalTab = "en_attente" | "abattu";

function mapAnimalRow(item: unknown): AnimalListItem {
  const row = item as Record<string, unknown>;
  const attachments = Array.isArray(row.attachments) ? row.attachments : [];
  const firstAttachment = attachments[0] as Record<string, unknown> | undefined;

  return {
    id: String(row.id ?? ""),
    espece: String(row.espece ?? "—"),
    numeroTag: String(row.numero_tag ?? "—"),
    poidsVifKg: Number(row.poids_vif_kg ?? 0),
    prixAchat: Number(row.prix_achat ?? 0),
    statut: String(row.statut ?? ""),
    createdAt: String(row.created_at ?? ""),
    photoUrl: firstAttachment?.stream_url
      ? String(firstAttachment.stream_url)
      : undefined,
  };
}

function AnimauxListePage() {
  const t = useTranslations("animauxList");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<AnimalTab>("en_attente");
  const [search, setSearch] = useState("");
  const [editingAnimal, setEditingAnimal] = useState<AnimalListItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const animauxQuery = useQuery({
    queryKey: ["animaux", tab],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.animaux.list({ statut: tab })),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (animauxQuery.data ?? [])
      .map(mapAnimalRow)
      .filter((row) => {
        if (!q) {
          return true;
        }
        return (
          row.espece.toLowerCase().includes(q) ||
          row.numeroTag.toLowerCase().includes(q)
        );
      });
  }, [animauxQuery.data, search]);

  const invalidateAnimaux = async () => {
    await queryClient.invalidateQueries({ queryKey: ["animaux"] });
  };

  const openEdit = (animal: AnimalListItem) => {
    setEditingAnimal(animal);
    setEditOpen(true);
  };

  const handleUpdate = async (values: AnimalEditValues) => {
    if (!editingAnimal?.id) {
      return;
    }
    setBusyId(editingAnimal.id);
    try {
      await boucherieV1.animaux.update(editingAnimal.id, {
        espece: values.espece,
        poids_vif_kg: values.poidsVifKg,
        prix_achat: values.prixAchat,
        numero_tag: values.numeroTag,
      });
      toast.success(t("toastUpdated"));
      await invalidateAnimaux();
    } catch (error) {
      toast.error(formatError(error));
      throw error;
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (animal: AnimalListItem) => {
    if (!animal.id) {
      return;
    }
    if (!window.confirm(t("confirmDelete", { tag: animal.numeroTag }))) {
      return;
    }
    setBusyId(animal.id);
    try {
      await boucherieV1.animaux.remove(animal.id);
      toast.success(t("toastDeleted"));
      await invalidateAnimaux();
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setBusyId(null);
    }
  };

  const formatMoney = (value: number) =>
    `${value.toLocaleString("fr-FR")} FCFA`;

  const formatDate = (value: string) => {
    if (!value) {
      return "—";
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("fr-FR");
  };

  const tabOptions = useMemo(
    () => [
      { value: "en_attente" as const, label: t("tabPending") },
      { value: "abattu" as const, label: t("tabSlaughtered") },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/abattage/achats">
              <AddIcon className="shrink-0 text-lg" aria-hidden />
              {t("newPurchase")}
            </Link>
          </Button>
        }
      />

      <ParentCard title={t("title")} titleIcon={iconAnimalsList}>
        <div className="mb-4 space-y-4">
          <FilterPillGroup
            options={tabOptions}
            value={tab}
            onChange={setTab}
            aria-label={t("title")}
          />
          <div className="space-y-2">
            <Label htmlFor="animal-search">{tCommon("search")}</Label>
            <SearchField
              id="animal-search"
              value={search}
              onChange={setSearch}
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>

        {animauxQuery.isPending ? (
          <ListPageSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState icon={iconEmptyAnimals} message={t("empty")} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {rows.map((row) => (
                <AnimalCompactCard
                  key={row.id}
                  row={row}
                  showActions={tab === "en_attente"}
                  busy={busyId === row.id}
                  onEdit={() => openEdit(row)}
                  onDelete={() => void handleDelete(row)}
                  editLabel={t("edit")}
                  deleteLabel={t("delete")}
                />
              ))}
            </div>

            <DesktopDataTable>
              <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="p-3">{t("espece")}</th>
                      <th className="p-3">{t("numeroTag")}</th>
                      <th className="p-3">{t("poidsVif")}</th>
                      <th className="p-3">{t("prixAchat")}</th>
                      <th className="p-3">{t("date")}</th>
                      {tab === "en_attente" ? (
                        <th className="p-3">{t("actions")}</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-border/60">
                        <td className="p-3">{row.espece}</td>
                        <td className="p-3">{row.numeroTag}</td>
                        <td className="p-3">
                          {row.poidsVifKg.toLocaleString("fr-FR")} kg
                        </td>
                        <td className="p-3">{formatMoney(row.prixAchat)}</td>
                        <td className="p-3">{formatDate(row.createdAt)}</td>
                        {tab === "en_attente" ? (
                          <td className="p-3">
                            <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted/20 p-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-lg text-primary hover:bg-primary/10"
                                disabled={busyId === row.id}
                                onClick={() => openEdit(row)}
                                aria-label={t("edit")}
                              >
                                <EditIcon className="text-lg" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-lg text-destructive hover:bg-destructive/10"
                                disabled={busyId === row.id}
                                onClick={() => handleDelete(row)}
                                aria-label={t("delete")}
                              >
                                <DeleteIcon className="text-lg" />
                              </Button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
            </DesktopDataTable>
          </>
        )}
      </ParentCard>

      <AnimalEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        animal={editingAnimal}
        onSubmit={handleUpdate}
        loading={busyId === editingAnimal?.id}
      />
    </div>
  );
}

export default withLocaleParams(AnimauxListePage);
