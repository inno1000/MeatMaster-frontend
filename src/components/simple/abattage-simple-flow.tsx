"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { iconSlaughterCreate } from "@/lib/icons";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { SimpleStepLayout } from "@/components/simple/simple-step-layout";
import { SimpleChoiceGrid } from "@/components/simple/simple-choice-grid";
import { CategoryIllustration } from "@/components/simple/category-illustration";
import { SimpleNumericPad } from "@/components/simple/simple-numeric-pad";
import { SimpleConfirmBar } from "@/components/simple/simple-confirm-bar";
import { AudioRecorder } from "@/components/shared/audio-recorder";
import { boucherieV1 } from "@/lib/api";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { submitSlaughter } from "@/lib/abattage/use-slaughter-submit";
import { formatError } from "@/lib/format-error";
import { useAuthStore } from "@/lib/stores/auth-store";
import { filterBoucheriesForSupplier } from "@/lib/boucheries/filter-for-supplier";
import {
  parseCategoriesFromReferentiel,
  sumWeightsByCategory,
} from "@/lib/produits/slaughter-form";
import { analyzeSlaughterLive } from "@/lib/abattage/slaughter-live-validation";
import { cn } from "@/lib/utils";
import {
  SimpleChoiceGridSkeleton,
  SimpleNumericPadSkeleton,
} from "@/components/shared/loading-skeletons";
import { ABATTAGE_EXCLUDED_CATEGORIES } from "@/lib/produits/slaughter-form";

const excludedSet = new Set<string>(ABATTAGE_EXCLUDED_CATEGORIES);

