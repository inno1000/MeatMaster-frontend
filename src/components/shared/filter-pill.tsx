"use client";

import { cn } from "@/lib/utils";

export type FilterPillOption<T extends string = string> = {
  value: T;
  label: string;
};

type FilterPillGroupProps<T extends string = string> = {
  options: FilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
};

export function FilterPillGroup<T extends string = string>({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: FilterPillGroupProps<T>) {
  return (
    <div
      className={cn("pill-track -mx-0.5", className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-webkit-overflow-scrolling:touch]">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value || "__all__"}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
