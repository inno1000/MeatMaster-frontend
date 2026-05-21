/** Libellé affichable à partir d’un objet API (évite d’exposer les IDs techniques). */
export function pickDisplayLabel(
  src: Record<string, unknown> | null | undefined,
  keys: readonly string[] = ["nom", "name", "label", "title", "libelle"],
): string {
  if (!src || typeof src !== "object") {
    return "";
  }
  for (const k of keys) {
    const v = src[k];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }
  return "";
}
