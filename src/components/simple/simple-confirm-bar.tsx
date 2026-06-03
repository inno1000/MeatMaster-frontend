"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  onBack?: () => void;
  onNext: () => void;
  backLabel: string;
  nextLabel: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  className?: string;
};

export function SimpleConfirmBar({
  onBack,
  onNext,
  backLabel,
  nextLabel,
  nextDisabled,
  nextLoading,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom,0px))] z-30 mx-3 mb-1 rounded-2xl border border-border/50 px-4 py-3 glass-bar shadow-card md:inset-x-0 md:mx-0 md:mb-0 md:rounded-none md:border-x-0 md:border-b-0 md:bottom-0",
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg gap-3">
        {onBack ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-14 flex-1 text-lg"
            onClick={onBack}
            disabled={nextLoading}
          >
            {backLabel}
          </Button>
        ) : null}
        <Button
          type="button"
          className={cn(
            "min-h-14 flex-1 text-lg",
            !onBack && "w-full",
          )}
          onClick={onNext}
          disabled={nextDisabled || nextLoading}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
