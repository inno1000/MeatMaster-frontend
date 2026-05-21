import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ScrollRegionProps = {
  children: ReactNode;
  className?: string;
};

export const ScrollRegion = ({ children, className }: ScrollRegionProps) => {
  return (
    <div
      className={cn(
        "-mx-3 overflow-x-auto overscroll-x-contain px-3 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:px-0",
        className,
      )}
    >
      {children}
    </div>
  );
};
