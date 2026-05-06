"use client";

import { useForm } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { LoginSchema, type LoginInput } from "@/lib/schemas/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatError } from "@/lib/format-error";
import { canAccessPath, getDefaultPathForRole } from "@/lib/authz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isApiEnabled } from "@/lib/api/config";

export const LoginForm = () => {
  const t = useTranslations("auth.login");
  const tCommon = useTranslations("common");
  const demoSupplier2Label = t.has("demoSupplier2")
    ? t("demoSupplier2")
    : `${t("demoSupplier")} 2`;
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const setReturnUrl = useAuthStore((s) => s.setReturnUrl);
  const returnUrl = useAuthStore((s) => s.returnUrl);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: formResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null);
    try {
      await login(data.email, data.password);
      toast.success(tCommon("success"));
      const next = returnUrl;
      setReturnUrl(null);
      const currentUser = useAuthStore.getState().user;
      const roleDefault = currentUser
        ? getDefaultPathForRole(currentUser.role)
        : "/dashboard";
      const target =
        currentUser && next && canAccessPath(currentUser.role, next)
          ? next
          : roleDefault;
      router.replace(target);
    } catch (e) {
      const msg = formatError(e);
      setApiError(msg);
      toast.error(msg);
    }
  });

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      {apiError ? (
        <Alert variant="destructive">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="pr-12"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {!isApiEnabled() ? (
        <Alert>
          <AlertDescription>
            <span className="block font-medium">{t("demoAccountsTitle")}</span>
            <span className="block">
              {t("demoButcher")}: <code>boucher@meatmaster.local / 123456</code>
            </span>
            <span className="block">
              {t("demoSupplier")}:{" "}
              <code>fournisseur@meatmaster.local / 123456</code>
            </span>
            <span className="block">
              {demoSupplier2Label}:{" "}
              <code>fournisseur2@meatmaster.local / 123456</code>
            </span>
            <span className="block">
              {t("demoAdmin")}: <code>admin@meatmaster.local / 123456</code>
            </span>
          </AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {t("submit")}
      </Button>
    </form>
  );
};
