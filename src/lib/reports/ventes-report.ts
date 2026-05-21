import { unwrapDataArray } from "@/lib/api/unwrap";

export type VenteReportRow = {
  id: string;
  date: string;
  customer: string;
  typeVente: string;
  statut: string;
  totalAmount: number;
};

export type ProduitAggregate = {
  name: string;
  quantity: number;
  amount: number;
};

export function mapVentesToReportRows(raw: unknown): VenteReportRow[] {
  return unwrapDataArray(raw).map((item) => {
    const row = item as Record<string, unknown>;
    const client = (row.client ?? {}) as Record<string, unknown>;
    const dateRaw = String(row.date_vente ?? row.created_at ?? "");
    const date =
      dateRaw.length >= 10 ? dateRaw.slice(0, 10) : dateRaw;
    return {
      id: String(row.id ?? ""),
      date,
      customer: String(client.nom ?? client.name ?? "—"),
      typeVente: String(row.type_vente ?? ""),
      statut: String(row.statut ?? ""),
      totalAmount: Number(row.montant_total ?? 0),
    };
  });
}

export function filterVenteRows(
  rows: VenteReportRow[],
  opts: { from?: string; to?: string; statut?: string },
): VenteReportRow[] {
  let out = rows.filter((r) => r.statut !== "annulee");
  if (opts.from) {
    out = out.filter((r) => r.date >= opts.from!);
  }
  if (opts.to) {
    out = out.filter((r) => r.date <= opts.to!);
  }
  if (opts.statut) {
    out = out.filter((r) => r.statut === opts.statut);
  }
  return out;
}

export function aggregateTopProduits(
  items: Array<Record<string, unknown>>,
): ProduitAggregate[] {
  return items.map((item) => ({
    name: String(item.produit ?? item.nom ?? "—"),
    quantity: Number(item.quantite_vendue ?? item.quantite ?? 0),
    amount: Number(item.chiffre_affaires ?? item.montant ?? 0),
  }));
}
