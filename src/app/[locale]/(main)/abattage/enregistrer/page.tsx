"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Beef, Plus, Trash2 } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { nativeSelectClass } from "@/lib/ui-classes";
import { AudioRecorder } from "@/components/shared/audio-recorder";
import { boucherieV1, uploadAudioBlobs } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray, unwrapDataObject } from "@/lib/api/unwrap";
import { coerceApiScalarId } from "@/lib/api/coerce-id";
import { useAuthStore } from "@/lib/stores/auth-store";
import { normalizeAppRole } from "@/lib/authz";
import { filterBoucheriesForSupplier } from "@/lib/boucheries/filter-for-supplier";
import {
  buildLignesFromCategoryWeights,
  parseCategoriesFromReferentiel,
  sumDistributedByCategory,
  sumWeightsByCategory,
} from "@/lib/produits/slaughter-form";

const CategoryWeightSchema = z.object({
  categorieValeur: z.string().min(1),
  poidsKg: z.union([z.coerce.number().nonnegative(), z.literal("")]),
});

const DistributionLigneSchema = z.object({
  categorieValeur: z.string().min(1),
  quantite: z.union([z.coerce.number().nonnegative(), z.literal("")]),
  prixVente: z.union([z.coerce.number().nonnegative(), z.literal("")]).optional(),
});

const DistributionButcherSchema = z.object({
  boucherieId: z.string().min(1, "Requis"),
  lignes: z.array(DistributionLigneSchema).min(1),
});

const SlaughterFormSchema = z
  .object({
    animalId: z.string().min(1, "Requis"),
    dateAbattage: z.string().min(1, "Requis"),
    categoryWeights: z.array(CategoryWeightSchema).min(1),
    notes: z.string().optional(),
    distributions: z.array(DistributionButcherSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const totalsByCat = sumWeightsByCategory(data.categoryWeights);
    if (totalsByCat.size === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "atLeastOneCategory",
        path: ["categoryWeights"],
      });
    }

    const butcherIds = data.distributions
      .map((d) => d.boucherieId)
      .filter((id) => id.length > 0);
    if (butcherIds.length > 0 && new Set(butcherIds).size !== butcherIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "duplicateButcher",
        path: ["distributions"],
      });
    }

    const distByCat = sumDistributedByCategory(data.distributions);
    for (const [cat, total] of totalsByCat) {
      const distributed = distByCat.get(cat) ?? 0;
      if (distributed > total) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "overDistributionCategory",
          path: ["distributions"],
        });
        break;
      }
    }

    const hasAnyDistribution = data.distributions.some((d) =>
      d.lignes.some((l) => (Number(l.quantite) || 0) > 0),
    );
    if (totalsByCat.size > 0 && !hasAnyDistribution) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "noDistribution",
        path: ["distributions"],
      });
    }
  });

type SlaughterFormValues = z.infer<typeof SlaughterFormSchema>;

function defaultDistributionLignes(
  activeCategoryCodes: string[],
): { categorieValeur: string; quantite: number | ""; prixVente: number | "" }[] {
  return activeCategoryCodes.map((categorieValeur) => ({
    categorieValeur,
    quantite: "",
    prixVente: "",
  }));
}

