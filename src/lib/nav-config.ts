import type { AppIcon } from "@/lib/icon-types";
import {
  iconAdminButcheries,
  iconAdminSupplierLink,
  iconAdminSuppliers,
  iconAdminUserCreate,
  iconAdminUserList,
  iconAdminUsers,
  iconAnimalsList,
  iconButcheryCreate,
  iconButcheryList,
  iconDistributionList,
  iconHome,
  iconPaymentsGroup,
  iconPaymentCreate,
  iconPaymentList,
  iconReportFinancial,
  iconReportSales,
  iconReportsGroup,
  iconReportStocks,
  iconSalesGroup,
  iconSaleCreate,
  iconSaleList,
  iconSettingsGroup,
  iconSettingsPreferences,
  iconSettingsProfile,
  iconSlaughterCreate,
  iconSlaughterGroup,
  iconSlaughterPurchase,
  iconStockDeclaration,
  iconStockGroup,
  iconStockJournal,
  iconStockManagement,
  iconStockReception,
} from "@/lib/icons";

export type NavLeaf = {
  titleKey: string;
  href: string;
  icon: AppIcon;
};

export type NavGroup = {
  titleKey: string;
  icon: AppIcon;
  children: NavLeaf[];
};

export type NavEntry =
  | {
      type: "link";
      titleKey: string;
      href: string;
      icon: AppIcon;
    }
  | { type: "group"; group: NavGroup }
  | { type: "divider" };

/** Navigation principale : accueil → actions → suivi → rapports → admin → réglages */
export const mainNavigation: NavEntry[] = [
  {
    type: "link",
    titleKey: "nav.dashboard",
    href: "/dashboard",
    icon: iconHome,
  },
  {
    type: "group",
    group: {
      titleKey: "nav.actionsGroup",
      icon: iconSalesGroup,
      children: [
        {
          titleKey: "nav.stockReception",
          href: "/stock/reception",
          icon: iconStockReception,
        },
        {
          titleKey: "nav.saleCreate",
          href: "/vente/enregistrer",
          icon: iconSaleCreate,
        },
        {
          titleKey: "nav.paymentCreate",
          href: "/versement/enregistrer",
          icon: iconPaymentCreate,
        },
        {
          titleKey: "nav.stockDeclaration",
          href: "/stock/declaration",
          icon: iconStockDeclaration,
        },
        {
          titleKey: "nav.slaughterPurchase",
          href: "/abattage/achats",
          icon: iconSlaughterPurchase,
        },
        {
          titleKey: "nav.slaughterCreate",
          href: "/abattage/enregistrer",
          icon: iconSlaughterCreate,
        },
        {
          titleKey: "nav.slaughterList",
          href: "/abattage/animaux",
          icon: iconAnimalsList,
        },
        {
          titleKey: "nav.paymentList",
          href: "/versement/liste",
          icon: iconPaymentList,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.followUpGroup",
      icon: iconStockGroup,
      children: [
        {
          titleKey: "nav.stockManagement",
          href: "/stock/management",
          icon: iconStockManagement,
        },
        {
          titleKey: "nav.stockJournal",
          href: "/stock/journal",
          icon: iconStockJournal,
        },
        {
          titleKey: "nav.saleList",
          href: "/vente/liste",
          icon: iconSaleList,
        },
        {
          titleKey: "nav.slaughterDistributionList",
          href: "/abattage/liste",
          icon: iconDistributionList,
        },
        {
          titleKey: "nav.butcherList",
          href: "/boucherie/liste",
          icon: iconButcheryList,
        },
      ],
    },
  },
  { type: "divider" },
  {
    type: "group",
    group: {
      titleKey: "nav.reportsGroup",
      icon: iconReportsGroup,
      children: [
        {
          titleKey: "nav.reportSales",
          href: "/reports/sales",
          icon: iconReportSales,
        },
        {
          titleKey: "nav.reportStocks",
          href: "/reports/stocks",
          icon: iconReportStocks,
        },
        {
          titleKey: "nav.reportFinancial",
          href: "/reports/financial",
          icon: iconReportFinancial,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.adminModuleUsers",
      icon: iconAdminUsers,
      children: [
        {
          titleKey: "nav.adminListUsers",
          href: "/admin/users/list",
          icon: iconAdminUserList,
        },
        {
          titleKey: "nav.adminFormUser",
          href: "/admin/users/create",
          icon: iconAdminUserCreate,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.adminModuleSuppliers",
      icon: iconAdminSuppliers,
      children: [
        {
          titleKey: "nav.adminFormSupplier",
          href: "/admin/users/suppliers/create",
          icon: iconAdminUsers,
        },
        {
          titleKey: "nav.adminFormSupplierButcheries",
          href: "/admin/users/suppliers/butcheries",
          icon: iconAdminSupplierLink,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.adminModuleButcheries",
      icon: iconAdminButcheries,
      children: [
        {
          titleKey: "nav.adminListButcheries",
          href: "/admin/boucheries/list",
          icon: iconAdminUserList,
        },
        {
          titleKey: "nav.adminFormButchery",
          href: "/admin/butcheries/create",
          icon: iconButcheryCreate,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.settingsGroup",
      icon: iconSettingsGroup,
      children: [
        {
          titleKey: "nav.settingsProfile",
          href: "/settings/profile",
          icon: iconSettingsProfile,
        },
        {
          titleKey: "nav.settingsPreferences",
          href: "/settings/preferences",
          icon: iconSettingsPreferences,
        },
      ],
    },
  },
];

/** Liens du dock mobile (max 3 actions + accueil). */
export const mobileDockPrimaryHrefs: Record<
  "butcher" | "supplier" | "admin",
  string[]
> = {
  butcher: ["/dashboard", "/stock/reception", "/vente/enregistrer", "/versement/enregistrer"],
  supplier: ["/dashboard", "/abattage/achats", "/abattage/enregistrer", "/versement/liste"],
  admin: ["/dashboard", "/admin/users/list", "/admin/butcheries/list", "/reports/sales"],
};
