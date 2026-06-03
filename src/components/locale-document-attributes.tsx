"use client";

import { useEffect } from "react";

type Props = {
  locale: string;
};

/** Met à jour `lang` et `dir` sur `<html>` (défini dans le root layout). */
export function LocaleDocumentAttributes({ locale }: Props) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
