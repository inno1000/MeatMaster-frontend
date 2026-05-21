"use client";

import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { boucherieV1 } from "@/lib/api";
import {
  ButcheryCreateSchema,
  type ButcheryCreateInput,
} from "@/lib/admin/users-forms";
import { formatError } from "@/lib/format-error";
import { formResolver } from "@/lib/form-resolver";

export default function AdminCreateButcheryPage() {
  const t = useTranslations("admin");
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ButcheryCreateInput>({
    resolver: formResolver(ButcheryCreateSchema),
    defaultValues: {
      nom: "",
      adresse: "",
      ville: "",
      telephone: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await boucherieV1.boucheries.create({
        nom: values.nom,
        adresse: values.adresse,
        ville: values.ville,
        telephone: values.telephone,
        actif: true,
      });
      reset();
      await queryClient.invalidateQueries({ queryKey: ["admin", "boucheries"] });
      await queryClient.invalidateQueries({ queryKey: ["butchers"] });
      toast.success("Boucherie créée.");
    } catch (error) {
      toast.error(formatError(error));
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("pageCreateButcheryTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("pageCreateButcherySubtitle")}
        </p>
      </div>

      <ParentCard title={t("pageCreateButcheryTitle")} titleIcon={Building2}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="butcheryNom">Nom</Label>
              <Input id="butcheryNom" {...register("nom")} />
              {errors.nom ? (
                <p className="text-sm text-destructive">{errors.nom.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="butcheryVille">Ville</Label>
              <Input id="butcheryVille" {...register("ville")} />
              {errors.ville ? (
                <p className="text-sm text-destructive">{errors.ville.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="butcheryAdresse">Adresse</Label>
              <Input id="butcheryAdresse" {...register("adresse")} />
              {errors.adresse ? (
                <p className="text-sm text-destructive">{errors.adresse.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="butcheryTelephone">Téléphone</Label>
              <Input id="butcheryTelephone" {...register("telephone")} />
              {errors.telephone ? (
                <p className="text-sm text-destructive">{errors.telephone.message}</p>
              ) : null}
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            Créer boucherie
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}
