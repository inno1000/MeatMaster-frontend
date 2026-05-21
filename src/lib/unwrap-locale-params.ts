import { use } from "react";

/** Props injectées par Next.js 16 sur les pages sous `[locale]`. */
export type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

/** Déballage obligatoire de `params` dans les pages client (Next.js 16). */
export function useLocaleParams(params: LocalePageProps["params"]): {
  locale: string;
} {
  return use(params);
}
