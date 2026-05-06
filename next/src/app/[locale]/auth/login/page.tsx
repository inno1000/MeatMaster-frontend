"use client";

import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/auth/login-form";
import { Link } from "@/i18n/navigation";
import { Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tReg = useTranslations("auth.register");

  return (
    <div className="auth-ambient relative flex min-h-dvh flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      <div className="absolute end-3 top-3 z-10 sm:end-4 sm:top-4">
        <LocaleSwitcher />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-8 safe-pad-x safe-pad-b">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 shadow-sm ring-1 ring-primary/20">
            <Package className="size-8 text-primary" aria-hidden />
          </span>
        </div>
        <Card className="shadow-float ring-1 ring-black/[0.04]">
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
