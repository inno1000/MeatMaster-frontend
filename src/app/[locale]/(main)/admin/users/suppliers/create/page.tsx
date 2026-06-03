"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { iconAdminSuppliers } from "@/lib/icons";
import { ParentCard } from "@/components/shared/parent-card";
import { DefaultPasswordNotice } from "@/components/admin/default-password-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { boucherieV1 } from "@/lib/api";
import {
  buildSupplierCreateSchema,
  emptyFournisseurForm,
  toApiFournisseurBody,
  type SupplierCreateInput,
} from "@/lib/admin/users-forms";
import { formatError } from "@/lib/format-error";
import { formResolver } from "@/lib/form-resolver";
import { getDefaultNewUserPassword } from "@/lib/default-password";

function AdminCreateSupplierPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const schema = useMemo(
    () => buildSupplierCreateSchema((k) => tCommon(`validation.${k}`)),
    [tCommon],
  );
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierCreateInput>({
    resolver: formResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      fournisseur: emptyFournisseurForm(),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const fournisseur = toApiFournisseurBody(values.fournisseur);
      if (!fournisseur) {
        toast.error(tCommon("validation.supplierEntityRequired"));
        return;
      }
      await boucherieV1.users.create({
        name: values.name,
        email: values.email,
        password: getDefaultNewUserPassword(),
        role: "fournisseur",
        fournisseur,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(
        t("supplierCreatedWithPassword", { password: getDefaultNewUserPassword() }),
      );
      router.push("/admin/users/list");
    } catch (error) {
      toast.error(formatError(error));
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("pageCreateSupplierTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("pageCreateSupplierSubtitle")}
        </p>
      </div>

      <ParentCard title={t("pageCreateSupplierTitle")} titleIcon={iconAdminSuppliers}>
        <DefaultPasswordNotice />
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplierName">{t("accountName")}</Label>
              <Input id="supplierName" {...register("name")} />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierEmail">{t("formEmail")}</Label>
              <Input id="supplierEmail" type="email" {...register("email")} />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="border-t border-border pt-3 sm:col-span-2">
              <p className="mb-3 text-sm font-medium">{t("supplierEntity")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sfNom">{t("entityName")}</Label>
                  <Input id="sfNom" {...register("fournisseur.nom")} />
                  {errors.fournisseur?.nom ? (
                    <p className="text-sm text-destructive">{errors.fournisseur.nom.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sfContact">{t("supplierContactLabel")}</Label>
                  <p className="text-xs text-muted-foreground">{t("supplierContactHint")}</p>
                  <Input
                    id="sfContact"
                    autoComplete="name"
                    {...register("fournisseur.contact")}
                  />
                  {errors.fournisseur?.contact ? (
                    <p className="text-sm text-destructive">{errors.fournisseur.contact.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sfTel">{t("supplierPhoneLabel")}</Label>
                  <p className="text-xs text-muted-foreground">{t("supplierPhoneHint")}</p>
                  <Input
                    id="sfTel"
                    type="tel"
                    autoComplete="tel"
                    {...register("fournisseur.telephone")}
                  />
                  {errors.fournisseur?.telephone ? (
                    <p className="text-sm text-destructive">{errors.fournisseur.telephone.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sfEmail">{t("emailOptional")}</Label>
                  <Input id="sfEmail" type="email" {...register("fournisseur.email")} />
                  {errors.fournisseur?.email ? (
                    <p className="text-sm text-destructive">{errors.fournisseur.email.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="sfAdresse">{t("addressOptional")}</Label>
                  <Input id="sfAdresse" {...register("fournisseur.adresse")} />
                  {errors.fournisseur?.adresse ? (
                    <p className="text-sm text-destructive">{errors.fournisseur.adresse.message}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {t("createSupplierButton")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(AdminCreateSupplierPage);
