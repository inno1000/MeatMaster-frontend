<script setup lang="ts">
import { shallowRef } from 'vue';
import { useCustomizerStore } from '../../../stores/customizer';
import sidebarItems from './sidebarItem';

import NavGroup from './NavGroup/NavGroup.vue';
import NavItem from './NavItem/NavItem.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';
import ExtraBox from './extrabox/ExtraBox.vue';
import Logo from '../logo/LogoMain.vue';

const customizer = useCustomizerStore();
const sidebarMenu = shallowRef(sidebarItems);
</script>

<template>
  <v-navigation-drawer
    left
    v-model="customizer.Sidebar_drawer"
    elevation="0"
    rail-width="75"
    mobile-breakpoint="lg"
    app
    class="leftSidebar modern-sidebar"
    :rail="customizer.mini_sidebar"
    expand-on-hover
  >
    <!---Logo part -->
    <div class="pa-3 d-flex justify-center align-center logo-section">
      <div class="logo-container">
        <Logo />
      </div>
    </div>
    
    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <div class="sidebar-content">
      <v-list class="pa-3 modern-nav-list">
        <!---Menu Loop -->
        <template v-for="(item, i) in sidebarMenu" :key="i">
          <!---Item Sub Header -->
          <NavGroup :item="item" v-if="item.header" :key="item.title" />
          <!---Item Divider -->
          <v-divider class="my-2 modern-divider" v-else-if="item.divider" />
          <!---If Has Child -->
          <NavCollapse class="leftPadding modern-nav-item" :item="item" :level="0" v-else-if="item.children" />
          <!---Single Item-->
          <NavItem :item="item" v-else class="leftPadding modern-nav-item" />
          <!---End Single Item-->
        </template>
      </v-list>
      
      <!-- Version info -->
      <div class="pa-3 text-center sidebar-footer">
        <v-chip 
          color="primary" 
          variant="tonal" 
          size="small" 
          class="modern-chip"
        >
          <v-icon start size="small">mdi-rocket-launch</v-icon>
          v1.1.0
        </v-chip>
      </div>
    </div>
  </v-navigation-drawer>
</template>
