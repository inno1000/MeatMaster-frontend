"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/shared/mobile-data-card";
import type { StatusPillVariant } from "@/lib/i18n/status-variant";

export type ListCardField = {
  label: string;
  value: ReactNode;
};

type ListCardProps = {
  title: string;
  statusLabel?: string;
  statusVariant?: StatusPillVariant;
  fields: ListCardField[];
  actions?: ReactNode;
  className?: string;
};

export function ListCard({
  title,
  statusLabel,
  statusVariant = "default",
  fields,
  actions,
  className,
}: ListCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border/50 bg-card p-5 shadow-card max-md:rounded-3xl",
        className,
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-base font-bold leading-snug">{title}</h3>
        {statusLabel ? (
          <StatusPill variant={statusVariant} className="shrink-0">
            {statusLabel}
          </StatusPill>
        ) : null}
      </header>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{field.label}</dt>
            <dd className="mt-0.5 text-sm font-semibold leading-snug">{field.value}</dd>
          </div>
        ))}
      </dl>
      {actions ? (
        <footer className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:flex-wrap">
          {actions}
        </footer>
      ) : null}
    </article>
  );
}
