/** Libellé traduit pour un code référentiel / enum (clés sous `common.enum.*`). */
export function enumLabel(
  t: (key: string) => string,
  code: string,
  apiLibelle?: string,
): string {
  const normalized = code.trim().toLowerCase();
  if (!normalized) {
    return apiLibelle?.trim() ?? "";
  }
  const fallback = apiLibelle?.trim() || normalized;
  const key = `enum.${normalized}`;
  try {
    return t(key);
  } catch {
    return fallback;
  }
}
