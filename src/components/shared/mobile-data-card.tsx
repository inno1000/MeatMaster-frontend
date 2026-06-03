"use client";

import type { AppIcon } from "@/lib/icon-types";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  navToneMedallionClass,
  type NavTone,
} from "@/lib/nav-tone";

/** Liste verticale de cartes — visible uniquement sous le breakpoint md. */
export function MobileCardList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-4 md:hidden", className)}>{children}</div>;
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
        "rounded-2xl border border-border/50 bg-card p-5 shadow-card max-md:rounded-3xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Carte liste type « transaction » (icône + titre + badge). */
export function ListCardRow({
  icon: Icon,
  title,
  meta,
  trailing,
  badge,
  tone = "ocean",
  className,
}: {
  icon?: AppIcon;
  title: string;
  meta?: string;
  trailing?: ReactNode;
  badge?: ReactNode;
  tone?: NavTone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-card max-md:rounded-3xl",
        className,
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            navToneMedallionClass[tone],
          )}
          aria-hidden
        >
          <Icon className="text-2xl" />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        {meta ? (
          <p className="truncate text-sm text-muted-foreground">{meta}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {trailing ? (
          <span className="text-sm font-semibold tabular-nums">{trailing}</span>
        ) : null}
        {badge}
      </div>
    </div>
  );
}

export function StatusPill({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "success" && "bg-zone-sage/15 text-zone-sage",
        variant === "warning" && "bg-zone-amber/15 text-zone-amber",
        variant === "destructive" && "bg-destructive/12 text-destructive",
        variant === "default" && "bg-primary/12 text-primary",
        className,
      )}
    >
      {children}
    </span>
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
