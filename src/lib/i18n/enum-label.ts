/** Libellé traduit pour un code référentiel / enum (clés sous `common.enum.*`). */
export function enumLabel(
  t: (key: string) => string,
  code: string,
): string {
  const normalized = code.trim().toLowerCase();
  if (!normalized) {
    return "";
  }
  return t(`enum.${normalized}`);
}
