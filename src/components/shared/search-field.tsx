"use client";

import { iconSearch } from "@/lib/icons";
import { cn } from "@/lib/utils";

type SearchFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
};

const SearchIcon = iconSearch;

export function SearchField({
  id,
  value,
  onChange,
  placeholder,
  className,
  "aria-label": ariaLabel,
}: SearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon
        className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="surface-elevated min-h-12 w-full rounded-2xl border border-border/60 py-2.5 ps-11 pe-4 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-h-11 sm:text-sm"
      />
    </div>
  );
}
