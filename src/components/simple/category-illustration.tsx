"use client";

import type { AppIcon } from "@/lib/icon-types";
import { cn } from "@/lib/utils";
import {
  getCategoryFallbackIcon,
  getCategoryIllustrationSrc,
} from "@/lib/produits/category-illustration";

type CategoryIllustrationProps = {
  categorieValeur: string;
  libelle: string;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
};

const sizeClasses: Record<NonNullable<CategoryIllustrationProps["size"]>, string> = {
  sm: "size-12",
  md: "size-16",
  lg: "size-24",
  hero: "size-32 sm:size-40",
};

export function CategoryIllustration({
  categorieValeur,
  libelle,
  size = "md",
  className,
}: CategoryIllustrationProps) {
  const src = getCategoryIllustrationSrc(categorieValeur);
  const boxClass = cn(
    "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted/40",
    sizeClasses[size],
    className,
  );

  if (src) {
    return (
      <div className={boxClass} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="h-[88%] w-[88%] object-contain"
        />
      </div>
    );
  }

  const FallbackIcon = getCategoryFallbackIcon(categorieValeur);
  return (
    <div className={boxClass} aria-hidden>
      <FallbackIcon
        className={cn(
          "text-primary/80",
          size === "hero" ? "text-5xl" : size === "lg" ? "text-4xl" : "text-3xl",
        )}
      />
      <span className="sr-only">{libelle}</span>
    </div>
  );
}
