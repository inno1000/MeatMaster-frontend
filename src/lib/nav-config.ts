import type { LucideIcon } from "lucide-react";
import {
  Beef,
  Building2,
  ChartBar,
  CircleDot,
  CreditCard,
  FileText,
  LayoutDashboard,
  Link2,
  List,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  UserPlus,
  Users,
} from "lucide-react";

export type NavLeaf = {
  titleKey: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  titleKey: string;
  icon: LucideIcon;
  children: NavLeaf[];
};

export type NavEntry =
  | {
      type: "link";
      titleKey: string;
      href: string;
      icon: LucideIcon;
    }
  | { type: "group"; group: NavGroup }
  | { type: "divider" };

export const mainNavigation: NavEntry[] = [
  {
    type: "link",
    titleKey: "nav.dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    type: "group",
    group: {
      titleKey: "nav.stockGroup",
      icon: Package,
      children: [
        {
          titleKey: "nav.stockManagement",
          href: "/stock/management",
          icon: ChartBar,
        },
        {
          titleKey: "nav.stockReception",
          href: "/stock/reception",
          icon: CircleDot,
        },
        {
          titleKey: "nav.stockDeclaration",
          href: "/stock/declaration",
          icon: FileText,
        },
        {
          titleKey: "nav.stockJournal",
          href: "/stock/journal",
          icon: CircleDot,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.salesGroup",
      icon: ShoppingCart,
      children: [
        {
          titleKey: "nav.saleCreate",
          href: "/vente/enregistrer",
          icon: CircleDot,
        },
        {
          titleKey: "nav.saleList",
          href: "/vente/liste",
          icon: CircleDot,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.paymentsGroup",
      icon: CreditCard,
      children: [
        {
          titleKey: "nav.paymentCreate",
          href: "/versement/enregistrer",
          icon: CircleDot,
        },
        {
          titleKey: "nav.paymentList",
          href: "/versement/liste",
          icon: CircleDot,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.butcherGroup",
      icon: Building2,
      children: [
        {
          titleKey: "nav.butcherCreate",
          href: "/boucherie/enregistrer",
          icon: CircleDot,
        },
        {
          titleKey: "nav.butcherList",
          href: "/boucherie/liste",
          icon: CircleDot,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.slaughterGroup",
      icon: Beef,
      children: [
        {
          titleKey: "nav.slaughterPurchase",
          href: "/abattage/achats",
          icon: CircleDot,
        },
        {
          titleKey: "nav.slaughterCreate",
          href: "/abattage/enregistrer",
          icon: CircleDot,
        },
        {
          titleKey: "nav.slaughterList",
          href: "/abattage/animaux",
          icon: CircleDot,
        },
        {
          titleKey: "nav.slaughterDistributionList",
          href: "/abattage/liste",
          icon: CircleDot,
        },
        {
          titleKey: "nav.slaughterDetail",
          href: "/abattage/detail_abattage",
          icon: CircleDot,
        },
      ],
    },
  },
  { type: "divider" },
  {
    type: "group",
    group: {
      titleKey: "nav.reportsGroup",
      icon: FileText,
      children: [
        {
          titleKey: "nav.reportSales",
          href: "/reports/sales",
          icon: CircleDot,
        },
        {
          titleKey: "nav.reportStocks",
          href: "/reports/stocks",
          icon: CircleDot,
        },
        {
          titleKey: "nav.reportFinancial",
          href: "/reports/financial",
          icon: CircleDot,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.adminModuleUsers",
      icon: Users,
      children: [
        {
          titleKey: "nav.adminListUsers",
          href: "/admin/users/list",
          icon: List,
        },
        {
          titleKey: "nav.adminFormUser",
          href: "/admin/users/create",
          icon: UserPlus,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.adminModuleSuppliers",
      icon: Truck,
      children: [
        {
          titleKey: "nav.adminFormSupplier",
          href: "/admin/users/suppliers/create",
          icon: Users,
        },
        {
          titleKey: "nav.adminFormSupplierButcheries",
          href: "/admin/users/suppliers/butcheries",
          icon: Link2,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.adminModuleButcheries",
      icon: Building2,
      children: [
        {
          titleKey: "nav.adminListButcheries",
          href: "/admin/butcheries/list",
          icon: List,
        },
        {
          titleKey: "nav.adminFormButchery",
          href: "/admin/butcheries/create",
          icon: Building2,
        },
      ],
    },
  },
  {
    type: "group",
    group: {
      titleKey: "nav.settingsGroup",
      icon: Settings,
      children: [
        {
          titleKey: "nav.settingsProfile",
          href: "/settings/profile",
          icon: CircleDot,
        },
        {
          titleKey: "nav.settingsPreferences",
          href: "/settings/preferences",
          icon: CircleDot,
        },
      ],
    },
  },
];
