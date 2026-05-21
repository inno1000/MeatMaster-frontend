/** Normalise les listes Laravel `{ data: [...] }`, `{ items: [...] }`, ou tableau brut. */
export function unwrapDataArray(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.data)) {
      return o.data;
    }
    if (Array.isArray(o.items)) {
      return o.items;
    }
  }
  return [];
}

/** Normalise les objets Laravel `{ data: {...} }` ou objet brut. */
export function unwrapDataObject(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object") {
    return {};
  }
  const root = data as Record<string, unknown>;
  if (root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
    return root.data as Record<string, unknown>;
  }
  return root;
}

export type LaravelPagination = {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
};

/** Extrait une pagination Laravel `meta` avec des valeurs de secours. */
export function unwrapLaravelPagination(data: unknown): LaravelPagination {
  if (!data || typeof data !== "object") {
    return { currentPage: 1, lastPage: 1, total: 0, perPage: 15 };
  }
  const root = data as { meta?: Record<string, unknown> };
  const meta = root.meta ?? {};
  const num = (v: unknown, fallback: number) =>
    typeof v === "number" && Number.isFinite(v) ? v : fallback;
  return {
    currentPage: num(meta.current_page, 1),
    lastPage: num(meta.last_page, 1),
    total: num(meta.total, 0),
    perPage: num(meta.per_page, 15),
  };
}

/** Liste paginée Laravel : `{ data: [...], meta: { total }, links }` — `total` préfère `meta.total`. */
export function unwrapPaginatedRows(data: unknown): {
  rows: unknown[];
  total: number;
} {
  const rows = unwrapDataArray(data);
  const meta = unwrapLaravelPagination(data);
  const total = meta.total > 0 ? meta.total : rows.length;
  return { rows, total };
}
