import type { SVGProps } from "react";

/** Composant icône compatible navigation, cartes, listes (ex-Lucide). */
export type AppIcon = React.FC<
  SVGProps<SVGSVGElement> & {
    className?: string;
    "aria-hidden"?: boolean;
  }
>;
