"use client";

import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/auth/login-form";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { AppLogo } from "@/components/shared/app-logo";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tReg = useTranslations("auth.register");
  const tCommon = useTranslations("common");

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
            <LoginForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link
                href="/auth/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {tReg("title")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
