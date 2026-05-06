import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  Beef,
  Building2,
  ChartBar,
  CircleDot,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
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
          titleKey: "nav.slaughterCreate",
          href: "/abattage/enregistrer",
          icon: CircleDot,
        },
        {
          titleKey: "nav.slaughterList",
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
      titleKey: "nav.adminGroup",
      icon: ShieldCheck,
      children: [
        {
          titleKey: "nav.adminPlatform",
          href: "/admin/platform",
          icon: CircleDot,
        },
        {
          titleKey: "nav.adminUsers",
          href: "/admin/users",
          icon: CircleDot,
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
