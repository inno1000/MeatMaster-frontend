import {
  Beef,
  CircleDot,
  CreditCard,
  LayoutDashboard,
  Package,
  ShoppingCart,
} from "lucide-react";
import type { UserRole } from "@/lib/schemas/auth";
import { canAccessPath } from "@/lib/authz";
import type { NavEntry } from "@/lib/nav-config";
import type { MobileTabDef } from "@/lib/mobile-tab-bar-config";

const SIMPLE_BUTCHER_NAV: NavEntry[] = [
  {
    type: "link",
    titleKey: "simple.navHome",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    type: "link",
    titleKey: "simple.navSale",
    href: "/vente/enregistrer",
    icon: ShoppingCart,
  },
  {
    type: "link",
    titleKey: "simple.navPayment",
    href: "/versement/enregistrer",
    icon: CreditCard,
  },
  {
    type: "link",
    titleKey: "simple.navStock",
    href: "/stock/reception",
    icon: Package,
  },
  {
    type: "link",
    titleKey: "simple.navSettings",
    href: "/settings/preferences",
    icon: CircleDot,
  },
];

const SIMPLE_SUPPLIER_NAV: NavEntry[] = [
  {
    type: "link",
    titleKey: "simple.navHome",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    type: "link",
    titleKey: "simple.navSlaughter",
    href: "/abattage/enregistrer",
    icon: Beef,
  },
  {
    type: "link",
    titleKey: "simple.navPayments",
    href: "/versement/liste",
    icon: CreditCard,
  },
  {
    type: "link",
    titleKey: "simple.navAnimals",
    href: "/abattage/animaux",
    icon: Beef,
  },
  {
    type: "link",
    titleKey: "simple.navPurchase",
    href: "/abattage/achats",
    icon: ShoppingCart,
  },
  {
    type: "link",
    titleKey: "simple.navSettings",
    href: "/settings/preferences",
    icon: CircleDot,
  },
];

export function getSimpleNavigation(role: UserRole): NavEntry[] {
  const entries = role === "supplier" ? SIMPLE_SUPPLIER_NAV : SIMPLE_BUTCHER_NAV;
  return entries.filter((entry) => {
    if (entry.type !== "link") {
      return false;
    }
    return canAccessPath(role, entry.href);
  });
}

const SIMPLE_BUTCHER_TABS: MobileTabDef[] = [
  { titleKey: "simple.navHome", href: "/dashboard", icon: LayoutDashboard },
  { titleKey: "simple.navSale", href: "/vente/enregistrer", icon: ShoppingCart },
  { titleKey: "simple.navPayment", href: "/versement/enregistrer", icon: CreditCard },
  { titleKey: "simple.navStock", href: "/stock/reception", icon: Package },
];

const SIMPLE_SUPPLIER_TABS: MobileTabDef[] = [
  { titleKey: "simple.navHome", href: "/dashboard", icon: LayoutDashboard },
  { titleKey: "simple.navSlaughter", href: "/abattage/enregistrer", icon: Beef },
  { titleKey: "simple.navPayments", href: "/versement/liste", icon: CreditCard },
  { titleKey: "simple.navPurchase", href: "/abattage/achats", icon: ShoppingCart },
];

export function getSimpleMobileDockTabs(role: UserRole): MobileTabDef[] {
  const tabs = role === "supplier" ? SIMPLE_SUPPLIER_TABS : SIMPLE_BUTCHER_TABS;
  return tabs.filter((tab) => canAccessPath(role, tab.href));
}
