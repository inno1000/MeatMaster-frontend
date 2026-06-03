import type { AppIcon } from "@/lib/icon-types";
import { cn } from "@/lib/utils";
import {
  navToneCardHoverClass,
  navToneMedallionClass,
  navToneValueClass,
  type NavTone,
} from "@/lib/nav-tone";

type StatCardProps = {
  icon: AppIcon;
  value: React.ReactNode;
  label: string;
  hint?: string;
  tone?: NavTone;
  className?: string;
};

export function StatCard({
  icon: Icon,
  value,
  label,
  hint,
  tone = "wine",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/50 bg-card p-5 text-center shadow-card transition-shadow duration-200 sm:p-6",
        navToneCardHoverClass[tone],
        className,
      )}
    >
      <span
        className={cn(
          "mx-auto flex size-11 items-center justify-center rounded-2xl sm:size-12",
          navToneMedallionClass[tone],
        )}
        aria-hidden
      >
        <Icon className="text-2xl sm:text-3xl" />
      </span>
      <p
        className={cn(
          "mt-3 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl",
          navToneValueClass[tone],
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      {hint ? (
        <p className="mt-2 text-xs font-medium text-muted-foreground/90">{hint}</p>
      ) : null}
    </div>
  );
}