const ANIMAL_STEP = 0;
const WEIGHT_BASE = 1;
export function AbattageSimpleFlow() {
  const t = useTranslations("simple");
  const tAb = useTranslations("abattage");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [animalId, setAnimalId] = useState("");
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [boucherieId, setBoucherieId] = useState("");
  const [distQty, setDistQty] = useState<Record<string, string>>({});
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const animauxQuery = useQuery({
    queryKey: ["animaux", "simple-slaughter"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.animaux.list({ statut: "en_attente" })),
  });

  const boucheriesQuery = useQuery({
    queryKey: ["boucheries", "simple-slaughter"],
    queryFn: async () => unwrapDataArray(await boucherieV1.boucheries.list()),
  });

  const categoriesRefQuery = useQuery({
    queryKey: ["referentiels", "categorie_produit", "simple-slaughter"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.referentiels.list("categorie_produit")),
  });

  const categories = useMemo(() => {
    return parseCategoriesFromReferentiel(categoriesRefQuery.data).filter(
      (c) => !excludedSet.has(c.valeur),
    );
  }, [categoriesRefQuery.data]);

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }
    setWeights((prev) => {
      if (Object.keys(prev).length > 0) {
        return prev;
      }
      const next: Record<string, string> = {};
      for (const c of categories) {
        next[c.valeur] = "";
      }
      return next;
    });
  }, [categories]);

  const boucheries = useMemo(
    () =>
      filterBoucheriesForSupplier(boucheriesQuery.data ?? [], user).map((b) => {
        const row = b as { id?: unknown; nom?: unknown; name?: unknown };
        return {
          id: String(row.id ?? ""),
          label: String(row.nom ?? row.name ?? "").trim() || tCommon("noLabel"),
        };
      }),
    [boucheriesQuery.data, user, tCommon],
  );

  const animalOptions = useMemo(() => {
    return (animauxQuery.data ?? []).map((item) => {
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? "");
      const tag = String(row.numero_tag ?? row.tag ?? "");
      const espece = String(row.espece ?? "");
      return {
        id,
        label: tag || espece || id.slice(0, 8),
      };
    });
  }, [animauxQuery.data]);

  const activeCategories = useMemo(() => {
    return categories
      .map((c) => ({
        valeur: c.valeur,
        libelle: c.libelle,
        poids: Number(weights[c.valeur]) || 0,
      }))
      .filter((c) => c.poids > 0);
  }, [categories, weights]);

  const weightStepCount = categories.length;
  const totalSteps = 1 + weightStepCount + 1 + 1;
  const isAnimalStep = step === ANIMAL_STEP;
  const isWeightStep = step >= WEIGHT_BASE && step < WEIGHT_BASE + weightStepCount;
  const weightIndex = isWeightStep ? step - WEIGHT_BASE : 0;
  const currentCategory = isWeightStep ? categories[weightIndex] : null;
  const isDistStep = step === WEIGHT_BASE + weightStepCount;
  const isConfirmStep = step === WEIGHT_BASE + weightStepCount + 1;

  const displayStep = step + 1;

  const totalsByCat = useMemo(() => {
    const rows = categories.map((c) => ({
      categorieValeur: c.valeur,
      poidsKg: weights[c.valeur] === "" ? ("" as const) : Number(weights[c.valeur]),
    }));
    return sumWeightsByCategory(rows);
  }, [categories, weights]);

  const selectedAnimalPoidsVif = useMemo(() => {
    if (!animalId) {
      return null;
    }
    const row = (animauxQuery.data ?? []).find((item) => {
      const r = item as { id?: unknown };
      return String(r.id ?? "") === animalId;
    }) as { poids_vif_kg?: unknown } | undefined;
    const kg = Number(row?.poids_vif_kg);
    return Number.isFinite(kg) && kg > 0 ? kg : null;
  }, [animauxQuery.data, animalId]);

  const distLiveSnapshot = useMemo(
    () => ({
      categoryWeights: categories.map((c) => ({
        categorieValeur: c.valeur,
        poidsKg: weights[c.valeur] === "" ? ("" as const) : Number(weights[c.valeur]),
      })),
      distributions: [
        {
          boucherieId,
          lignes: activeCategories.map((c) => ({
            categorieValeur: c.valeur,
            quantite:
              distQty[c.valeur] === "" ? ("" as const) : Number(distQty[c.valeur]),
          })),
        },
      ],
    }),
    [categories, weights, boucherieId, activeCategories, distQty],
  );

  const distLiveAnalysis = useMemo(
    () =>
      analyzeSlaughterLive(distLiveSnapshot, {
        animalPoidsVifKg: selectedAnimalPoidsVif,
      }),
    [distLiveSnapshot, selectedAnimalPoidsVif],
  );

  const distOverNotifiedRef = useRef(false);

  useEffect(() => {
    const hasOver = distLiveAnalysis.issues.some(
      (i) => i.code === "overDistributionCategory",
    );
    if (hasOver && !distOverNotifiedRef.current) {
      toast.error(tAb("overDistributionCategory"));
    }
    distOverNotifiedRef.current = hasOver;
  }, [distLiveAnalysis.issues, tAb]);

  const goNext = async () => {
    if (isAnimalStep) {
      if (!animalId) {
        return;
      }
      setStep(WEIGHT_BASE);
      return;
    }
    if (isWeightStep && currentCategory) {
      if (weightIndex < weightStepCount - 1) {
        setStep(step + 1);
        return;
      }
      const hasWeight = categories.some(
        (c) => (Number(weights[c.valeur]) || 0) > 0,
      );
      if (!hasWeight) {
        toast.error(tAb("atLeastOneCategory"));
        return;
      }
      setStep(WEIGHT_BASE + weightStepCount);
      return;
    }
    if (isDistStep) {
      if (!boucherieId) {
        return;
      }
      const hasDist = activeCategories.some(
        (c) => (Number(distQty[c.valeur]) || 0) > 0,
      );
      if (!hasDist) {
        toast.error(tAb("noDistribution"));
        return;
      }
      for (const c of activeCategories) {
        const total = totalsByCat.get(c.valeur) ?? 0;
        const dist = Number(distQty[c.valeur]) || 0;
        if (dist > total) {
          toast.error(tAb("overDistributionCategory"));
          return;
        }
      }
      setStep(step + 1);
      return;
    }
    if (isConfirmStep) {
      setSubmitting(true);
      try {
        await submitSlaughter({
          animalId,
          dateAbattage: new Date().toISOString().slice(0, 10),
          categoryWeights: categories.map((c) => ({
            categorieValeur: c.valeur,
            poidsKg: weights[c.valeur] === "" ? "" : Number(weights[c.valeur]),
          })),
          distributions: [
            {
              boucherieId,
              lignes: activeCategories.map((c) => ({
                categorieValeur: c.valeur,
                quantite:
                  distQty[c.valeur] === ""
                    ? ""
                    : Number(distQty[c.valeur]),
              })),
            },
          ],
          audioBlobs,
        });
        toast.success(tAb("slaughterWithDistributionToastOk"));
        router.replace("/abattage/liste");
      } catch (e) {
        toast.error(formatError(e));
      } finally {
        setSubmitting(false);
      }
    }
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  let title = t("slaughterTitle");
  if (isAnimalStep) {
    title = t("slaughterStepAnimal");
  } else if (isWeightStep && currentCategory) {
    title = currentCategory.libelle;
  } else if (isDistStep) {
    title = t("slaughterStepDist");
  } else if (isConfirmStep) {
    title = t("slaughterStepDone");
  }

  return (
    <SimpleStepLayout
      icon={iconSlaughterCreate}
      title={title}
      step={displayStep}
      totalSteps={totalSteps}
    >
      {isAnimalStep ? (
        animauxQuery.isPending ? (
          <SimpleChoiceGridSkeleton count={4} />
        ) : (
          <SimpleChoiceGrid
            options={animalOptions.map((a) => ({
              id: a.id,
              label: a.label,
              selected: a.id === animalId,
            }))}
            onSelect={setAnimalId}
          />
        )
      ) : null}

      {isWeightStep ? (
        categoriesRefQuery.isPending ? (
          <SimpleNumericPadSkeleton />
        ) : currentCategory ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CategoryIllustration
                categorieValeur={currentCategory.valeur}
                libelle={currentCategory.libelle}
                size="hero"
              />
            </div>
            <SimpleNumericPad
              value={weights[currentCategory.valeur] ?? ""}
              onChange={(v) =>
                setWeights((prev) => ({ ...prev, [currentCategory.valeur]: v }))
              }
              allowDecimal
              suffix={t("kg")}
            />
            {(() => {
              const entered = categories
                .map((c) => Number(weights[c.valeur]) || 0)
                .reduce((s, n) => s + n, 0);
              if (entered <= 0) {
                return null;
              }
              return (
                <p className="text-center text-sm text-muted-foreground">
                  {tAb("totalSlaughterWeight", { total: entered.toFixed(1) })}
                  {selectedAnimalPoidsVif != null && selectedAnimalPoidsVif > 0
                    ? ` · ${tAb("liveRendement", {
                        pct: Math.round((entered / selectedAnimalPoidsVif) * 1000) / 10,
                      })}`
                    : null}
                </p>
              );
            })()}
          </div>
        ) : null
      ) : null}

      {isDistStep ? (
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-lg font-semibold">{t("selectButcher")}</p>
            {boucheriesQuery.isPending ? (
              <SimpleChoiceGridSkeleton count={4} columns={2} />
            ) : (
              <SimpleChoiceGrid
                options={boucheries.map((b) => ({
                  id: b.id,
                  label: b.label,
                  selected: b.id === boucherieId,
                }))}
                onSelect={setBoucherieId}
                columns={2}
              />
            )}
          </div>
          {activeCategories.map((c) => {
            const total = totalsByCat.get(c.valeur) ?? 0;
            const dist = Number(distQty[c.valeur]) || 0;
            const remaining = Math.max(0, total - dist);
            const over = dist > total;
            return (
              <div
                key={c.valeur}
                className={cn(
                  "space-y-2 rounded-xl border p-4",
                  over ? "border-destructive bg-destructive/5" : "border-border",
                )}
              >
                <div className="flex items-center gap-3">
                  <CategoryIllustration
                    categorieValeur={c.valeur}
                    libelle={c.libelle}
                    size="md"
                  />
                  <p className="min-w-0 flex-1 text-lg font-semibold">{c.libelle}</p>
                </div>
                <p
                  className={cn(
                    "text-sm",
                    over ? "font-medium text-destructive" : "text-muted-foreground",
                  )}
                >
                  {over
                    ? tAb("lineOverMax", { max: total.toFixed(1) })
                    : t("remainingKg", { kg: remaining.toFixed(1) })}
                </p>
                <SimpleNumericPad
                  value={distQty[c.valeur] ?? ""}
                  onChange={(v) =>
                    setDistQty((prev) => ({ ...prev, [c.valeur]: v }))
                  }
                  allowDecimal
                  suffix={t("kg")}
                />
              </div>
            );
          })}
        </div>
      ) : null}

      {isConfirmStep ? (
        <div className="space-y-4">
          <p className="text-center text-2xl font-bold">
            {activeCategories.reduce((s, c) => s + c.poids, 0).toFixed(1)} {t("kg")}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {activeCategories.map((c) => (
              <li
                key={c.valeur}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/25 px-3 py-2"
              >
                <CategoryIllustration
                  categorieValeur={c.valeur}
                  libelle={c.libelle}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">{c.libelle}</p>
                  <p className="text-sm tabular-nums text-muted-foreground">
                    {c.poids.toFixed(1)} {t("kg")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <AudioRecorder onBlobsChange={setAudioBlobs} />
        </div>
      ) : null}

      <SimpleConfirmBar
        onBack={step > 0 ? goBack : undefined}
        onNext={goNext}
        backLabel={t("back")}
        nextLabel={isConfirmStep ? t("finish") : t("next")}
        nextDisabled={
          (isAnimalStep && !animalId) ||
          (isDistStep &&
            (!boucherieId ||
              distLiveAnalysis.issues.some(
                (i) => i.code === "overDistributionCategory",
              )))
        }
        nextLoading={submitting}
      />
    </SimpleStepLayout>
  );
}
