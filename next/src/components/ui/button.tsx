import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "icon";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "default", asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] sm:active:scale-100",
          size === "default" &&
            "min-h-11 px-4 py-2.5 text-sm",
          size === "icon" &&
            "size-11 shrink-0 p-0 [&_svg]:pointer-events-none [&_svg]:size-5",
          variant === "primary" &&
            "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:brightness-110 hover:shadow-md hover:shadow-primary/20",
          variant === "secondary" &&
            "bg-muted text-foreground hover:bg-muted/90",
          variant === "outline" &&
            "border border-border/80 bg-card/80 backdrop-blur-sm hover:border-border hover:bg-muted/60",
          variant === "ghost" && "hover:bg-muted/80",
          variant === "destructive" &&
            "bg-destructive text-white shadow-sm hover:brightness-110",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
