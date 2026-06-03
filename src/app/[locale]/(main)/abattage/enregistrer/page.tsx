"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Beef, Plus, Trash2 } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormNumberInput } from "@/components/shared/form-number-input";
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
} from "@/lib/produits/slaughter-form";
import {
  analyzeSlaughterLive,
  getSlaughterValidationIssues,
  isDistributionLineOver,
  maxKgForDistributionLine,
} from "@/lib/abattage/slaughter-live-validation";
import { SlaughterLiveSummary } from "@/components/features/slaughter-live-summary";
import { useSimpleMode } from "@/lib/hooks/use-simple-mode";
import { AbattageSimpleFlow } from "@/components/simple/abattage-simple-flow";
import { cn } from "@/lib/utils";
import {
  FormFieldsGridSkeleton,
  SelectFieldSkeleton,
} from "@/components/shared/loading-skeletons";

const CategoryWeightSchema = z.object({
  categorieValeur: z.string().min(1),
  poidsKg: z.union([z.coerce.number().nonnegative(), z.literal("")]),
});

const DistributionLigneSchema = z.object({
  categorieValeur: z.string().min(1),
  quantite: z.union([z.coerce.number().nonnegative(), z.literal("")]),
  prixVente: z.union([z.coerce.number().nonnegative(), z.literal("")]).optional(),
});

function buildSlaughterFormSchema(v: (key: string) => string) {
  const DistributionButcherSchema = z.object({
    boucherieId: z.string().min(1, v("required")),
    lignes: z.array(DistributionLigneSchema).min(1),
  });

  return z
  .object({
    animalId: z.string().min(1, v("required")),
    dateAbattage: z.string().min(1, v("dateRequired")),
    categoryWeights: z.array(CategoryWeightSchema).min(1),
    notes: z.string().optional(),
    distributions: z.array(DistributionButcherSchema).min(1),
  })
  .superRefine((data, ctx) => {
    for (const issue of getSlaughterValidationIssues(data)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: issue.code,
        path: issue.path,
      });
    }
  });
}

