import type { UserRole } from "@/lib/schemas/auth";
import type { NavEntry } from "@/lib/nav-config";

/** Fournisseur = rôle UI `supplier` (ventes, versements liste, abattages, rapports — pas stock ni CRUD boucheries ni saisie versement boucherie). */
const roleRouteRules: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/abattage", roles: ["supplier"] },
  { prefix: "/reports", roles: ["supplier"] },
  { prefix: "/stock", roles: ["butcher"] },
  { prefix: "/vente", roles: ["butcher", "supplier"] },
  { prefix: "/boucherie", roles: ["butcher"] },
  { prefix: "/versement/enregistrer", roles: ["butcher"] },
  { prefix: "/versement/liste", roles: ["butcher", "supplier"] },
  { prefix: "/dashboard", roles: ["butcher", "supplier"] },
  { prefix: "/settings", roles: ["butcher", "supplier"] },
];

export const canAccessPath = (role: UserRole, pathname: string): boolean => {
  const normalized = pathname || "/";

  if (!normalized.startsWith("/")) {
    return false;
  }
  if (normalized === "/") {
    return true;
  }
  if (normalized.startsWith("/auth")) {
    return true;
  }
  if (role === "admin") {
    return true;
  }

  const match = roleRouteRules.find(
    (rule) => normalized === rule.prefix || normalized.startsWith(`${rule.prefix}/`),
  );
  if (!match) {
    return false;
  }
  return match.roles.includes(role);
};

export const getDefaultPathForRole = (role: UserRole): string =>
  role === "supplier"
    ? "/abattage/liste"
    : role === "admin"
      ? "/admin/platform"
      : "/dashboard";

export const filterNavigationByRole = (
  entries: NavEntry[],
  role: UserRole,
): NavEntry[] => {
  const filtered = entries
    .map((entry) => {
      if (entry.type === "divider") {
        return entry;
      }
      if (entry.type === "link") {
        return canAccessPath(role, entry.href) ? entry : null;
      }
      const children = entry.group.children.filter((child) =>
        canAccessPath(role, child.href),
      );
      if (children.length === 0) {
        return null;
      }
      return {
        ...entry,
        group: {
          ...entry.group,
          children,
        },
      };
    })
    .filter((entry): entry is NavEntry => entry !== null);

  // Nettoie les séparateurs isolés après filtrage.
  return filtered.filter((entry, index) => {
    if (entry.type !== "divider") {
      return true;
    }
    const prev = filtered[index - 1];
    const next = filtered[index + 1];
    return Boolean(prev && next && prev.type !== "divider" && next.type !== "divider");
  });
};
