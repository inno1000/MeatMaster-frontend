/** Ligne « boucherie » après normalisation du GET `/api/v1/boucheries`. */
export type BoucherieListRow = Record<string, unknown>;

/** Adapte une ligne API `boucheries` vers la forme attendue par les écrans existants. */
export function mapApiBoucherieRow(row: unknown): BoucherieListRow {
  const r = (row && typeof row === "object" ? row : {}) as Record<
    string,
    unknown
  >;
  return {
    id: r.id ?? r.uuid ?? "",
    name: String(r.nom ?? r.name ?? ""),
    city: String(r.ville ?? r.city ?? ""),
    phone: String(r.telephone ?? r.phone ?? ""),
    email: String(r.email ?? ""),
    address: String(r.adresse ?? r.address ?? ""),
    postal_code: String(r.code_postal ?? r.postal_code ?? ""),
    actif: r.actif,
    ...r,
  };
}
