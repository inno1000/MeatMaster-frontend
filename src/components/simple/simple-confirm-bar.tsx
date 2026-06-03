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
        "fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md md:bottom-0",
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
