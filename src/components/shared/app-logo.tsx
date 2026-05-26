import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  /** Hauteur approximative ; largeur proportionnelle au logo */
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
      src="/logo-app-ui.png"
      alt={alt}
      className={cn(
        "object-contain select-none",
        variant === "sidebar" && "object-left",
        (variant === "hero" || variant === "auth") && "object-center",
        variant === "sidebar" &&
          "h-10 w-auto max-w-[min(200px,62vw)] sm:max-w-[220px]",
        variant === "hero" &&
          "mx-auto h-16 w-auto max-w-[min(320px,92vw)] sm:h-20",
        variant === "auth" &&
          "mx-auto h-28 w-auto max-w-[min(420px,94vw)] sm:h-32 md:h-36",
        className,
      )}
      draggable={false}
    />
  );
}
