import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-11 w-full rounded-xl border border-border/80 bg-muted/30 px-3 py-2 text-base leading-snug ring-offset-background transition-colors file:min-h-11 file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
