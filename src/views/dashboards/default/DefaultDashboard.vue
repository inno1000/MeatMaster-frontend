<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

// Données réactives pour le tableau de bord
const stockData = ref({
  totalStock: 0,
  lowStockAlerts: 0,
  todaySales: 0,
  todayRevenue: 0,
  pendingPayments: 0,
  recentReceptions: []
});

const meatTypes = ref([
  { name: 'Bœuf', stock: 45, unit: 'kg', status: 'normal' },
  { name: 'Mouton', stock: 23, unit: 'kg', status: 'low' },
  { name: 'Chèvre', stock: 12, unit: 'kg', status: 'critical' },
  { name: 'Poulet', stock: 67, unit: 'kg', status: 'normal' }
]);

const recentActivities = ref([
  { type: 'reception', meat: 'Bœuf', quantity: '25 kg', time: '10:30', status: 'success' },
  { type: 'vente', meat: 'Mouton', quantity: '8 kg', time: '11:15', status: 'success' },
  { type: 'versement', amount: '150,000 FCFA', time: '14:20', status: 'pending' },
  { type: 'reception', meat: 'Poulet', quantity: '30 kg', time: '16:45', status: 'success' }
]);

onMounted(() => {
  // Simulation de données - à remplacer par des appels API réels
  loadDashboardData();
});

function loadDashboardData() {
  // Calculer le stock total
  stockData.value.totalStock = meatTypes.value.reduce((total, meat) => total + meat.stock, 0);
  
  // Compter les alertes de stock bas
  stockData.value.lowStockAlerts = meatTypes.value.filter(meat => 
    meat.status === 'low' || meat.status === 'critical'
  ).length;
  
  // Données simulées pour les ventes du jour
  stockData.value.todaySales = 45;
  stockData.value.todayRevenue = 275000;
  stockData.value.pendingPayments = 2;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'normal': return 'success';
    case 'low': return 'warning';
    case 'critical': return 'error';
    default: return 'info';
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'reception': return 'mdi-truck-delivery';
    case 'vente': return 'mdi-cash-register';
    case 'versement': return 'mdi-bank-transfer';
    default: return 'mdi-information';
  }
}
</script>

