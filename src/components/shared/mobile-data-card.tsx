"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Liste verticale de cartes — visible uniquement sous le breakpoint md. */
export function MobileCardList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-3 md:hidden", className)}>{children}</div>;
}

/**
 * Conteneur tableau desktop : un seul `<div>` avec défilement horizontal,
 * enfant attendu = `<table>` (pas de `<tr>` direct).
 */
export function DesktopDataTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "hidden md:block -mx-3 overflow-x-auto overscroll-x-contain px-3 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:px-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MobileDataCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MobileDataRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={cn(
          "min-w-0 text-end font-medium",
          emphasize && "text-base font-semibold tabular-nums",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function MobileDataActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:flex-wrap",
        className,
      )}
    >
      {children}
    </div>
  );
}
