/** Identifiants API Laravel : entiers ou UUID — pour les corps JSON (`fournisseur_user_id`, etc.). */
export function coerceApiScalarId(raw: string): string | number {
  const s = raw.trim();
  if (/^\d+$/.test(s)) {
    return Number(s);
  }
  return s;
}
