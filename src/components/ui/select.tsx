import * as React from "react";
import { resolveSelectIcon } from "@/lib/form-input-icons";
import type { AppIcon } from "@/lib/icon-types";
import { nativeSelectClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  prefixIcon?: AppIcon | null;
  showPrefixIcon?: boolean;
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      prefixIcon,
      showPrefixIcon,
      id,
      name,
      children,
      ...props
    },
    ref,
  ) => {
    const Icon = resolveSelectIcon({
      id,
      name: typeof name === "string" ? name : undefined,
      prefixIcon,
      showPrefixIcon,
    });

    const select = (
      <select
        id={id}
        name={name}
        className={cn(nativeSelectClass, Icon && "ps-11", className)}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );

    if (!Icon) return select;

    const PrefixIcon = Icon;
    return (
      <div className="relative">
        <PrefixIcon
          className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground"
          aria-hidden
        />
        {select}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
