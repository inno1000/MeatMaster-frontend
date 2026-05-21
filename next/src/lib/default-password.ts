/**
 * Mot de passe initial attribué aux comptes créés par l’administration.
 * À configurer en prod via `NEXT_PUBLIC_DEFAULT_NEW_USER_PASSWORD` (≥ 8 caractères, exigence Laravel).
 */
export function getDefaultNewUserPassword(): string {
  const v = process.env.NEXT_PUBLIC_DEFAULT_NEW_USER_PASSWORD?.trim();
  if (v && v.length >= 8) {
    return v;
  }
  return "BoucherieChangeMoi1!";
}
