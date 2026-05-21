"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { UserCircle } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { boucherieV1, isApiEnabled } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatError } from "@/lib/format-error";
import { formResolver } from "@/lib/form-resolver";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ProfileSchema = z.object({
  name: z.string().min(1, "Requis"),
  email: z.string().email("E-mail invalide"),
});

type ProfileInput = z.infer<typeof ProfileSchema>;

function SettingsProfilePage() {
  const t = useTranslations("settings.profile");
  const tCommon = useTranslations("common");
  const user = useAuthStore((s) => s.user);
  const patchProfile = useAuthStore((s) => s.patchProfile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const apiOk = isApiEnabled();

  const defaultValues = useMemo(
    () => ({
      name: user?.name ?? "",
      email: user?.email ?? "",
    }),
    [user?.name, user?.email],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: formResolver(ProfileSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (apiOk && user?.token) {
      void refreshProfile().catch(() => {
        /* session locale conservée si /auth/me échoue */
      });
    }
  }, [apiOk, user?.token, refreshProfile]);

  const onSubmit = handleSubmit(async (values) => {
    const id = user?.id?.trim();
    if (!id) {
      toast.error(t("missingUserId"));
      return;
    }
    try {
      await boucherieV1.users.update(id, {
        name: values.name.trim(),
        email: values.email.trim(),
      });
      patchProfile({
        name: values.name.trim(),
        email: values.email.trim(),
      });
      toast.success(t("saved"));
    } catch (e) {
      toast.error(formatError(e));
    }
  });

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
      </div>

      <ParentCard title={t("title")} titleIcon={UserCircle}>
        {!apiOk ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{tCommon("apiNotConfigured")}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" {...register("name")} autoComplete="name" />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              autoComplete="email"
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          {user?.role ? (
            <p className="text-sm text-muted-foreground">
              {t("role")}: <span className="font-medium">{user.role}</span>
            </p>
          ) : null}
          <Button type="submit" disabled={!apiOk || isSubmitting}>
            {t("save")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(SettingsProfilePage);
