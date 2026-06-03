"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Beef, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DesktopDataTable,
  MobileCardList,
  MobileDataCard,
  MobileDataRow,
} from "@/components/shared/mobile-data-card";
import {
  AnimalEditDialog,
  type AnimalEditValues,
  type AnimalListItem,
} from "@/components/features/animal-edit-dialog";
import { AttachmentImage } from "@/components/shared/attachment-image";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { cn } from "@/lib/utils";
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

  const pendingCount =
    tab === "en_attente" ? rows.length : undefined;

  const slaughteredCount =
    tab === "abattu" ? rows.length : undefined;

  const renderPendingActions = (row: AnimalListItem) => (
    <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
      <button
        type="button"
        disabled={busyId === row.id}
        onClick={() => openEdit(row)}
        className={cn(
          "flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-3 text-sm font-semibold transition-all",
          "hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        <Pencil className="size-4 shrink-0 text-primary" aria-hidden />
        {t("edit")}
      </button>
      <button
        type="button"
        disabled={busyId === row.id}
        onClick={() => handleDelete(row)}
        className={cn(
          "flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-destructive/30 bg-destructive/5 px-3 text-sm font-semibold text-destructive transition-all",
          "hover:border-destructive/50 hover:bg-destructive/10 active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        <Trash2 className="size-4 shrink-0" aria-hidden />
        {t("delete")}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold sm:text-2xl">{t("title")}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t("subtitle")}
          </p>
        </div>
        <Button asChild className="min-h-11 w-full rounded-xl sm:w-auto">
          <Link href="/abattage/achats">
            <Plus className="size-4 shrink-0" aria-hidden />
            {t("newPurchase")}
          </Link>
        </Button>
      </div>

      <ParentCard title={t("title")} titleIcon={Beef}>
        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            {([
              {
                value: "en_attente" as const,
                label: t("tabPending"),
                icon: Clock,
                count: tab === "en_attente" ? pendingCount : undefined,
              },
              {
                value: "abattu" as const,
                label: t("tabSlaughtered"),
                icon: Beef,
                count: tab === "abattu" ? slaughteredCount : undefined,
              },
            ]).map(({ value, label, icon: Icon, count }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={cn(
                  "flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-3 py-3 text-center transition-all active:scale-[0.98]",
                  tab === value
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/40",
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="text-sm font-semibold leading-tight">{label}</span>
                {typeof count === "number" ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                      tab === value
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="animal-search">{tCommon("search")}</Label>
            <Input
              id="animal-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>

        {animauxQuery.isPending ? (
          <ListPageSkeleton />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <>
            <MobileCardList className="md:hidden">
              {rows.map((row) => (
                <MobileDataCard key={row.id}>
                  {row.photoUrl ? (
                    <div className="mb-3 overflow-hidden rounded-xl border">
                      <AttachmentImage
                        streamUrl={row.photoUrl}
                        alt={row.numeroTag}
                        className="aspect-[16/10] w-full"
                      />
                    </div>
                  ) : null}
                  <MobileDataRow label={t("espece")} value={row.espece} />
                  <MobileDataRow label={t("numeroTag")} value={row.numeroTag} />
                  <MobileDataRow
                    label={t("poidsVif")}
                    value={`${row.poidsVifKg.toLocaleString("fr-FR")} kg`}
                  />
                  <MobileDataRow
                    label={t("prixAchat")}
                    value={formatMoney(row.prixAchat)}
                  />
                  <MobileDataRow label={t("date")} value={formatDate(row.createdAt)} />
                  {tab === "en_attente" ? renderPendingActions(row) : null}
                </MobileDataCard>
              ))}
            </MobileCardList>

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
                                <Pencil className="size-4" />
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
                                <Trash2 className="size-4" />
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
