"use client";

import { use, type ComponentType } from "react";
import type { LocalePageProps } from "@/lib/unwrap-locale-params";

/**
 * Enveloppe les pages client sous `[locale]` pour déballer `params` (Next.js 16).
 */
export function withLocaleParams<P extends object = Record<string, never>>(
  Inner: ComponentType<P>,
): ComponentType<P & LocalePageProps> {
  function LocaleParamsPage({ params, ...props }: P & LocalePageProps) {
    use(params);
    return <Inner {...(props as P)} />;
  }

  LocaleParamsPage.displayName = `WithLocaleParams(${Inner.displayName ?? Inner.name ?? "Page"})`;

  return LocaleParamsPage;
}
