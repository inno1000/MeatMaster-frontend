import type { AppIcon } from "@/lib/icon-types";
import { canAccessPath } from "@/lib/authz";
import { mainNavigation, type NavLeaf } from "@/lib/nav-config";
import { mobileDockPrimaryHrefs } from "@/lib/nav-config";
import type { UserRole } from "@/lib/schemas/auth";

export type MoreLink = NavLeaf;

function collectLeaves(role: UserRole): MoreLink[] {
  const dockSet = new Set(mobileDockPrimaryHrefs[role]);
  const out: MoreLink[] = [];

  for (const entry of mainNavigation) {
    if (entry.type === "link") {
      if (
        entry.href !== "/dashboard" &&
        canAccessPath(role, entry.href) &&
        !dockSet.has(entry.href)
      ) {
        out.push({
          titleKey: entry.titleKey,
          href: entry.href,
          icon: entry.icon,
        });
      }
    }
    if (entry.type === "group") {
      for (const child of entry.group.children) {
        if (canAccessPath(role, child.href) && !dockSet.has(child.href)) {
          out.push(child);
        }
      }
    }
  }

  return out;
}

export function getMobileMoreLinks(role: UserRole): MoreLink[] {
  return collectLeaves(role);
}
