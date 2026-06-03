"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { iconButcheryGroup } from "@/lib/icons";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ButcherFormSchema,
  type ButcherFormInput,
} from "@/lib/schemas/butcher";
import { useCreateButcher } from "@/lib/hooks/use-butchers";
import { AudioRecorder } from "@/components/shared/audio-recorder";
import { uploadAudioBlobs } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

function BoucherieEnregistrerPage() {
  const t = useTranslations("boucherie");
  const router = useRouter();
  const createButcher = useCreateButcher();
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ButcherFormInput>({
    resolver: formResolver(ButcherFormSchema),
    defaultValues: {
      nom: "",
      adresse: "",
      ville: "",
      telephone: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const attachmentIds = await uploadAudioBlobs(audioBlobs);
      await createButcher.mutateAsync({
        ...data,
        attachmentIds,
      });
      router.push("/boucherie/liste");
    } catch (e) {
      toast.error(formatError(e));
    }
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("createTitle")}</h1>
        <p className="text-muted-foreground">{t("createSubtitle")}</p>
      </div>
      <ParentCard title={t("createTitle")} titleIcon={iconButcheryGroup}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">{t("name")}</Label>
            <Input id="nom" {...register("nom")} />
            {errors.nom ? (
              <p className="text-sm text-destructive">{errors.nom.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="adresse">{t("address")}</Label>
            <Input id="adresse" {...register("adresse")} />
            {errors.adresse ? (
              <p className="text-sm text-destructive">
                {errors.adresse.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ville">{t("city")}</Label>
              <Input id="ville" {...register("ville")} />
              {errors.ville ? (
                <p className="text-sm text-destructive">{errors.ville.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">{t("phone")}</Label>
              <Input id="telephone" {...register("telephone")} />
              {errors.telephone ? (
                <p className="text-sm text-destructive">
                  {errors.telephone.message}
                </p>
              ) : null}
            </div>
          </div>

          <AudioRecorder onBlobsChange={setAudioBlobs} />

          <Button type="submit" disabled={createButcher.isPending || isSubmitting}>
            {t("submit")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(BoucherieEnregistrerPage);
