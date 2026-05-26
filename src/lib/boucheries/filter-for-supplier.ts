import type { User } from "@/lib/schemas/auth";

type BoucherieRow = {
  id?: unknown;
  nom?: unknown;
  name?: unknown;
};

/** Limite la liste aux boucheries desservies par le fournisseur connecté. */
export function filterBoucheriesForSupplier(
  items: unknown[],
  user: Pick<User, "butcheryIds" | "butcheries"> | null | undefined,
): unknown[] {
  const idSet = new Set(user?.butcheryIds ?? []);
  const nameSet = new Set(user?.butcheries ?? []);

  if (idSet.size === 0 && nameSet.size === 0) {
    return items;
  }

  return items.filter((item) => {
    const b = item as BoucherieRow;
    const id = String(b.id ?? "");
    if (idSet.size > 0 && id && idSet.has(id)) {
      return true;
    }
    const nom = String(b.nom ?? b.name ?? "");
    return nameSet.size > 0 && nom.length > 0 && nameSet.has(nom);
  });
}
