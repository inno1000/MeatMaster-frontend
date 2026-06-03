"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { PackageOpen } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AudioRecorder } from "@/components/shared/audio-recorder";
import { nativeSelectClass } from "@/lib/ui-classes";
import { boucherieV1, uploadAudioBlobs } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { FormNumberInput } from "@/components/shared/form-number-input";
import { SelectFieldSkeleton } from "@/components/shared/loading-skeletons";
import {
  expectedReceptionQuantity,
  filterDistributionsForReception,
  formatDistributionOptionLabel,
} from "@/lib/distributions/reception-options";

function buildSchema(v: (key: string) => string) {
  return z.object({
    distributionId: z.string().min(1, v("distributionRequired")),
    quantity: z.coerce.number().positive(v("qtyRequired")),
    dateReception: z.string().min(1, v("dateRequired")),
    notes: z.string().optional(),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

function StockReceptionPage() {
  const t = useTranslations("stockReception");
  const router = useRouter();
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(schema),
    defaultValues: {
      distributionId: "",
      quantity: 0,
      dateReception: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  const distributionsQuery = useQuery({
    queryKey: ["distributions", "for-reception", "en_attente"],
    queryFn: async () =>
      unwrapDataArray(
        await boucherieV1.distributions.list({ statut: "en_attente" }),
      ),
  });

  const pendingDistributions = useMemo(
    () => filterDistributionsForReception(distributionsQuery.data),
    [distributionsQuery.data],
  );

  const watchedDistributionId = useWatch({ control, name: "distributionId" });

  useEffect(() => {
    if (!watchedDistributionId) {
      return;
    }
    const row = pendingDistributions.find(
      (d) => String(d.id ?? "") === watchedDistributionId,
    );
    if (!row) {
      return;
    }
    const qty = expectedReceptionQuantity(row);
    if (qty > 0) {
      setValue("quantity", qty, { shouldValidate: true });
    }
  }, [watchedDistributionId, pendingDistributions, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const attachmentIds = await uploadAudioBlobs(audioBlobs);
      await boucherieV1.receptions.create({
        distribution_id: values.distributionId,
        quantite_recue: values.quantity,
        date_reception: values.dateReception,
        notes: values.notes || undefined,
        ...(attachmentIds.length > 0 ? { attachment_ids: attachmentIds } : {}),
      });
      toast.success(t("toastOk"));
      router.push("/stock/journal");
    } catch (error) {
      toast.error(formatError(error));
    }
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ParentCard title={t("title")} titleIcon={PackageOpen}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="distributionId">{t("distributionLabel")}</Label>
            {distributionsQuery.isPending ? (
              <SelectFieldSkeleton />
            ) : (
              <select
                id="distributionId"
                className={nativeSelectClass}
                {...register("distributionId")}
              >
                <option value="">{tCommon("selectPlaceholder")}</option>
                {pendingDistributions.map((d) => {
                  const id = String(d.id ?? "");
                  return (
                    <option key={id} value={id}>
                      {formatDistributionOptionLabel(d, tCommon("noLabel"))}
                    </option>
                  );
                })}
              </select>
            )}
            {!distributionsQuery.isPending && pendingDistributions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noPendingDistribution")}</p>
            ) : null}
            {errors.distributionId ? (
              <p className="text-sm text-destructive">
                {errors.distributionId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">{t("quantity")}</Label>
            <FormNumberInput control={control} name="quantity" id="quantity" />
            {errors.quantity ? (
              <p className="text-sm text-destructive">
                {errors.quantity.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateReception">{t("dateReception")}</Label>
            <Input id="dateReception" type="date" {...register("dateReception")} />
            {errors.dateReception ? (
              <p className="text-sm text-destructive">{errors.dateReception.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Input id="notes" {...register("notes")} />
          </div>
          <AudioRecorder onBlobsChange={setAudioBlobs} />
          <Button
            type="submit"
            disabled={isSubmitting || pendingDistributions.length === 0}
          >
            {t("submit")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(StockReceptionPage);
