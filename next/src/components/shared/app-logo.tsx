import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  /** Hauteur approximative ; largeur proportionnelle au SVG */
  variant?: "sidebar" | "hero";
  alt?: string;
};

export function AppLogo({
  className,
  variant = "sidebar",
  alt = "",
}: AppLogoProps) {
  return (
    <img
      src="/logo.svg"
      alt={alt}
      className={cn(
        "object-contain object-left select-none",
        variant === "sidebar" &&
          "h-9 w-auto max-w-[min(160px,55vw)] sm:max-w-[180px]",
        variant === "hero" &&
          "mx-auto h-14 w-auto max-w-[min(280px,85vw)] sm:h-16",
        className,
      )}
      draggable={false}
    />
  );
}
