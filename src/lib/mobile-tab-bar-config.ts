import type { LucideIcon } from "lucide-react";
import {
  Beef,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import type { UserRole } from "@/lib/schemas/auth";
import { canAccessPath } from "@/lib/authz";

export type MobileTabDef = {
  /** Clé i18n sous `nav.*` */
  titleKey: string;
  href: string;
  icon: LucideIcon;
};

/** Dock mobile : même logique que la sidebar — flux métier puis rapports (boucher / fournisseur). */
const BUTCHER_TABS: MobileTabDef[] = [
  { titleKey: "mobileHome", href: "/dashboard", icon: LayoutDashboard },
  { titleKey: "mobileStock", href: "/stock/management", icon: Package },
  { titleKey: "mobileSales", href: "/vente/enregistrer", icon: ShoppingCart },
  { titleKey: "mobilePayments", href: "/versement/enregistrer", icon: CreditCard },
  { titleKey: "mobileReports", href: "/reports/sales", icon: FileText },
];

/** Abattage → achats → versements → rapports financiers. */
const SUPPLIER_TABS: MobileTabDef[] = [
  { titleKey: "mobileHome", href: "/dashboard", icon: LayoutDashboard },
  { titleKey: "mobileSlaughter", href: "/abattage/liste", icon: Beef },
  { titleKey: "mobilePurchase", href: "/abattage/achats", icon: ShoppingCart },
  { titleKey: "mobilePayments", href: "/versement/liste", icon: CreditCard },
  { titleKey: "mobileReports", href: "/reports/financial", icon: FileText },
];

/** Aligné sur les modules admin de la sidebar + rapports. */
const ADMIN_TABS: MobileTabDef[] = [
  { titleKey: "mobileHome", href: "/dashboard", icon: LayoutDashboard },
  { titleKey: "adminModuleUsers", href: "/admin/users/list", icon: Users },
  { titleKey: "adminModuleSuppliers", href: "/admin/users/suppliers/create", icon: Truck },
  { titleKey: "adminModuleButcheries", href: "/admin/butcheries/list", icon: Building2 },
  { titleKey: "mobileReports", href: "/reports/sales", icon: FileText },
];

function tabsForRole(role: UserRole): MobileTabDef[] {
  switch (role) {
    case "butcher":
      return BUTCHER_TABS;
    case "supplier":
      return SUPPLIER_TABS;
    case "admin":
      return ADMIN_TABS;
    default:
      return BUTCHER_TABS;
  }
}

/** Onglets du dock mobile (filtrés par droits d’accès). */
export function getMobileDockTabs(role: UserRole): MobileTabDef[] {
  return tabsForRole(role).filter((tab) => canAccessPath(role, tab.href));
}
