import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  /** Hauteur approximative ; largeur proportionnelle au SVG */
  variant?: "sidebar" | "hero" | "auth";
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
        "object-contain select-none",
        variant === "sidebar" && "object-left",
        (variant === "hero" || variant === "auth") && "object-center",
        variant === "sidebar" &&
          "h-9 w-auto max-w-[min(160px,55vw)] sm:max-w-[180px]",
        variant === "hero" &&
          "mx-auto h-14 w-auto max-w-[min(280px,85vw)] sm:h-16",
        variant === "auth" &&
          "mx-auto h-24 w-auto max-w-[min(340px,88vw)] sm:h-28 md:h-32",
        className,
      )}
      draggable={false}
    />
  );
}
