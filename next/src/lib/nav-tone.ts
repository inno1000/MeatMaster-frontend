/**
 * Teintes pour cartes / métriques dashboard (survol de bord).
 * La navigation utilise uniquement la couleur primary.
 */
export type NavTone =
  | "wine"
  | "sage"
  | "amber"
  | "ocean"
  | "clay"
  | "rust"
  | "teal"
  | "plum"
  | "slate";

export const navToneCardHoverClass: Record<NavTone, string> = {
  wine: "hover:border-zone-wine/45",
  sage: "hover:border-zone-sage/45",
  amber: "hover:border-zone-amber/45",
  ocean: "hover:border-zone-ocean/45",
  clay: "hover:border-zone-clay/45",
  rust: "hover:border-zone-rust/45",
  teal: "hover:border-zone-teal/45",
  plum: "hover:border-zone-plum/45",
  slate: "hover:border-zone-slate/45",
};
