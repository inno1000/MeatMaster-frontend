const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: true
  },
  redirect: '/main/dashboard/default',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      name: 'LandingPage',
      path: '/',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Default',
      path: '/dashboard/default',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Declaration',
      path: '/stock/declaration',
      component: () => import('@/views/stock/DeclarationPage.vue')
    },
    {
      name: 'Journal',
      path: '/stock/journal',
      component: () => import('@/views/stock/JournalPage.vue')
    },
    {
      name: 'Reception',
      path: '/stock/reception',
      component: () => import('@/views/stock/ReceptionPage.vue')
    },
    {
      name: 'EnregVente',
      path: '/vente/enregistrer',
      component: () => import('@/views/vente/EnregVente.vue')
    },
    {
      name: 'listeVente',
      path: '/vente/liste',
      component: () => import('@/views/vente/ListeVente.vue')
    },
    {
      name: 'EnregVersement',
      path: '/versement/enregistrer',
      component: () => import('@/views/versement/EnregVersement.vue')
    },
    {
      name: 'listeVersement',
      path: '/versement/liste',
      component: () => import('@/views/versement/ListeVersement.vue')
    },
    {
      name: 'EnregBoucherie',
      path: '/boucherie/enregistrer',
      component: () => import('@/views/boucherie/EnregBoucherie.vue')
    },
    {
      name: 'listeBoucherie',
      path: '/boucherie/liste',
      component: () => import('@/views/boucherie/ListeBoucherie.vue')
    },
    {
      name: 'test',
      path: '/test',
      component: () => import('@/views/test/tests.vue')
    }
    // {
    //   name: 'LandingPage',
    //   path: '/',
    //   component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    // },
    // {
    //   name: 'Default',
    //   path: '/dashboard/default',
    //   component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    // },
    // {
    //   name: 'Starter',
    //   path: '/starter',
    //   component: () => import('@/views/StarterPage.vue')
    // },
    // {
    //   name: 'Tabler Icons',
    //   path: '/icons/tabler',
    //   component: () => import('@/views/utilities/icons/TablerIcons.vue')
    // },
    // {
    //   name: 'Material Icons',
    //   path: '/icons/material',
    //   component: () => import('@/views/utilities/icons/MaterialIcons.vue')
    // },
    // {
    //   name: 'Typography',
    //   path: '/utils/typography',
    //   component: () => import('@/views/utilities/typography/TypographyPage.vue')
    // },
    // {
    //   name: 'Shadows',
    //   path: '/utils/shadows',
    //   component: () => import('@/views/utilities/shadows/ShadowPage.vue')
    // },
    // {
    //   name: 'Colors',
    //   path: '/utils/colors',
    //   component: () => import('@/views/utilities/colors/ColorPage.vue')
    // }
  ]
};

export default MainRoutes;
