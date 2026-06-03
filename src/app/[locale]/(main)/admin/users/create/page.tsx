"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { iconAdminUserCreate } from "@/lib/icons";
import { ParentCard } from "@/components/shared/parent-card";
import { DefaultPasswordNotice } from "@/components/admin/default-password-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { boucherieV1 } from "@/lib/api";
import {
  ROLE_VALUES,
  buildUserCreateSchema,
  emptyFournisseurForm,
  toApiFournisseurBody,
  type UserCreateInput,
} from "@/lib/admin/users-forms";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { formResolver } from "@/lib/form-resolver";
import { nativeSelectClass } from "@/lib/ui-classes";
import { getDefaultNewUserPassword } from "@/lib/default-password";

function AdminCreateUserPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const schema = useMemo(
    () => buildUserCreateSchema((k) => tCommon(`validation.${k}`)),
    [tCommon],
  );
  const roleOptions = useMemo(
    () =>
      ROLE_VALUES.map((value) => ({
        value,
        label:
          value === "admin"
            ? t("roleAdmin")
            : value === "boucher"
              ? t("roleBoucher")
              : t("roleFournisseur"),
      })),
    [t],
  );
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateInput>({
    resolver: formResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      role: "boucher",
      boucherie_id: "",
      fournisseur: emptyFournisseurForm(),
    },
  });

  const createUserRole = watch("role");

  useEffect(() => {
    if (createUserRole !== "boucher") {
      setValue("boucherie_id", "", { shouldValidate: true });
    }
    if (createUserRole !== "fournisseur") {
      setValue("fournisseur", emptyFournisseurForm(), { shouldValidate: true });
    }
  }, [createUserRole, setValue]);

  const butcheriesQuery = useQuery({
    queryKey: ["admin", "boucheries"],
    queryFn: async () => unwrapDataArray(await boucherieV1.boucheries.list()),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const body: Record<string, unknown> = {
        name: values.name,
        email: values.email,
        password: getDefaultNewUserPassword(),
        role: values.role,
      };
      if (values.role === "fournisseur") {
        const f = toApiFournisseurBody(values.fournisseur);
        if (f) {
          body.fournisseur = f;
        }
      } else if (values.role === "boucher") {
        body.boucherie_id = values.boucherie_id || undefined;
      }
      await boucherieV1.users.create(body);
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(
        t("userCreatedWithPassword", { password: getDefaultNewUserPassword() }),
      );
      router.push("/admin/users/list");
    } catch (error) {
      toast.error(formatError(error));
    }
  });

  const needsBoucherie = createUserRole === "boucher";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("pageCreateUserTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("pageCreateUserSubtitle")}</p>
      </div>

      <ParentCard title={t("pageCreateUserTitle")} titleIcon={iconAdminUserCreate}>
        <DefaultPasswordNotice />
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("formName")}</Label>
              <Input id="name" {...register("name")} />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("formEmail")}</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t("formRole")}</Label>
              <select id="role" className={nativeSelectClass} {...register("role")}>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role ? (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              ) : null}
            </div>
            {createUserRole === "fournisseur" ? (
              <div className="space-y-3 sm:col-span-2">
                <div>
                  <Label>{t("supplierEntity")}</Label>
                  <p className="text-xs text-muted-foreground">{t("supplierEntityOptionalHint")}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fournisseurNom">{t("entityName")}</Label>
                    <Input id="fournisseurNom" {...register("fournisseur.nom")} />
                    {errors.fournisseur?.nom ? (
                      <p className="text-sm text-destructive">{errors.fournisseur.nom.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fournisseurContact">{t("supplierContactLabel")}</Label>
                    <p className="text-xs text-muted-foreground">{t("supplierContactHint")}</p>
                    <Input
                      id="fournisseurContact"
                      autoComplete="name"
                      {...register("fournisseur.contact")}
                    />
                    {errors.fournisseur?.contact ? (
                      <p className="text-sm text-destructive">{errors.fournisseur.contact.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fournisseurTel">{t("supplierPhoneLabel")}</Label>
                    <p className="text-xs text-muted-foreground">{t("supplierPhoneHint")}</p>
                    <Input
                      id="fournisseurTel"
                      type="tel"
                      autoComplete="tel"
                      {...register("fournisseur.telephone")}
                    />
                    {errors.fournisseur?.telephone ? (
                      <p className="text-sm text-destructive">{errors.fournisseur.telephone.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fournisseurEmail">{t("emailOptional")}</Label>
                    <Input id="fournisseurEmail" type="email" {...register("fournisseur.email")} />
                    {errors.fournisseur?.email ? (
                      <p className="text-sm text-destructive">{errors.fournisseur.email.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="fournisseurAdresse">{t("addressOptional")}</Label>
                    <Input id="fournisseurAdresse" {...register("fournisseur.adresse")} />
                    {errors.fournisseur?.adresse ? (
                      <p className="text-sm text-destructive">{errors.fournisseur.adresse.message}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : needsBoucherie ? (
              <div className="space-y-2">
                <Label htmlFor="boucherieId">
                  {tCommon("butchery")}
                  <span className="text-destructive"> *</span>
                </Label>
                <select
                  id="boucherieId"
                  className={nativeSelectClass}
                  required
                  {...register("boucherie_id")}
                >
                  <option value="">{tCommon("selectButchery")}</option>
                  {(butcheriesQuery.data ?? []).map((item) => {
                    const b = item as { id?: unknown; nom?: unknown; name?: unknown };
                    return (
                      <option key={String(b.id ?? "")} value={String(b.id ?? "")}>
                        {String(b.nom ?? b.name ?? tCommon("butchery"))}
                      </option>
                    );
                  })}
                </select>
                {errors.boucherie_id ? (
                  <p className="text-sm text-destructive">{errors.boucherie_id.message}</p>
                ) : null}
              </div>
            ) : null}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {t("createUserButton")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(AdminCreateUserPage);
