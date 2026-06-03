import type { AppIcon } from "@/lib/icon-types";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: AppIcon;
  message: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center",
        className,
      )}
    >
      <span
        className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        aria-hidden
      >
        <Icon className="text-4xl" />
      </span>
      <p className="mt-4 max-w-sm text-sm text-muted-foreground">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
