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

/** Médaillon icône pour StatCard / listes. */
export const navToneMedallionClass: Record<NavTone, string> = {
  wine: "bg-zone-wine/14 text-zone-wine",
  sage: "bg-zone-sage/14 text-zone-sage",
  amber: "bg-zone-amber/14 text-zone-amber",
  ocean: "bg-zone-ocean/14 text-zone-ocean",
  clay: "bg-zone-clay/14 text-zone-clay",
  rust: "bg-zone-rust/14 text-zone-rust",
  teal: "bg-zone-teal/14 text-zone-teal",
  plum: "bg-zone-plum/14 text-zone-plum",
  slate: "bg-zone-slate/14 text-zone-slate",
};

export const navToneValueClass: Record<NavTone, string> = {
  wine: "text-zone-wine",
  sage: "text-zone-sage",
  amber: "text-zone-amber",
  ocean: "text-zone-ocean",
  clay: "text-zone-clay",
  rust: "text-zone-rust",
  teal: "text-zone-teal",
  plum: "text-zone-plum",
  slate: "text-zone-slate",
};
