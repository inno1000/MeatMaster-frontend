"use client";

import { useForm } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { RegisterSchema, type RegisterInput } from "@/lib/schemas/auth";
import { apiRegister } from "@/lib/api/services/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatError } from "@/lib/format-error";
import { useRouter } from "@/i18n/navigation";
import { getDefaultPathForRole } from "@/lib/authz";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const tLogin = useTranslations("auth.login");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: formResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const user = await apiRegister({
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
        password_confirmation: data.password,
      });
      useAuthStore.setState({ user });
      toast.success(tCommon("success"));
      router.replace(getDefaultPathForRole(user.role));
    } catch (e) {
      toast.error(formatError(e));
    }
  });

  return (
    <div className="auth-ambient relative flex min-h-dvh flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      <div className="absolute end-3 top-3 z-10 sm:end-4 sm:top-4">
        <LocaleSwitcher />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-8 safe-pad-x safe-pad-b">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <AppLogo variant="auth" alt={tCommon("appName")} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("firstName")}</Label>
                  <Input id="firstName" {...register("firstName")} />
                  {errors.firstName ? (
                    <p className="text-sm text-destructive">
                      {errors.firstName.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("lastName")}</Label>
                  <Input id="lastName" {...register("lastName")} />
                  {errors.lastName ? (
                    <p className="text-sm text-destructive">
                      {errors.lastName.message}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email ? (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {t("submit")}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link
                href="/auth/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {tLogin("title")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
