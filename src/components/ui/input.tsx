import * as React from "react";
import { resolveInputIcon } from "@/lib/form-input-icons";
import type { AppIcon } from "@/lib/icon-types";
import { cn } from "@/lib/utils";

const inputClass =
  "surface-elevated flex min-h-12 w-full rounded-2xl border border-border/60 px-4 py-2.5 text-base leading-snug shadow-sm ring-offset-background transition-colors file:min-h-12 file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 sm:text-sm";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  prefixIcon?: AppIcon | null;
  showPrefixIcon?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      prefixIcon,
      showPrefixIcon,
      id,
      name,
      ...props
    },
    ref,
  ) => {
    const Icon = resolveInputIcon({
      type,
      id,
      name: typeof name === "string" ? name : undefined,
      prefixIcon,
      showPrefixIcon,
    });

    const input = (
      <input
        type={type}
        id={id}
        name={name}
        className={cn(inputClass, Icon && "ps-11", className)}
        ref={ref}
        {...props}
      />
    );

    if (!Icon) return input;

    const PrefixIcon = Icon;
    return (
      <div className="relative">
        <PrefixIcon
          className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground"
          aria-hidden
        />
        {input}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
