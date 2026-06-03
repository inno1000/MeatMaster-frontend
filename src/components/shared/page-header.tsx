import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  greeting?: string;
  action?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  greeting,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        {greeting ? (
          <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
