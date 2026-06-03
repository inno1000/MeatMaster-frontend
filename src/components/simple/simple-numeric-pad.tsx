"use client";

import { Delete } from "lucide-react";
import { useLocale } from "next-intl";
import { formatNumberDisplay } from "@/lib/number-format";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  allowDecimal?: boolean;
  className?: string;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"] as const;

export function SimpleNumericPad({
  value,
  onChange,
  suffix,
  allowDecimal = true,
  className,
}: Props) {
  const locale = useLocale();
  const press = (key: (typeof KEYS)[number]) => {
    if (key === "del") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "." && !allowDecimal) {
      return;
    }
    if (key === "." && value.includes(".")) {
      return;
    }
    onChange(value + key);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-2xl border-2 border-border bg-muted/30 px-4 py-6 text-center">
        <p className="text-4xl font-bold tabular-nums tracking-tight">
          {formatNumberDisplay(value, locale, { allowDecimals })}
          {suffix ? (
            <span className="ms-2 text-2xl font-medium text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => {
          if (key === "." && !allowDecimal) {
            return <div key="dot-spacer" />;
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              className={cn(
                "flex min-h-14 items-center justify-center rounded-xl border border-border bg-card text-2xl font-semibold transition-colors active:bg-primary/15",
                key === "del" && "text-destructive",
              )}
              aria-label={key === "del" ? "effacer" : key}
            >
              {key === "del" ? <Delete className="size-7" /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
