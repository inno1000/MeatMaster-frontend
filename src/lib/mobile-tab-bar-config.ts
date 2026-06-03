import type { AppIcon } from "@/lib/icon-types";
import {
  iconAdminButcheries,
  iconAdminUsers,
  iconHome,
  iconMobilePayments,
  iconMobilePurchase,
  iconMobileSales,
  iconMobileSlaughter,
  iconMobileStock,
  iconReportSales,
  iconSlaughterCreate,
} from "@/lib/icons";
import { canAccessPath } from "@/lib/authz";
import { mobileDockPrimaryHrefs } from "@/lib/nav-config";
import type { UserRole } from "@/lib/schemas/auth";

export type MobileTabDef = {
  /** Clé i18n sous `nav.*` */
  titleKey: string;
  href: string;
  icon: AppIcon;
};

const TAB_META: Record<
  string,
  { titleKey: string; icon: AppIcon }
> = {
  "/dashboard": { titleKey: "mobileHome", icon: iconHome },
  "/stock/reception": { titleKey: "stockReception", icon: iconMobileStock },
  "/vente/enregistrer": { titleKey: "mobileSales", icon: iconMobileSales },
  "/versement/enregistrer": { titleKey: "mobilePayments", icon: iconMobilePayments },
  "/abattage/achats": { titleKey: "mobilePurchase", icon: iconMobilePurchase },
  "/abattage/enregistrer": { titleKey: "slaughterCreate", icon: iconSlaughterCreate },
  "/versement/liste": { titleKey: "mobilePayments", icon: iconMobilePayments },
  "/admin/users/list": { titleKey: "adminModuleUsers", icon: iconAdminUsers },
  "/admin/butcheries/list": {
    titleKey: "adminModuleButcheries",
    icon: iconAdminButcheries,
  },
  "/reports/sales": { titleKey: "mobileReports", icon: iconReportSales },
  "/abattage/animaux": { titleKey: "mobileSlaughter", icon: iconMobileSlaughter },
};

function tabsForRole(role: UserRole): MobileTabDef[] {
  const hrefs = mobileDockPrimaryHrefs[role] ?? mobileDockPrimaryHrefs.butcher;
  return hrefs
    .map((href) => {
      const meta = TAB_META[href];
      if (!meta) return null;
      return { href, ...meta };
    })
    .filter((tab): tab is MobileTabDef => tab !== null);
}

/** Onglets du dock mobile (4 max : accueil + 3 actions). */
export function getMobileDockTabs(role: UserRole): MobileTabDef[] {
  return tabsForRole(role).filter((tab) => canAccessPath(role, tab.href));
}
