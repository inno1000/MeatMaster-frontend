export type StatusPillVariant = "default" | "success" | "warning" | "destructive";

/** Variante visuelle pour un code statut métier. */
export function statusVariantFromCode(code: string): StatusPillVariant {
  const normalized = code.trim().toLowerCase();
  switch (normalized) {
    case "acceptee":
    case "valide":
    case "validee":
    case "complete":
    case "normal":
      return "success";
    case "en_attente":
    case "pending":
      return "warning";
    case "rejetee":
    case "annulee":
    case "annule":
    case "critical":
      return "destructive";
    default:
      return "default";
  }
}
