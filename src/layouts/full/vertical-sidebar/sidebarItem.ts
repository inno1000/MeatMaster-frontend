import { CircleIcon, WindmillIcon, DashboardIcon, BrandChromeIcon, HelpIcon } from 'vue-tabler-icons';

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
  // { header: 'Dashboard' },
  {
    title: 'Accueil',
    icon: DashboardIcon,
    to: '/dashboard/default'
  },

  {
    title: 'Stock',
    icon: WindmillIcon,
    to: '/stock',
    children: [
      {
        title: 'Reception de viande',
        icon: CircleIcon,
        to: '/stock/reception'
      },
      {
        title: 'Déclaration',
        icon: CircleIcon,
        to: '/stock/declaration'
      },
      {
        title: 'Journal de stock',
        icon: CircleIcon,
        to: '/stock/journal'
      }
    ]
  },

  {
    title: 'Ventes',
    icon: WindmillIcon,
    to: '/forms/radio',
    children: [
      {
        title: 'Enregistrer une vente',
        icon: CircleIcon,
        to: '/vente/enregistrer'
      },
      {
        title: 'Liste des ventes',
        icon: CircleIcon,
        to: '/vente/liste'
      }
    ]
  },

  {
    title: 'Versements',
    icon: WindmillIcon,
    to: '/forms/radio',
    children: [
      {
        title: 'Enregistrer un versement',
        icon: CircleIcon,
        to: '/versement/enregistrer'
      },
      {
        title: 'Liste des versments',
        icon: CircleIcon,
        to: '/versement/liste'
      }
    ]
  },

  {
    title: 'Boucheries',
    icon: WindmillIcon,
    to: '/forms/radio',
    children: [
      {
        title: 'Enregistrer une boucherie',
        icon: CircleIcon,
        to: '/boucherie/enregistrer'
      },
      {
        title: 'Liste des boucheries',
        icon: CircleIcon,
        to: '/boucherie/liste'
      }
    ]
  }

  // {
  //   title: 'Documentation',
  //   icon: HelpIcon,
  //   to: 'https://codedthemes.gitbook.io/berry-vuetify/',
  //   type: 'external'
  // }
];

export default sidebarItem;
