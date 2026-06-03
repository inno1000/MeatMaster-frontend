"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { ShoppingBag } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nativeSelectClass } from "@/lib/ui-classes";
import { formResolver } from "@/lib/form-resolver";
import { FormNumberInput } from "@/components/shared/form-number-input";
import { ImagePicker } from "@/components/shared/image-picker";
import { boucherieV1, uploadImageFiles } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { SelectFieldSkeleton } from "@/components/shared/loading-skeletons";

function buildSchema(v: (key: string) => string) {
  return z.object({
    dateAchat: z.string().min(1, v("dateRequired")),
    notes: z.string().optional(),
    especeValeur: z.string().min(1, v("required")),
    poidsVifKg: z.coerce.number().positive(v("required")),
    prixAchat: z.coerce.number().positive(v("required")),
    numeroTag: z.string().trim().min(1, v("required")),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

function AbattageAchatsPage() {
  const t = useTranslations("achatsFournisseur");
  const router = useRouter();
  const tCommon = useTranslations("common");
  const schema = useMemo(
    () => buildSchema((k) => tCommon(`validation.${k}`)),
    [tCommon],
  );
  const queryClient = useQueryClient();
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(schema),
    defaultValues: {
      dateAchat: new Date().toISOString().slice(0, 10),
      notes: "",
      especeValeur: "",
      poidsVifKg: 0,
      prixAchat: 0,
      numeroTag: "",
    },
  });

  const especesQuery = useQuery({
    queryKey: ["referentiels", "espece_animal", "achats-form"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.referentiels.list("espece_animal")),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const attachmentIds = await uploadImageFiles(photoFiles);
      await boucherieV1.achatsFournisseurs.create({
        date_achat: values.dateAchat,
        notes: values.notes || undefined,
        animaux: [
          {
            espece: values.especeValeur,
            poids_vif_kg: values.poidsVifKg,
            prix_achat: values.prixAchat,
            numero_tag: values.numeroTag,
            ...(attachmentIds.length > 0 ? { attachment_ids: attachmentIds } : {}),
          },
        ],
      });
      toast.success(t("toastOk"));
      await queryClient.invalidateQueries({ queryKey: ["animaux"] });
      await queryClient.invalidateQueries({ queryKey: ["achats-fournisseurs"] });
      router.push("/abattage/animaux");
    } catch (error) {
      toast.error(formatError(error));
    }
  });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
      </div>
      <ParentCard title={t("title")} titleIcon={ShoppingBag}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dateAchat">{t("dateAchat")}</Label>
            <Input id="dateAchat" type="date" {...register("dateAchat")} />
            {errors.dateAchat ? (
              <p className="text-sm text-destructive">{errors.dateAchat.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="especeValeur">{t("espece")}</Label>
            {especesQuery.isPending ? (
              <SelectFieldSkeleton />
            ) : (
              <select
                id="especeValeur"
                className={nativeSelectClass}
                {...register("especeValeur")}
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
            )}
            {errors.especeValeur ? (
              <p className="text-sm text-destructive">{errors.especeValeur.message}</p>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="poidsVifKg">{t("poidsVif")}</Label>
              <FormNumberInput
                control={control}
                name="poidsVifKg"
                id="poidsVifKg"
              />
              {errors.poidsVifKg ? (
                <p className="text-sm text-destructive">{errors.poidsVifKg.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="prixAchat">{t("prixAchat")}</Label>
              <FormNumberInput
                control={control}
                name="prixAchat"
                id="prixAchat"
              />
              {errors.prixAchat ? (
                <p className="text-sm text-destructive">{errors.prixAchat.message}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numeroTag">{t("numeroTag")}</Label>
            <Input id="numeroTag" {...register("numeroTag")} />
            {errors.numeroTag ? (
              <p className="text-sm text-destructive">{errors.numeroTag.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Input id="notes" {...register("notes")} />
          </div>
          <ImagePicker
            label={t("animalPhotos")}
            onFilesChange={setPhotoFiles}
          />
          <Button type="submit" disabled={isSubmitting}>
            {t("submit")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(AbattageAchatsPage);