type SlaughterFormValues = z.infer<ReturnType<typeof buildSlaughterFormSchema>>;

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
  const simpleMode = useSimpleMode();
  const router = useRouter();
  const t = useTranslations("abattage");
  const tCommon = useTranslations("common");
  const schema = useMemo(
    () => buildSlaughterFormSchema((k) => tCommon(`validation.${k}`)),
    [tCommon],
  );
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
    resolver: formResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
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

  const watchedAnimalId = useWatch({ control, name: "animalId" });
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

  const selectedAnimalPoidsVif = useMemo(() => {
    if (!watchedAnimalId) {
      return null;
    }
    const row = (animauxQuery.data ?? []).find((item) => {
      const a = item as { id?: unknown };
      return String(a.id ?? "") === watchedAnimalId;
    }) as { poids_vif_kg?: unknown } | undefined;
    const kg = Number(row?.poids_vif_kg);
    return Number.isFinite(kg) && kg > 0 ? kg : null;
  }, [animauxQuery.data, watchedAnimalId]);

  const formSnapshot = useMemo(
    () => ({
      categoryWeights: watchedCategoryWeights ?? [],
      distributions: watchedDistributions ?? [],
    }),
    [watchedCategoryWeights, watchedDistributions],
  );

  const liveAnalysis = useMemo(
    () =>
      analyzeSlaughterLive(formSnapshot, {
        animalPoidsVifKg: selectedAnimalPoidsVif,
      }),
    [formSnapshot, selectedAnimalPoidsVif],
  );

  const notifiedIssueCodesRef = useRef<Set<string>>(new Set());

  const toastOnLiveIssueCodes = useMemo(
    () => new Set<"overDistributionCategory" | "duplicateButcher">([
      "overDistributionCategory",
      "duplicateButcher",
    ]),
    [],
  );

  useEffect(() => {
    const currentCodes = new Set(
      liveAnalysis.issues
        .filter((i) => toastOnLiveIssueCodes.has(i.code as "overDistributionCategory" | "duplicateButcher"))
        .map((i) => i.code),
    );
    for (const code of currentCodes) {
      if (!notifiedIssueCodesRef.current.has(code)) {
        toast.error(t(code));
      }
    }
    notifiedIssueCodesRef.current = currentCodes;
  }, [liveAnalysis.issues, t, toastOnLiveIssueCodes]);

  const categoryAlerts = useMemo(() => {
    return liveAnalysis.categoryStatuses
      .map((cat) => {
        const libelle =
          categoryLabelByCode.get(cat.categorieValeur) ??
          cat.categorieValeur.replace(/_/g, " ");
        if (cat.state === "over") {
          return {
            valeur: cat.categorieValeur,
            libelle,
            tone: "destructive" as const,
            message: t("statusOverCategoryMessage", {
              category: libelle,
              distributed: cat.distributedKg.toFixed(1),
              available: cat.availableKg.toFixed(1),
            }),
          };
        }
        if (cat.state === "partial") {
          return {
            valeur: cat.categorieValeur,
            libelle,
            tone: "warning" as const,
            message: t("statusPartialCategoryMessage", {
              category: libelle,
              remaining: cat.remainingKg.toFixed(1),
            }),
          };
        }
        if (cat.state === "complete") {
          return {
            valeur: cat.categorieValeur,
            libelle,
            tone: "success" as const,
            message: t("statusCompleteCategoryMessage", { category: libelle }),
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [liveAnalysis.categoryStatuses, categoryLabelByCode, t]);

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
        throw new Error(t("missingSlaughterIdInResponse"));
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
      await queryClient.invalidateQueries({ queryKey: ["abattages"] });
      await queryClient.invalidateQueries({ queryKey: ["animaux"] });
      await queryClient.invalidateQueries({ queryKey: ["distributions"] });
      router.push("/abattage/liste");
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

  if (simpleMode) {
    return <AbattageSimpleFlow />;
  }

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
                {animauxQuery.isPending ? (
                  <SelectFieldSkeleton />
                ) : (
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
                )}
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
                {categoriesRefQuery.isPending ? (
                  <FormFieldsGridSkeleton count={6} />
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
                          <FormNumberInput
                            control={control}
                            name={`categoryWeights.${index}.poidsKg`}
                            id={`categoryWeights.${index}.poidsKg`}
                            placeholder="0"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
                {liveAnalysis.totalSlaughterKg > 0 ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("totalSlaughterWeight", {
                        total: liveAnalysis.totalSlaughterKg.toFixed(1),
                      })}
                    </p>
                    {liveAnalysis.rendementPct != null ? (
                      <p className="text-sm text-muted-foreground">
                        {t("liveRendement", { pct: liveAnalysis.rendementPct })}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slaughterNotes">{tCommon("notes")}</Label>
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

              {liveAnalysis.totalSlaughterKg > 0 ? (
                <SlaughterLiveSummary
                  analysis={liveAnalysis}
                  categoryLabelByCode={categoryLabelByCode}
                  animalPoidsVifKg={selectedAnimalPoidsVif}
                  className="mb-4"
                />
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
                        {boucheriesQuery.isPending ? (
                          <SelectFieldSkeleton />
                        ) : (
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
                        )}
                        {errors.distributions?.[distIndex]?.boucherieId ? (
                          <p className="text-sm text-destructive">
                            {errors.distributions[distIndex]?.boucherieId?.message}
                          </p>
                        ) : null}
                        {liveAnalysis.duplicateButcherIndices.has(distIndex) ? (
                          <p className="text-sm text-destructive">
                            {t("duplicateButcherInline")}
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
                            const maxKg = maxKgForDistributionLine(
                              formSnapshot,
                              distIndex,
                              ligneIndex,
                            );
                            const lineOver = isDistributionLineOver(
                              formSnapshot,
                              distIndex,
                              ligneIndex,
                            );
                            const qty = Number(ligne.quantite) || 0;
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
                                  <FormNumberInput
                                    control={control}
                                    name={`distributions.${distIndex}.lignes.${ligneIndex}.quantite`}
                                    id={`distributions.${distIndex}.lignes.${ligneIndex}.quantite`}
                                    placeholder="0"
                                    className={lineOver ? "border-destructive" : undefined}
                                  />
                                  {maxKg > 0 ? (
                                    <p
                                      className={cn(
                                        "text-xs",
                                        lineOver
                                          ? "text-destructive font-medium"
                                          : "text-muted-foreground",
                                      )}
                                    >
                                      {lineOver
                                        ? t("lineOverMax", {
                                            max: maxKg.toFixed(1),
                                          })
                                        : t("lineMaxHint", {
                                            max: maxKg.toFixed(1),
                                            remaining: Math.max(0, maxKg - qty).toFixed(1),
                                          })}
                                    </p>
                                  ) : null}
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`distributions.${distIndex}.lignes.${ligneIndex}.prixVente`}
                                  >
                                    {t("salePrice")} (FCFA)
                                  </Label>
                                  <FormNumberInput
                                    control={control}
                                    name={`distributions.${distIndex}.lignes.${ligneIndex}.prixVente`}
                                    id={`distributions.${distIndex}.lignes.${ligneIndex}.prixVente`}
                                    allowDecimals={false}
                                    placeholder="—"
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
            {!liveAnalysis.canSubmit && liveAnalysis.totalSlaughterKg > 0 ? (
              <p className="text-sm text-muted-foreground">{t("submitBlockedHint")}</p>
            ) : null}
            <Button
              type="submit"
              disabled={
                isSubmitting || !watchedAnimalId || !liveAnalysis.canSubmit
              }
              className="w-full sm:w-auto"
            >
              {t("submitSlaughterWithDistribution")}
            </Button>
          </div>
        </ParentCard>
      </form>
    </div>
  );
}

export default withLocaleParams(AbattageEnregistrerPage);