<template>
  <v-row class="dashboard-cards">
    <!-- Cartes de résumé -->
    <v-col cols="12" sm="6" md="3" class="fade-in">
      <v-card 
        class="mobile-stats modern-card stats-card elevation-2" 
        hover
        :ripple="false"
        color="surface"
      >
        <v-card-text class="text-center pa-6">
          <div class="icon-container mb-4">
            <v-icon size="48" color="primary" class="modern-icon">mdi-package-variant</v-icon>
          </div>
          <h3 class="stats-number mb-2">{{ stockData.totalStock }}</h3>
          <p class="text-body-1 text-medium-emphasis font-weight-medium">Stock Total (kg)</p>
          <div class="mt-2">
            <v-chip 
              color="primary" 
              variant="tonal" 
              size="small"
              class="modern-chip"
            >
              <v-icon start size="small">mdi-trending-up</v-icon>
              +12% ce mois
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3" class="fade-in" style="animation-delay: 0.1s">
      <v-card 
        class="mobile-stats modern-card stats-card elevation-2" 
        hover
        :ripple="false"
        color="surface"
      >
        <v-card-text class="text-center pa-6">
          <div class="icon-container mb-4">
            <v-icon size="48" color="warning" class="modern-icon pulse-animation">mdi-alert-circle</v-icon>
          </div>
          <h3 class="stats-number mb-2 text-warning">{{ stockData.lowStockAlerts }}</h3>
          <p class="text-body-1 text-medium-emphasis font-weight-medium">Alertes Stock</p>
          <div class="mt-2">
            <v-chip 
              color="warning" 
              variant="tonal" 
              size="small"
              class="modern-chip"
            >
              <v-icon start size="small">mdi-clock-alert</v-icon>
              Attention requise
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3" class="fade-in" style="animation-delay: 0.2s">
      <v-card 
        class="mobile-stats modern-card stats-card elevation-2" 
        hover
        :ripple="false"
        color="surface"
      >
        <v-card-text class="text-center pa-6">
          <div class="icon-container mb-4">
            <v-icon size="48" color="success" class="modern-icon">mdi-cash-multiple</v-icon>
          </div>
          <h3 class="stats-number mb-2 text-success">{{ stockData.todaySales }}</h3>
          <p class="text-body-1 text-medium-emphasis font-weight-medium">Ventes Aujourd'hui</p>
          <div class="mt-2">
            <v-chip 
              color="success" 
              variant="tonal" 
              size="small"
              class="modern-chip"
            >
              <v-icon start size="small">mdi-trending-up</v-icon>
              +8% vs hier
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3" class="fade-in" style="animation-delay: 0.3s">
      <v-card 
        class="mobile-stats modern-card stats-card elevation-2" 
        hover
        :ripple="false"
        color="surface"
      >
        <v-card-text class="text-center pa-6">
          <div class="icon-container mb-4">
            <v-icon size="48" color="info" class="modern-icon">mdi-currency-usd</v-icon>
          </div>
          <h3 class="stats-number mb-2 text-info">{{ stockData.todayRevenue.toLocaleString() }}</h3>
          <p class="text-body-1 text-medium-emphasis font-weight-medium">Revenus (FCFA)</p>
          <div class="mt-2">
            <v-chip 
              color="info" 
              variant="tonal" 
              size="small"
              class="modern-chip"
            >
              <v-icon start size="small">mdi-trending-up</v-icon>
              +15% ce mois
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- État des stocks -->
    <v-col cols="12" md="8" class="slide-in-left">
      <v-card class="modern-content-card gradient-card elevation-2" rounded="lg">
        <v-card-title class="pa-6 pb-2">
          <div class="d-flex align-center">
            <div class="icon-container me-3">
              <v-icon color="primary" class="modern-icon">mdi-package-variant</v-icon>
            </div>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1">État des Stocks</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">Vue d'ensemble de votre inventaire</p>
            </div>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-list class="modern-list stock-list">
            <v-list-item
              v-for="(meat, index) in meatTypes"
              :key="meat.name"
              class="px-0 mb-2 stock-item"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <template v-slot:prepend>
                <v-avatar 
                  :color="getStatusColor(meat.status)" 
                  size="large" 
                  class="elevation-2 flex-shrink-0"
                >
                  <v-icon color="white">mdi-cow</v-icon>
                </v-avatar>
              </template>
              
              <div class="flex-grow-1 min-width-0">
                <v-list-item-title class="font-weight-bold text-h6">{{ meat.name }}</v-list-item-title>
                <v-list-item-subtitle class="text-body-1 font-weight-medium">
                  {{ meat.stock }} {{ meat.unit }} disponible
                </v-list-item-subtitle>
              </div>
              
              <template v-slot:append>
                <div class="d-flex flex-column align-end flex-shrink-0">
                  <v-chip 
                    :color="getStatusColor(meat.status)" 
                    size="small"
                    variant="flat"
                    class="modern-chip mb-1"
                  >
                    {{ meat.status === 'normal' ? 'Normal' : meat.status === 'low' ? 'Bas' : 'Critique' }}
                  </v-chip>
                  <v-progress-linear
                    :model-value="meat.status === 'normal' ? 80 : meat.status === 'low' ? 40 : 20"
                    :color="getStatusColor(meat.status)"
                    height="4"
                    rounded
                    class="mt-1"
                    style="width: 60px"
                  ></v-progress-linear>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Activités récentes -->
    <v-col cols="12" md="4" class="slide-in-right">
      <v-card class="modern-card gradient-card elevation-2" rounded="lg">
        <v-card-title class="pa-6 pb-2">
          <div class="d-flex align-center">
            <div class="icon-container me-3">
              <v-icon color="secondary" class="modern-icon">mdi-history</v-icon>
            </div>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1">Activités Récentes</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">Dernières opérations</p>
            </div>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-timeline density="compact" align="start" class="modern-timeline">
            <v-timeline-item
              v-for="(activity, index) in recentActivities"
              :key="activity.time"
              :dot-color="activity.status === 'success' ? 'success' : 'warning'"
              size="small"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <v-card 
                variant="tonal" 
                :color="activity.status === 'success' ? 'success' : 'warning'"
                class="pa-3 modern-alert"
                rounded="md"
              >
                <div class="d-flex align-center">
                  <v-icon 
                    :icon="getActivityIcon(activity.type)" 
                    size="small" 
                    class="me-3"
                    :color="activity.status === 'success' ? 'success' : 'warning'"
                  ></v-icon>
                  <div class="flex-grow-1">
                    <div class="text-body-2 font-weight-medium">
                      <span v-if="activity.type === 'reception'">
                        Réception {{ activity.meat }}: {{ activity.quantity }}
                      </span>
                      <span v-else-if="activity.type === 'vente'">
                        Vente {{ activity.meat }}: {{ activity.quantity }}
                      </span>
                      <span v-else-if="activity.type === 'versement'">
                        Versement: {{ activity.amount }}
                      </span>
                    </div>
                    <div class="text-caption text-medium-emphasis d-flex align-center">
                      <v-icon size="x-small" class="me-1">mdi-clock-outline</v-icon>
                      {{ activity.time }}
                    </div>
                  </div>
                  <v-chip 
                    :color="activity.status === 'success' ? 'success' : 'warning'"
                    size="x-small"
                    variant="flat"
                    class="modern-chip"
                  >
                    {{ activity.status === 'success' ? 'OK' : 'En attente' }}
                  </v-chip>
                </div>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Actions rapides -->
    <v-col cols="12" class="fade-in" style="animation-delay: 0.4s">
      <v-card class="modern-card gradient-card elevation-2" color="surface" rounded="lg">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <div class="icon-container me-3">
              <v-icon color="primary" class="modern-icon">mdi-lightning-bolt</v-icon>
            </div>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1">Actions Rapides</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">Accès direct aux fonctions principales</p>
            </div>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <v-row>
            <v-col cols="6" sm="3" class="mb-3">
              <v-card 
                class="modern-card h-100 text-center pa-4 action-card"
                hover
                :ripple="false"
                rounded="lg"
                @click="$router.push('/main/stock/reception')"
              >
                <v-icon size="48" color="primary" class="mb-3 modern-icon">mdi-truck-delivery</v-icon>
                <h4 class="text-h6 font-weight-bold mb-2">Nouvelle Réception</h4>
                <p class="text-body-2 text-medium-emphasis">Enregistrer un arrivage</p>
              </v-card>
            </v-col>
            <v-col cols="6" sm="3" class="mb-3">
              <v-card 
                class="modern-card h-100 text-center pa-4 action-card"
                hover
                :ripple="false"
                rounded="lg"
                @click="$router.push('/main/vente/enregistrer')"
              >
                <v-icon size="48" color="success" class="mb-3 modern-icon">mdi-cash-register</v-icon>
                <h4 class="text-h6 font-weight-bold mb-2">Enregistrer Vente</h4>
                <p class="text-body-2 text-medium-emphasis">Saisir une vente</p>
              </v-card>
            </v-col>
            <v-col cols="6" sm="3" class="mb-3">
              <v-card 
                class="modern-card h-100 text-center pa-4 action-card"
                hover
                :ripple="false"
                rounded="lg"
                @click="$router.push('/main/versement/enregistrer')"
              >
                <v-icon size="48" color="info" class="mb-3 modern-icon">mdi-bank-transfer</v-icon>
                <h4 class="text-h6 font-weight-bold mb-2">Nouveau Versement</h4>
                <p class="text-body-2 text-medium-emphasis">Enregistrer un paiement</p>
              </v-card>
            </v-col>
            <v-col cols="6" sm="3" class="mb-3">
              <v-card 
                class="modern-card h-100 text-center pa-4 action-card"
                hover
                :ripple="false"
                rounded="lg"
                @click="$router.push('/main/stock/journal')"
              >
                <v-icon size="48" color="warning" class="mb-3 modern-icon">mdi-chart-line</v-icon>
                <h4 class="text-h6 font-weight-bold mb-2">Voir Journal</h4>
                <p class="text-body-2 text-medium-emphasis">Consulter l'historique</p>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
