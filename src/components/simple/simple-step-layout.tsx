"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  step: number;
  totalSteps: number;
  children: ReactNode;
  className?: string;
};

export function SimpleStepLayout({
  icon: Icon,
  title,
  step,
  totalSteps,
  children,
  className,
}: Props) {
  return (
    <div className={cn("mx-auto w-full max-w-lg space-y-6 pb-28", className)}>
      <div className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Icon className="size-8" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {step} / {totalSteps}
          </p>
          <h1 className="text-2xl font-bold leading-tight">{title}</h1>
        </div>
      </div>
      {children}
    </div>
  );
}
