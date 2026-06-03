"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormNumberInput } from "@/components/shared/form-number-input";
import { nativeSelectClass } from "@/lib/ui-classes";
import { formResolver } from "@/lib/form-resolver";
import { boucherieV1 } from "@/lib/api";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { cn } from "@/lib/utils";

export type AnimalEditValues = {
  espece: string;
  poidsVifKg: number;
  prixAchat: number;
  numeroTag: string;
};

export type AnimalListItem = {
  id: string;
  espece: string;
  numeroTag: string;
  poidsVifKg: number;
  prixAchat: number;
  statut: string;
  createdAt: string;
  photoUrl?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal: AnimalListItem | null;
  onSubmit: (values: AnimalEditValues) => Promise<void>;
  loading?: boolean;
};

function buildSchema(v: (key: string) => string) {
  return z.object({
    espece: z.string().min(1, v("required")),
    poidsVifKg: z.coerce.number().positive(v("required")),
    prixAchat: z.coerce.number().positive(v("required")),
    numeroTag: z.string().trim().min(1, v("required")),
  });
}

export function AnimalEditDialog({
  open,
  onOpenChange,
  animal,
  onSubmit,
  loading = false,
}: Props) {
  const t = useTranslations("animauxList");
  const tCommon = useTranslations("common");
  const schema = useMemo(
    () => buildSchema((k) => tCommon(`validation.${k}`)),
    [tCommon],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnimalEditValues>({
    resolver: formResolver(schema),
    defaultValues: {
      espece: "",
      poidsVifKg: 0,
      prixAchat: 0,
      numeroTag: "",
    },
  });

  const especesQuery = useQuery({
    queryKey: ["referentiels", "espece_animal", "animal-edit"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.referentiels.list("espece_animal")),
    enabled: open,
  });

  useEffect(() => {
    if (!open || !animal) {
      return;
    }
    reset({
      espece: animal.espece,
      poidsVifKg: animal.poidsVifKg,
      prixAchat: animal.prixAchat,
      numeroTag: animal.numeroTag,
    });
  }, [open, animal, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-border bg-card p-5 shadow-lg",
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-semibold">
                {t("editTitle")}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {t("editSubtitle")}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="icon" aria-label={t("close")}>
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-espece">{t("espece")}</Label>
              <select
                id="edit-espece"
                className={nativeSelectClass}
                {...register("espece")}
              >
                <option value="">{tCommon("selectPlaceholder")}</option>
                {(especesQuery.data ?? []).map((item) => {
                  const ref = item as { valeur?: unknown; libelle?: unknown };
                  const val = String(ref.valeur ?? "");
                  return (
                    <option key={val} value={val}>
                      {String(ref.libelle ?? val)}
                    </option>
                  );
                })}
              </select>
              {errors.espece ? (
                <p className="text-sm text-destructive">{errors.espece.message}</p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-poids">{t("poidsVif")}</Label>
                <FormNumberInput
                  control={control}
                  name="poidsVifKg"
                  id="edit-poids"
                />
                {errors.poidsVifKg ? (
                  <p className="text-sm text-destructive">{errors.poidsVifKg.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prix">{t("prixAchat")}</Label>
                <FormNumberInput
                  control={control}
                  name="prixAchat"
                  id="edit-prix"
                />
                {errors.prixAchat ? (
                  <p className="text-sm text-destructive">{errors.prixAchat.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tag">{t("numeroTag")}</Label>
              <Input id="edit-tag" {...register("numeroTag")} />
              {errors.numeroTag ? (
                <p className="text-sm text-destructive">{errors.numeroTag.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 rounded-xl"
                >
                  {tCommon("cancel")}
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={loading || isSubmitting}
                className="min-h-11 rounded-xl"
              >
                {t("saveChanges")}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
