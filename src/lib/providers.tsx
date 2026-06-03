"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { useAuthStore } from "@/lib/stores/auth-store";

type ProvidersProps = {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
};

export const Providers = ({ children, locale, messages }: ProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          {children}
          <Toaster
            richColors
            position="top-center"
            toastOptions={{
              classNames: {
                toast:
                  "rounded-2xl border-border/60 bg-card/95 backdrop-blur-md",
                title: "font-semibold tracking-tight",
                description: "text-muted-foreground",
              },
            }}
          />
        </NuqsAdapter>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
};
