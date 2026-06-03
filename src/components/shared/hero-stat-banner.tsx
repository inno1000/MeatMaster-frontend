import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeroStatBannerProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
};

export function HeroStatBanner({ label, value, hint, className }: HeroStatBannerProps) {
  return (
    <section
      className={cn(
        "hero-gradient rounded-3xl px-6 py-6 text-primary-foreground shadow-card",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/85">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-sm text-primary-foreground/80">{hint}</p>
      ) : null}
    </section>
  );
}
