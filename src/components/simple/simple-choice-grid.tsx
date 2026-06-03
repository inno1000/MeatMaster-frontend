"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SimpleChoiceOption = {
  id: string;
  label: string;
  icon?: LucideIcon;
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
              "flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-4 text-center transition-colors",
              opt.selected
                ? "border-primary bg-primary/12 text-primary"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/50",
            )}
          >
            {Icon ? <Icon className="size-10 shrink-0" aria-hidden /> : null}
            <span className="text-lg font-semibold leading-tight">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
