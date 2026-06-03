import type { AppIcon } from "@/lib/icon-types";
import { iconStockGroup } from "@/lib/icons";
import { materialIcon } from "@/lib/material-icon";

/** Illustrations statiques (`public/categories/*.svg`) par code `categorie_produit`. */
const CATEGORY_IMAGE_SRC: Record<string, string> = {
  viande_rouge: "/categories/viande-rouge.svg",
  abats: "/categories/abats.svg",
  charcuterie: "/categories/charcuterie.svg",
  tripes: "/categories/tripes.svg",
  autre: "/categories/autre.svg",
};

const iconCategoryFallback: AppIcon = iconStockGroup;
const iconCategoryMeat: AppIcon = materialIcon("restaurant");
const iconCategoryAbats: AppIcon = materialIcon("set_meal");
const iconCategoryCharcuterie: AppIcon = materialIcon("lunch_dining");

const CATEGORY_FALLBACK_ICON: Record<string, AppIcon> = {
  viande_rouge: iconCategoryMeat,
  abats: iconCategoryAbats,
  charcuterie: iconCategoryCharcuterie,
  tripes: iconCategoryAbats,
  autre: iconCategoryFallback,
};

export function getCategoryIllustrationSrc(valeur: string): string | undefined {
  const code = valeur.trim().toLowerCase();
  return CATEGORY_IMAGE_SRC[code];
}

export function getCategoryFallbackIcon(valeur: string): AppIcon {
  const code = valeur.trim().toLowerCase();
  return CATEGORY_FALLBACK_ICON[code] ?? iconCategoryFallback;
}
