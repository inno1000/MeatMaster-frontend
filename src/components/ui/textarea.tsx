import * as React from "react";
import { resolveInputIcon } from "@/lib/form-input-icons";
import type { AppIcon } from "@/lib/icon-types";
import { cn } from "@/lib/utils";

const textareaClass =
  "surface-elevated flex min-h-24 w-full rounded-2xl border border-border/60 px-4 py-3 text-base leading-snug shadow-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  prefixIcon?: AppIcon | null;
  showPrefixIcon?: boolean;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      prefixIcon,
      showPrefixIcon,
      id,
      name,
      ...props
    },
    ref,
  ) => {
    const Icon = resolveInputIcon({
      id,
      name: typeof name === "string" ? name : undefined,
      prefixIcon,
      showPrefixIcon,
      type: "text",
    });

    const textarea = (
      <textarea
        id={id}
        name={name}
        className={cn(textareaClass, Icon && "ps-11", className)}
        ref={ref}
        {...props}
      />
    );

    if (!Icon) return textarea;

    const PrefixIcon = Icon;
    return (
      <div className="relative">
        <PrefixIcon
          className="pointer-events-none absolute start-4 top-4 text-lg text-muted-foreground"
          aria-hidden
        />
        {textarea}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