function AbattageEnregistrerPage() {
  const t = useTranslations("abattage");
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const appRole = normalizeAppRole(user?.role);

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SlaughterFormValues>({
    resolver: formResolver(SlaughterFormSchema),
    defaultValues: {
      animalId: "",
      dateAbattage: new Date().toISOString().slice(0, 10),
      categoryWeights: [],
      notes: "",
      distributions: [
        { boucherieId: "", lignes: defaultDistributionLignes([]) },
      ],
    },
  });

  const { fields: categoryFields, replace: replaceCategoryWeights } =
    useFieldArray({ control, name: "categoryWeights" });

  const { fields: distributionFields, append, remove } = useFieldArray({
    control,
    name: "distributions",
  });

  const watchedCategoryWeights = useWatch({ control, name: "categoryWeights" });
  const watchedDistributions = useWatch({ control, name: "distributions" });

  const animauxQuery = useQuery({
    queryKey: ["animaux", "en-attente"],
    queryFn: async () =>
      unwrapDataArray(
        await boucherieV1.animaux.list({ statut: "en_attente" }),
      ),
  });

  const boucheriesQuery = useQuery({
    queryKey: ["boucheries", "for-distributions"],
    queryFn: async () => unwrapDataArray(await boucherieV1.boucheries.list()),
  });

  const categoriesRefQuery = useQuery({
    queryKey: ["referentiels", "categorie_produit", "slaughter"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.referentiels.list("categorie_produit")),
  });

  const categories = useMemo(
    () => parseCategoriesFromReferentiel(categoriesRefQuery.data),
    [categoriesRefQuery.data],
  );

  const categoryLabelByCode = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) {
      map.set(c.valeur, c.libelle);
    }
    return map;
  }, [categories]);

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }
    if (getValues("categoryWeights").length > 0) {
      return;
    }
    replaceCategoryWeights(
      categories.map((c) => ({ categorieValeur: c.valeur, poidsKg: "" })),
    );
  }, [categories, getValues, replaceCategoryWeights]);

  const activeCategories = useMemo(() => {
    return (watchedCategoryWeights ?? [])
      .map((row) => ({
        valeur: row.categorieValeur,
        libelle:
          categoryLabelByCode.get(row.categorieValeur) ??
          row.categorieValeur.replace(/_/g, " "),
        poidsKg: Number(row.poidsKg) || 0,
      }))
      .filter((c) => c.poidsKg > 0);
  }, [watchedCategoryWeights, categoryLabelByCode]);

  const totalsByCat = useMemo(
    () => sumWeightsByCategory(watchedCategoryWeights ?? []),
    [watchedCategoryWeights],
  );

  const distributedByCat = useMemo(
    () => sumDistributedByCategory(watchedDistributions ?? []),
    [watchedDistributions],
  );

  const totalSlaughterKg = useMemo(() => {
    let sum = 0;
    for (const v of totalsByCat.values()) {
      sum += v;
    }
    return sum;
  }, [totalsByCat]);

  const totalDistributedKg = useMemo(() => {
    let sum = 0;
    for (const v of distributedByCat.values()) {
      sum += v;
    }
    return sum;
  }, [distributedByCat]);

  const categoryAlerts = useMemo(() => {
    return activeCategories.map((cat) => {
      const distributed = distributedByCat.get(cat.valeur) ?? 0;
      if (distributed > cat.poidsKg) {
        return {
          valeur: cat.valeur,
          libelle: cat.libelle,
          tone: "destructive" as const,
          message: t("statusOverCategoryMessage", {
            category: cat.libelle,
            distributed: distributed.toFixed(1),
            available: cat.poidsKg.toFixed(1),
          }),
        };
      }
      if (distributed > 0 && distributed < cat.poidsKg) {
        return {
          valeur: cat.valeur,
          libelle: cat.libelle,
          tone: "warning" as const,
          message: t("statusPartialCategoryMessage", {
            category: cat.libelle,
            remaining: (cat.poidsKg - distributed).toFixed(1),
          }),
        };
      }
      if (distributed === cat.poidsKg && cat.poidsKg > 0) {
        return {
          valeur: cat.valeur,
          libelle: cat.libelle,
          tone: "success" as const,
          message: t("statusCompleteCategoryMessage", { category: cat.libelle }),
        };
      }
      return null;
    }).filter(Boolean);
  }, [activeCategories, distributedByCat, t]);

  const distributionBoucherieOptions = useMemo(() => {
    const all = boucheriesQuery.data ?? [];
    if (appRole !== "supplier") {
      return all;
    }
    return filterBoucheriesForSupplier(all, user);
  }, [boucheriesQuery.data, user, appRole]);

  const activeCategoryCodes = useMemo(
    () => activeCategories.map((c) => c.valeur),
    [activeCategories],
  );

  useEffect(() => {
    if (activeCategoryCodes.length === 0) {
      return;
    }
    const current = getValues("distributions");
    let changed = false;
    const next = current.map((dist) => {
      const byCode = new Map(
        dist.lignes.map((l) => [l.categorieValeur, l]),
      );
      const newLignes = activeCategoryCodes.map((code) => {
        const existing = byCode.get(code);
        return (
          existing ?? {
            categorieValeur: code,
            quantite: "" as const,
            prixVente: "" as const,
          }
        );
      });
      const sameLength = newLignes.length === dist.lignes.length;
      const sameOrder =
        sameLength &&
        newLignes.every(
          (l, i) => l.categorieValeur === dist.lignes[i]?.categorieValeur,
        );
      if (!sameOrder) {
        changed = true;
      }
      return { ...dist, lignes: newLignes };
    });
    if (changed) {
      setValue("distributions", next, { shouldValidate: true });
    }
  }, [activeCategoryCodes, getValues, setValue]);

  const appendButcher = () => {
    append({
      boucherieId: "",
      lignes: defaultDistributionLignes(activeCategoryCodes),
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const abattageLignes = buildLignesFromCategoryWeights(values.categoryWeights);
      if (abattageLignes.length === 0) {
        throw new Error(t("atLeastOneCategory"));
      }

      const poidsCarcasse = abattageLignes.reduce((sum, l) => sum + l.poids_kg, 0);

      const attachmentIds = await uploadAudioBlobs(audioBlobs);

      const abattageBody: Record<string, unknown> = {
        animal_id: coerceApiScalarId(values.animalId),
        date_abattage: values.dateAbattage,
        poids_carcasse_kg: poidsCarcasse,
        lignes: abattageLignes,
        notes: values.notes || undefined,
        ...(attachmentIds.length > 0 ? { attachment_ids: attachmentIds } : {}),
      };

      const abRaw = await boucherieV1.abattages.create(abattageBody);
      const abattageId = String(unwrapDataObject(abRaw).id ?? "");
      if (!abattageId) {
        throw new Error("Identifiant abattage manquant dans la réponse API.");
      }

      for (const dist of values.distributions) {
        const distLignes: {
          categorie: string;
          poids_kg: number;
          prix_par_kg?: number;
        }[] = [];

        for (const ligne of dist.lignes) {
          const kg = Number(ligne.quantite) || 0;
          if (kg <= 0) {
            continue;
          }
          const prix =
            ligne.prixVente !== "" && ligne.prixVente !== undefined
              ? Number(ligne.prixVente)
              : undefined;
          distLignes.push({
            categorie: ligne.categorieValeur,
            poids_kg: kg,
            ...(prix !== undefined && Number.isFinite(prix)
              ? { prix_par_kg: prix }
              : {}),
          });
        }

        if (distLignes.length === 0) {
          continue;
        }

        await boucherieV1.distributions.create({
          abattage_id: abattageId,
          boucherie_id: coerceApiScalarId(dist.boucherieId),
          lignes: distLignes,
        });
      }

      toast.success(t("slaughterWithDistributionToastOk"));
      reset({
        animalId: "",
        dateAbattage: new Date().toISOString().slice(0, 10),
        categoryWeights: categories.map((c) => ({
          categorieValeur: c.valeur,
          poidsKg: "",
        })),
        notes: "",
        distributions: [
          {
            boucherieId: "",
            lignes: defaultDistributionLignes(categories.map((c) => c.valeur)),
          },
        ],
      });
      await queryClient.invalidateQueries({ queryKey: ["abattages"] });
      await queryClient.invalidateQueries({ queryKey: ["animaux"] });
      await queryClient.invalidateQueries({ queryKey: ["distributions"] });
    } catch (error) {
      toast.error(formatError(error));
    }
  });

  const distributionsError =
    errors.distributions?.message === "duplicateButcher"
      ? t("duplicateButcher")
      : errors.distributions?.message === "overDistributionCategory"
        ? t("overDistributionCategory")
        : errors.distributions?.message === "noDistribution"
          ? t("noDistribution")
          : errors.distributions?.message;

  const categoryWeightsError =
    errors.categoryWeights?.message === "atLeastOneCategory"
      ? t("atLeastOneCategory")
      : errors.categoryWeights?.message;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("createTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("supplierFlowHint")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <ParentCard title={t("recordSlaughterTitle")} titleIcon={Beef}>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="animalId">{t("animalSelect")}</Label>
                <select
                  id="animalId"
                  className={nativeSelectClass}
                  {...register("animalId")}
                >
                  <option value="">—</option>
                  {(animauxQuery.data ?? []).map((item) => {
                    const a = item as {
                      id?: unknown;
                      espece?: unknown;
                      numero_tag?: unknown;
                    };
                    const id = String(a.id ?? "");
                    return (
                      <option key={id} value={id}>
                        {String(a.espece ?? "—")} · {String(a.numero_tag ?? id)}
                      </option>
                    );
                  })}
                </select>
                {errors.animalId ? (
                  <p className="text-sm text-destructive">
                    {errors.animalId.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateAbattage">{t("dateAbattage")}</Label>
                <Input
                  id="dateAbattage"
                  type="date"
                  {...register("dateAbattage")}
                />
                {errors.dateAbattage ? (
                  <p className="text-sm text-destructive">
                    {errors.dateAbattage.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-3 rounded-xl border border-border/70 bg-muted/15 p-4">
                <div>
                  <h3 className="text-sm font-semibold">{t("weightsByCategory")}</h3>
                  <p className="text-xs text-muted-foreground">
                    {t("weightsByCategoryHint")}
                  </p>
                </div>
                {categoryWeightsError ? (
                  <p className="text-sm text-destructive">{categoryWeightsError}</p>
                ) : null}
                {categoriesRefQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">{t("loadingCategories")}</p>
                ) : categoryFields.length === 0 ? (
                  <p className="text-sm text-destructive">{t("noCategoriesConfigured")}</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {categoryFields.map((field, index) => {
                      const valeur = watchedCategoryWeights?.[index]?.categorieValeur ?? field.categorieValeur;
                      const libelle =
                        categoryLabelByCode.get(valeur) ??
                        valeur.replace(/_/g, " ");
                      return (
                        <div key={field.id} className="space-y-2">
                          <input
                            type="hidden"
                            {...register(`categoryWeights.${index}.categorieValeur`)}
                          />
                          <Label htmlFor={`categoryWeights.${index}.poidsKg`}>
                            {libelle} (kg)
                          </Label>
                          <Input
                            id={`categoryWeights.${index}.poidsKg`}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0"
                            {...register(`categoryWeights.${index}.poidsKg`)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
                {totalSlaughterKg > 0 ? (
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("totalSlaughterWeight", {
                      total: totalSlaughterKg.toFixed(1),
                    })}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slaughterNotes">Notes</Label>
                <Input id="slaughterNotes" {...register("notes")} />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="mb-1 text-base font-semibold">{t("distribution")}</h2>
              <p className="mb-4 text-xs text-muted-foreground">
                {t("distributionByCategoryHint")}
              </p>

              {activeCategories.length === 0 ? (
                <Alert className="mb-4">
                  <AlertDescription>{t("defineCategoryWeightsFirst")}</AlertDescription>
                </Alert>
              ) : null}

              {categoryAlerts.map((alert) =>
                alert ? (
                  <Alert
                    key={alert.valeur}
                    variant={
                      alert.tone === "destructive" ? "destructive" : "default"
                    }
                    className="mb-3"
                  >
                    <AlertDescription>{alert.message}</AlertDescription>
                  </Alert>
                ) : null,
              )}

              {totalSlaughterKg > 0 ? (
                <p className="mb-3 text-sm text-muted-foreground">
                  {t("totalDistributedWeight", {
                    distributed: totalDistributedKg.toFixed(1),
                    total: totalSlaughterKg.toFixed(1),
                  })}
                </p>
              ) : null}

              {distributionsError ? (
                <p className="mb-3 text-sm text-destructive">{distributionsError}</p>
              ) : null}

              <div className="space-y-4">
                {distributionFields.map((distField, distIndex) => {
                  const lignes =
                    watchedDistributions?.[distIndex]?.lignes ?? [];
                  return (
                    <div
                      key={distField.id}
                      className="rounded-xl border border-border/70 bg-muted/20 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {t("tableButchery")} {distIndex + 1}
                        </span>
                        {distributionFields.length > 1 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 px-2 text-destructive hover:text-destructive"
                            onClick={() => remove(distIndex)}
                            aria-label={t("delete")}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`distributions.${distIndex}.boucherieId`}>
                          {t("selectButcher")}
                        </Label>
                        <select
                          id={`distributions.${distIndex}.boucherieId`}
                          className={nativeSelectClass}
                          {...register(`distributions.${distIndex}.boucherieId`)}
                        >
                          <option value="">—</option>
                          {distributionBoucherieOptions.map((item) => {
                            const b = item as {
                              id?: unknown;
                              nom?: unknown;
                              name?: unknown;
                              ville?: unknown;
                            };
                            const id = String(b.id ?? "");
                            const nom = String(b.nom ?? b.name ?? "").trim();
                            const ville = String(b.ville ?? "").trim();
                            return (
                              <option key={id} value={id}>
                                {[nom || null, ville || null]
                                  .filter(Boolean)
                                  .join(" · ") || "—"}
                              </option>
                            );
                          })}
                        </select>
                        {errors.distributions?.[distIndex]?.boucherieId ? (
                          <p className="text-sm text-destructive">
                            {errors.distributions[distIndex]?.boucherieId?.message}
                          </p>
                        ) : null}
                      </div>

                      {lignes.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          <p className="text-xs font-medium text-muted-foreground">
                            {t("distributionPerCategory")}
                          </p>
                          {lignes.map((ligne, ligneIndex) => {
                            const catCode = ligne.categorieValeur;
                            const libelle =
                              categoryLabelByCode.get(catCode) ??
                              catCode.replace(/_/g, " ");
                            return (
                              <div
                                key={`${distField.id}-${catCode}`}
                                className="grid gap-3 rounded-lg border border-border/50 bg-background/60 p-3 sm:grid-cols-2"
                              >
                                <input
                                  type="hidden"
                                  {...register(
                                    `distributions.${distIndex}.lignes.${ligneIndex}.categorieValeur`,
                                  )}
                                />
                                <div className="space-y-2 sm:col-span-2">
                                  <span className="text-sm font-medium">{libelle}</span>
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`distributions.${distIndex}.lignes.${ligneIndex}.quantite`}
                                  >
                                    {t("distributedWeight")} (kg)
                                  </Label>
                                  <Input
                                    id={`distributions.${distIndex}.lignes.${ligneIndex}.quantite`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0"
                                    {...register(
                                      `distributions.${distIndex}.lignes.${ligneIndex}.quantite`,
                                    )}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`distributions.${distIndex}.lignes.${ligneIndex}.prixVente`}
                                  >
                                    {t("salePrice")} (FCFA)
                                  </Label>
                                  <Input
                                    id={`distributions.${distIndex}.lignes.${ligneIndex}.prixVente`}
                                    type="number"
                                    step="1"
                                    min="0"
                                    placeholder="—"
                                    {...register(
                                      `distributions.${distIndex}.lignes.${ligneIndex}.prixVente`,
                                    )}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-4 h-9 w-full px-3 text-sm sm:w-auto"
                disabled={activeCategories.length === 0}
                onClick={appendButcher}
              >
                <Plus className="size-4" aria-hidden />
                {t("addButcher")}
              </Button>
            </div>

            <AudioRecorder onBlobsChange={setAudioBlobs} />
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {t("submitSlaughterWithDistribution")}
            </Button>
          </div>
        </ParentCard>
      </form>
    </div>
  );
}

export default withLocaleParams(AbattageEnregistrerPage);
