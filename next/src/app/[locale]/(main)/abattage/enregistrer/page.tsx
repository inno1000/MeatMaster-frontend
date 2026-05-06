"use client";

import { useMemo } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { nativeSelectClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { AudioRecorder } from "@/components/shared/audio-recorder";

const BUTCHERIES = [
  "Boucherie Halal",
  "Boucherie du Marché",
  "Boucherie Centrale",
  "Boucherie du Centre",
  "Boucherie Premium",
  "Boucherie Express",
];

const ButcherSchema = z.object({
  name: z.string().min(1, "required"),
  weight: z.coerce.number().positive(),
  price: z.coerce.number().nonnegative(),
});

const AnimalSchema = z.object({
  weight: z.coerce.number().positive(),
  purchasePrice: z.coerce.number().nonnegative(),
  meatWeight: z.coerce.number().nonnegative(),
  tripesWeight: z.coerce.number().nonnegative(),
  butchers: z.array(ButcherSchema).min(1),
});

const FormSchema = z.object({
  animals: z.array(AnimalSchema).min(1),
});

type FormValues = z.infer<typeof FormSchema>;
type AnimalValue = FormValues["animals"][number];

type DistributionStatus = {
  type: "info" | "warning" | "error" | "success";
  label: string;
  message: string;
};

const createNewButcher = (): AnimalValue["butchers"][number] => ({
  name: "",
  weight: 0,
  price: 0,
});

const createNewAnimal = (): AnimalValue => ({
  weight: 0,
  purchasePrice: 0,
  meatWeight: 0,
  tripesWeight: 0,
  butchers: [createNewButcher()],
});

export default function AbattageEnregistrerPage() {
  const t = useTranslations("abattage");
  const {
    register,
    control,
    setValue,
    getValues,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      animals: [createNewAnimal()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "animals",
  });

  const animals = useWatch({ control, name: "animals" }) ?? [];

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(value);

  const hasDuplicateButcheries = (animal?: AnimalValue) => {
    if (!animal) {
      return false;
    }
    const names = animal.butchers
      .map((b) => b.name?.trim())
      .filter((name): name is string => Boolean(name));
    return names.length !== new Set(names).size;
  };

  const getDistributionStatus = (animal?: AnimalValue): DistributionStatus => {
    const meatWeight = Number(animal?.meatWeight ?? 0);
    const distributed = (animal?.butchers ?? []).reduce(
      (sum, butcher) => sum + Number(butcher.weight ?? 0),
      0,
    );

    if (meatWeight <= 0) {
      return {
        type: "info",
        label: t("statusUndefined"),
        message: t("statusUndefinedMessage"),
      };
    }

    if (distributed > meatWeight) {
      return {
        type: "error",
        label: t("statusOver"),
        message: t("statusOverMessage", {
          distributed: distributed.toFixed(1),
          meatWeight: meatWeight.toFixed(1),
        }),
      };
    }

    if (distributed === meatWeight) {
      return {
        type: "success",
        label: t("statusComplete"),
        message: t("statusCompleteMessage"),
      };
    }

    if (distributed > 0) {
      return {
        type: "warning",
        label: t("statusPartial"),
        message: t("statusPartialMessage", {
          remaining: (meatWeight - distributed).toFixed(1),
        }),
      };
    }

    return {
      type: "info",
      label: t("statusNone"),
      message: t("statusNoneMessage"),
    };
  };

  const isDistributionValid = useMemo(
    () =>
      animals.every((animal) => {
        const status = getDistributionStatus(animal);
        return (
          Number(animal.meatWeight ?? 0) > 0 &&
          status.type !== "error" &&
          !hasDuplicateButcheries(animal)
        );
      }),
    [animals],
  );

  const totalWeight = useMemo(
    () =>
      animals.reduce((sum, animal) => sum + Number(animal.weight ?? 0), 0),
    [animals],
  );

  const totalValue = useMemo(
    () =>
      animals.reduce(
        (sum, animal) => sum + Number(animal.purchasePrice ?? 0),
        0,
      ),
    [animals],
  );

  const addButcher = async (animalIndex: number) => {
    const current = getValues(`animals.${animalIndex}.butchers`) ?? [];
    setValue(`animals.${animalIndex}.butchers`, [...current, createNewButcher()], {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
    await trigger(`animals.${animalIndex}.butchers`);
  };

  const removeButcher = async (animalIndex: number, butcherIndex: number) => {
    const current = getValues(`animals.${animalIndex}.butchers`) ?? [];
    if (current.length <= 1) {
      return;
    }
    setValue(
      `animals.${animalIndex}.butchers`,
      current.filter((_, index) => index !== butcherIndex),
      {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      },
    );
    await trigger(`animals.${animalIndex}.butchers`);
  };

  const onSubmit = handleSubmit(async () => {
    if (!isDistributionValid) {
      toast.error(t("invalidDistribution"));
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
    toast.success(t("toastOk"));
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("createTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("createSubtitle")}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xl font-semibold sm:text-2xl">{animals.length}</p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {t("statsAnimals")}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xl font-semibold sm:text-2xl">
            {totalWeight.toFixed(1)} kg
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {t("statsWeight")}
          </p>
        </div>
        <div className="col-span-2 rounded-xl border border-border bg-card p-4 text-center sm:col-span-1">
          <p className="text-xl font-semibold sm:text-2xl">
            {formatMoney(totalValue)}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {t("statsValue")}
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        {fields.map((field, index) => (
          <ParentCard key={field.id} title={`${t("animal")} ${index + 1}`}>
            {(() => {
              const animal = animals[index];
              const status = getDistributionStatus(animal);
              const duplicate = hasDuplicateButcheries(animal);
              const butchers = animal?.butchers ?? [];

              const getAvailableButcheries = (butcherIndex: number) => {
                const currentName = butchers[butcherIndex]?.name;
                const selected = new Set(
                  butchers
                    .map((b, idx) =>
                      idx === butcherIndex ? "" : (b.name ?? "").trim(),
                    )
                    .filter(Boolean),
                );
                return BUTCHERIES.filter(
                  (name) => name === currentName || !selected.has(name),
                );
              };

              const duplicateErrorFor = (butcherIndex: number) => {
                const currentName = (butchers[butcherIndex]?.name ?? "").trim();
                if (!currentName) {
                  return "";
                }
                return butchers.some(
                  (butcher, idx) =>
                    idx !== butcherIndex && butcher.name?.trim() === currentName,
                )
                  ? t("duplicateButcherInline")
                  : "";
              };

              return (
                <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        status.type === "success" &&
                          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                        status.type === "warning" &&
                          "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                        status.type === "error" &&
                          "bg-destructive/15 text-destructive",
                        status.type === "info" &&
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {status.label}
                    </span>
                    {fields.length > 1 ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t("weight")} (kg)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`animals.${index}.weight`)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("price")} (FCFA)</Label>
                        <Input
                          type="number"
                          {...register(`animals.${index}.purchasePrice`)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("meatWeight")} (kg)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`animals.${index}.meatWeight`)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("tripes")} (kg)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`animals.${index}.tripesWeight`)}
                        />
                      </div>
                    </div>

                    {status.type === "warning" || status.type === "error" ? (
                      <Alert variant={status.type === "error" ? "destructive" : "default"}>
                        <AlertDescription>{status.message}</AlertDescription>
                      </Alert>
                    ) : null}
                    {duplicate ? (
                      <Alert variant="destructive">
                        <AlertDescription>{t("duplicateButcher")}</AlertDescription>
                      </Alert>
                    ) : null}

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{t("distribution")}</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void addButcher(index)}
                        >
                          <Plus className="size-4" />
                          {t("addButcher")}
                        </Button>
                      </div>

                      {butchers.map((_, butcherIndex) => (
                        <div
                          key={`${field.id}-b-${butcherIndex}`}
                          className="space-y-3 rounded-lg border border-border p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">
                              {t("butchersCount")} {butcherIndex + 1}
                            </p>
                            {butchers.length > 1 ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => void removeButcher(index, butcherIndex)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            ) : null}
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-2 sm:col-span-3">
                              <Label>{t("butcherName")}</Label>
                              <select
                                className={nativeSelectClass}
                                {...register(
                                  `animals.${index}.butchers.${butcherIndex}.name`,
                                )}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setValue(
                                    `animals.${index}.butchers.${butcherIndex}.name`,
                                    value,
                                    {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                      shouldTouch: true,
                                    },
                                  );
                                }}
                              >
                                <option value="">{t("selectButcher")}</option>
                                {getAvailableButcheries(butcherIndex).map((name) => (
                                  <option key={name} value={name}>
                                    {name}
                                  </option>
                                ))}
                              </select>
                              {duplicateErrorFor(butcherIndex) ? (
                                <p className="text-sm text-destructive">
                                  {duplicateErrorFor(butcherIndex)}
                                </p>
                              ) : null}
                            </div>

                            <div className="space-y-2">
                              <Label>{t("distributedWeight")} (kg)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                {...register(
                                  `animals.${index}.butchers.${butcherIndex}.weight`,
                                )}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t("salePrice")} (FCFA)</Label>
                              <Input
                                type="number"
                                {...register(
                                  `animals.${index}.butchers.${butcherIndex}.price`,
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </ParentCard>
        ))}
        {errors.animals ? (
          <p className="text-sm text-destructive">
            {errors.animals.message ?? errors.animals.root?.message ?? t("invalidDistribution")}
          </p>
        ) : null}
        <AudioRecorder />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => append(createNewAnimal())}
          >
            <Plus className="size-4" />
            {t("addAnimal")}
          </Button>
          <Button type="submit" disabled={!isDistributionValid || isSubmitting}>
            {t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
