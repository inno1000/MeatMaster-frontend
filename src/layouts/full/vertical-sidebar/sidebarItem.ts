import { 
  CircleIcon, 
  WindmillIcon, 
  DashboardIcon, 
  BrandChromeIcon, 
  HelpIcon,
  PackageIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  BuildingIcon,
  MeatIcon,
  ChartBarIcon,
  FileTextIcon,
  SettingsIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  {
    title: 'Tableau de Bord',
    icon: DashboardIcon,
    to: '/dashboard/default'
  },

  {
    title: 'Gestion des Stocks',
    icon: PackageIcon,
    to: '/stock',
    children: [
      {
        title: 'État des Stocks',
        icon: ChartBarIcon,
        to: '/stock/management'
      },
      {
        title: 'Réception de Viande',
        icon: CircleIcon,
        to: '/stock/reception'
      },
      {
        title: 'Déclaration de Stock',
        icon: FileTextIcon,
        to: '/stock/declaration'
      },
      {
        title: 'Journal de Stock',
        icon: CircleIcon,
        to: '/stock/journal'
      }
    ]
  },

  {
    title: 'Ventes',
    icon: ShoppingCartIcon,
    to: '/vente',
    children: [
      {
        title: 'Enregistrer une Vente',
        icon: CircleIcon,
        to: '/vente/enregistrer'
      },
      {
        title: 'Liste des Ventes',
        icon: CircleIcon,
        to: '/vente/liste'
      }
    ]
  },

  {
    title: 'Versements',
    icon: CreditCardIcon,
    to: '/versement',
    children: [
      {
        title: 'Enregistrer un Versement',
        icon: CircleIcon,
        to: '/versement/enregistrer'
      },
      {
        title: 'Liste des Versements',
        icon: CircleIcon,
        to: '/versement/liste'
      }
    ]
  },

  {
    title: 'Boucheries',
    icon: BuildingIcon,
    to: '/boucherie',
    children: [
      {
        title: 'Enregistrer une Boucherie',
        icon: CircleIcon,
        to: '/boucherie/enregistrer'
      },
      {
        title: 'Liste des Boucheries',
        icon: CircleIcon,
        to: '/boucherie/liste'
      }
    ]
  },

  {
    title: 'Abattage',
    icon: MeatIcon,
    to: '/abattage',
    children: [
      {
        title: 'Enregistrer Abattage',
        icon: CircleIcon,
        to: '/abattage/enregistrer'
      },
      {
        title: 'Liste des Animaux',
        icon: CircleIcon,
        to: '/abattage/liste'
      },
      {
        title: 'Détail Abattage',
        icon: CircleIcon,
        to: '/abattage/detail_abattage'
      }
    ]
  },

  { divider: true },

  {
    title: 'Rapports',
    icon: FileTextIcon,
    to: '/reports',
    children: [
      {
        title: 'Rapport de Ventes',
        icon: CircleIcon,
        to: '/reports/sales'
      },
      {
        title: 'Rapport de Stocks',
        icon: CircleIcon,
        to: '/reports/stocks'
      },
      {
        title: 'Rapport Financier',
        icon: CircleIcon,
        to: '/reports/financial'
      }
    ]
  },

  {
    title: 'Paramètres',
    icon: SettingsIcon,
    to: '/settings',
    children: [
      {
        title: 'Profil',
        icon: CircleIcon,
        to: '/settings/profile'
      },
      {
        title: 'Préférences',
        icon: CircleIcon,
        to: '/settings/preferences'
      }
    ]
  }
];

export default sidebarItem;
