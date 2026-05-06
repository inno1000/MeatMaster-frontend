/** Normalise les listes Laravel `{ data: [...] }` ou tableau brut. */
export function unwrapDataArray(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    const inner = (data as { data?: unknown }).data;
    if (Array.isArray(inner)) {
      return inner;
    }
  }
  return [];
}
