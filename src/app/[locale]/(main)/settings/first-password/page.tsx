"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { boucherieV1 } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatError } from "@/lib/format-error";
import { formResolver } from "@/lib/form-resolver";
import { getDefaultNewUserPassword } from "@/lib/default-password";
import { getDefaultPathForRole } from "@/lib/authz";
import { useRouter } from "@/i18n/navigation";

function buildSchema(t: (key: string) => string) {
  return z
    .object({
      password: z.string().min(8, t("tooShort")),
      confirm: z.string().min(1),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("mismatch"),
          path: ["confirm"],
        });
      }
      if (data.password === getDefaultNewUserPassword()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("sameAsDefault"),
          path: ["password"],
        });
      }
    });
}

type FirstPwdInput = z.infer<ReturnType<typeof buildSchema>>;

function SettingsFirstPasswordPage() {
  const t = useTranslations("settings.firstPassword");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const markPasswordChanged = useAuthStore((s) => s.markPasswordChanged);

  const schema = useMemo(() => buildSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FirstPwdInput>({
    resolver: formResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const id = user?.id?.trim();
    if (!id) {
      toast.error(t("missingUserId"));
      return;
    }
    try {
      await boucherieV1.users.update(id, {
        password: values.password,
        password_confirmation: values.confirm,
      });
      markPasswordChanged();
      toast.success(t("success"));
      router.replace(
        user?.role ? getDefaultPathForRole(user.role) : "/dashboard",
      );
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

      <ParentCard title={t("title")} titleIcon={KeyRound}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="np">{t("newPassword")}</Label>
            <Input
              id="np"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="npc">{t("confirmPassword")}</Label>
            <Input
              id="npc"
              type="password"
              autoComplete="new-password"
              {...register("confirm")}
            />
            {errors.confirm ? (
              <p className="text-sm text-destructive">{errors.confirm.message}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {t("submit")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(SettingsFirstPasswordPage);
