"use client";

import type { AppIcon } from "@/lib/icon-types";
import { cn } from "@/lib/utils";

export type SimpleChoiceOption = {
  id: string;
  label: string;
  icon?: AppIcon;
  /** Illustration (`public/…`) affichée à la place de l’icône si présente. */
  imageSrc?: string;
  selected?: boolean;
};

type Props = {
  options: SimpleChoiceOption[];
  onSelect: (id: string) => void;
  columns?: 2 | 3;
};

export function SimpleChoiceGrid({ options, onSelect, columns = 2 }: Props) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2",
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={cn(
              "flex min-h-[6.5rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-4 text-center shadow-card transition-all duration-200 max-md:rounded-3xl",
              opt.selected
                ? "border-primary bg-primary text-primary-foreground shadow-card-hover"
                : "border-border/60 bg-card hover:border-primary/35 hover:shadow-card-hover",
            )}
          >
            {opt.imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={opt.imageSrc}
                alt=""
                className={cn(
                  "size-16 shrink-0 object-contain",
                  opt.selected && "brightness-110 contrast-105",
                )}
              />
            ) : Icon ? (
              <Icon className="shrink-0 text-4xl" aria-hidden />
            ) : null}
            <span className="text-lg font-semibold leading-tight">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
