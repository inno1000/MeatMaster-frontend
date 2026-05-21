import type { UserRole } from "@/lib/schemas/auth";
import type { NavEntry } from "@/lib/nav-config";

/** Normalise les rôles API / sessions anciennes vers le rôle UI. */
export const normalizeAppRole = (role: string | undefined): UserRole => {
  const r = (role ?? "").toLowerCase();
  if (r === "admin") {
    return "admin";
  }
  if (r === "butcher" || r === "boucher") {
    return "butcher";
  }
  if (r === "supplier" || r === "fournisseur" || r === "caissier") {
    return "supplier";
  }
  return "butcher";
};

/** Fournisseur = abattages, versements (liste), rapport financier — pas ventes ni stock ni boucheries. */
const roleRouteRules: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/abattage", roles: ["supplier"] },
  { prefix: "/reports/sales", roles: ["butcher", "admin"] },
  { prefix: "/reports/stocks", roles: ["butcher", "admin"] },
  { prefix: "/reports/financial", roles: ["butcher", "supplier", "admin"] },
  { prefix: "/reports", roles: ["butcher", "admin"] },
  { prefix: "/stock", roles: ["butcher"] },
  { prefix: "/vente", roles: ["butcher"] },
  { prefix: "/boucherie", roles: ["butcher"] },
  { prefix: "/versement/enregistrer", roles: ["butcher"] },
  { prefix: "/versement/liste", roles: ["butcher", "supplier"] },
  { prefix: "/dashboard", roles: ["butcher", "supplier", "admin"] },
  { prefix: "/settings", roles: ["butcher", "supplier", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
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

  const appRole = normalizeAppRole(role);
  const matches = roleRouteRules.filter(
    (rule) =>
      normalized === rule.prefix || normalized.startsWith(`${rule.prefix}/`),
  );
  if (matches.length === 0) {
    return false;
  }
  const match = matches.sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return match.roles.includes(appRole);
};

export const getDefaultPathForRole = (role: UserRole): string =>
  role === "supplier"
    ? "/abattage/liste"
    : role === "admin"
      ? "/admin/users/list"
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
