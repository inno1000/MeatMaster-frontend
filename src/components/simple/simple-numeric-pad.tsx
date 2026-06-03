"use client";

import { iconBackspace } from "@/lib/icons";
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
const BackspaceIcon = iconBackspace;

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
      <div className="surface-elevated rounded-3xl border border-border/50 px-4 py-8 text-center shadow-card">
        <p className="text-5xl font-bold tabular-nums tracking-tight sm:text-6xl">
          {formatNumberDisplay(value, locale, { allowDecimals: allowDecimal })}
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
                "flex min-h-14 items-center justify-center rounded-2xl border border-border/60 bg-card text-2xl font-semibold shadow-sm transition-all active:scale-[0.98] active:bg-primary/15",
                key === "del" && "text-destructive",
              )}
              aria-label={key === "del" ? "effacer" : key}
            >
              {key === "del" ? <BackspaceIcon className="text-3xl" /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
