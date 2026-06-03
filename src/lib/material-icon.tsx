import type { AppIcon } from "@/lib/icon-types";
import { cn } from "@/lib/utils";

type MaterialIconProps = {
  name: string;
  className?: string;
  filled?: boolean;
  "aria-hidden"?: boolean;
};

/** Icône Material Symbols (Google) — https://fonts.google.com/icons */
export function MaterialIcon({
  name,
  className,
  filled = false,
  "aria-hidden": ariaHidden = true,
}: MaterialIconProps) {
  return (
    <span
      className={cn(
        filled ? "material-symbols-rounded" : "material-symbols-outlined",
        "inline-flex shrink-0 select-none items-center justify-center leading-none",
        className,
      )}
      aria-hidden={ariaHidden}
    >
      {name}
    </span>
  );
}

/** Fabrique un composant icône réutilisable (nav, StatCard, etc.). */
export function materialIcon(name: string, options?: { filled?: boolean }): AppIcon {
  const Icon = ({
    className,
    "aria-hidden": ariaHidden = true,
  }: {
    className?: string;
    "aria-hidden"?: boolean;
  }) => (
    <MaterialIcon
      name={name}
      filled={options?.filled}
      className={className}
      aria-hidden={ariaHidden}
    />
  );
  Icon.displayName = `MaterialIcon(${name})`;
  return Icon as AppIcon;
}
