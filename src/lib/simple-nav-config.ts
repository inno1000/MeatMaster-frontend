import {
  iconAnimalsList,
  iconHome,
  iconMobilePayments,
  iconMobilePurchase,
  iconMobileSales,
  iconMobileStock,
  iconPaymentList,
  iconSettingsPreferences,
  iconSlaughterCreate,
} from "@/lib/icons";
import type { UserRole } from "@/lib/schemas/auth";
import { canAccessPath } from "@/lib/authz";
import type { NavEntry } from "@/lib/nav-config";
import type { MobileTabDef } from "@/lib/mobile-tab-bar-config";
import { getMobileDockTabs } from "@/lib/mobile-tab-bar-config";

const SIMPLE_BUTCHER_NAV: NavEntry[] = [
  {
    type: "link",
    titleKey: "simple.navHome",
    href: "/dashboard",
    icon: iconHome,
  },
  {
    type: "link",
    titleKey: "simple.navStock",
    href: "/stock/reception",
    icon: iconMobileStock,
  },
  {
    type: "link",
    titleKey: "simple.navSale",
    href: "/vente/enregistrer",
    icon: iconMobileSales,
  },
  {
    type: "link",
    titleKey: "simple.navPayment",
    href: "/versement/enregistrer",
    icon: iconMobilePayments,
  },
  {
    type: "link",
    titleKey: "simple.navSettings",
    href: "/settings/preferences",
    icon: iconSettingsPreferences,
  },
];

const SIMPLE_SUPPLIER_NAV: NavEntry[] = [
  {
    type: "link",
    titleKey: "simple.navHome",
    href: "/dashboard",
    icon: iconHome,
  },
  {
    type: "link",
    titleKey: "simple.navPurchase",
    href: "/abattage/achats",
    icon: iconMobilePurchase,
  },
  {
    type: "link",
    titleKey: "simple.navSlaughter",
    href: "/abattage/enregistrer",
    icon: iconSlaughterCreate,
  },
  {
    type: "link",
    titleKey: "simple.navPayments",
    href: "/versement/liste",
    icon: iconPaymentList,
  },
  {
    type: "link",
    titleKey: "simple.navAnimals",
    href: "/abattage/animaux",
    icon: iconAnimalsList,
  },
  {
    type: "link",
    titleKey: "simple.navSettings",
    href: "/settings/preferences",
    icon: iconSettingsPreferences,
  },
];

function navForRole(role: UserRole): NavEntry[] {
  if (role === "supplier") {
    return SIMPLE_SUPPLIER_NAV;
  }
  return SIMPLE_BUTCHER_NAV;
}

export function getSimpleNavigation(role: UserRole): NavEntry[] {
  return navForRole(role).filter((entry) => {
    if (entry.type !== "link") {
      return true;
    }
    return canAccessPath(role, entry.href);
  });
}

/** Dock mobile mode simple — aligné sur `mobileDockPrimaryHrefs` + réglages via Plus. */
export function getSimpleMobileDockTabs(role: UserRole): MobileTabDef[] {
  if (role === "admin") {
    return getMobileDockTabs(role);
  }
  const primary = getMobileDockTabs(role);
  return primary.length > 0 ? primary : getMobileDockTabs("butcher");
}
