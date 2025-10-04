<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const page = ref({ title: 'Gestion des Stocks' });

// Données des stocks
const stockData = ref([
  { 
    id: 1, 
    name: 'Bœuf', 
    currentStock: 45, 
    minThreshold: 20, 
    maxThreshold: 100, 
    unit: 'kg', 
    price: 2500,
    lastUpdated: '2024-01-15',
    status: 'normal'
  },
  { 
    id: 2, 
    name: 'Mouton', 
    currentStock: 15, 
    minThreshold: 20, 
    maxThreshold: 80, 
    unit: 'kg', 
    price: 3000,
    lastUpdated: '2024-01-14',
    status: 'low'
  },
  { 
    id: 3, 
    name: 'Chèvre', 
    currentStock: 8, 
    minThreshold: 15, 
    maxThreshold: 60, 
    unit: 'kg', 
    price: 2800,
    lastUpdated: '2024-01-13',
    status: 'critical'
  },
  { 
    id: 4, 
    name: 'Poulet', 
    currentStock: 67, 
    minThreshold: 30, 
    maxThreshold: 120, 
    unit: 'kg', 
    price: 2000,
    lastUpdated: '2024-01-15',
    status: 'normal'
  }
]);

// Historique des mouvements
const stockHistory = ref([
  { 
    id: 1, 
    type: 'reception', 
    meatType: 'Bœuf', 
    quantity: 25, 
    date: '2024-01-15', 
    time: '10:30',
    user: 'Boucher A',
    status: 'completed'
  },
  { 
    id: 2, 
    type: 'vente', 
    meatType: 'Mouton', 
    quantity: 8, 
    date: '2024-01-15', 
    time: '11:15',
    user: 'Boucher B',
    status: 'completed'
  },
  { 
    id: 3, 
    type: 'reception', 
    meatType: 'Poulet', 
    quantity: 30, 
    date: '2024-01-15', 
    time: '16:45',
    user: 'Boucher A',
    status: 'completed'
  },
  { 
    id: 4, 
    type: 'vente', 
    meatType: 'Chèvre', 
    quantity: 5, 
    date: '2024-01-14', 
    time: '14:20',
    user: 'Boucher C',
    status: 'completed'
  }
]);

// Filtres
const selectedMeatType = ref<string | null>(null);
const selectedDateRange = ref<string | null>(null);
const selectedType = ref<string | null>(null);

// Types de viande pour le filtre
const meatTypes = ref(['Bœuf', 'Mouton', 'Chèvre', 'Poulet']);

// Types de mouvement pour le filtre
const movementTypes = ref([
  { name: 'Tous', value: null },
  { name: 'Réception', value: 'reception' },
  { name: 'Vente', value: 'vente' }
]);

// Calculs
const totalStockValue = computed(() => {
  return stockData.value.reduce((total, meat) => {
    return total + (meat.currentStock * meat.price);
  }, 0);
});

const lowStockItems = computed(() => {
  return stockData.value.filter(meat => meat.status === 'low' || meat.status === 'critical');
});

const criticalStockItems = computed(() => {
  return stockData.value.filter(meat => meat.status === 'critical');
});

// Historique filtré
const filteredHistory = computed(() => {
  let filtered = stockHistory.value;
  
  if (selectedMeatType.value) {
    filtered = filtered.filter(item => item.meatType === selectedMeatType.value);
  }
  
  if (selectedType.value) {
    filtered = filtered.filter(item => item.type === selectedType.value);
  }
  
  return filtered;
});

// Fonctions
function getStatusColor(status: string) {
  switch (status) {
    case 'normal': return 'success';
    case 'low': return 'warning';
    case 'critical': return 'error';
    default: return 'info';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'normal': return 'Normal';
    case 'low': return 'Stock bas';
    case 'critical': return 'Stock critique';
    default: return 'Inconnu';
  }
}

function getMovementIcon(type: string) {
  switch (type) {
    case 'reception': return 'mdi-truck-delivery';
    case 'vente': return 'mdi-cash-register';
    default: return 'mdi-information';
  }
}

function getMovementColor(type: string) {
  switch (type) {
    case 'reception': return 'success';
    case 'vente': return 'primary';
    default: return 'info';
  }
}

function formatCurrency(amount: number) {
  return amount.toLocaleString() + ' FCFA';
}

function refreshStock() {
  // Ici, vous feriez un appel API pour actualiser les données
  console.log('Actualisation des stocks...');
}

onMounted(() => {
  // Charger les données initiales
  console.log('Chargement des données de stock...');
});
</script>

<template>
  <v-row>
    <!-- Cartes de résumé -->
    <v-col cols="12" sm="6" md="3">
      <UiParentCard>
        <v-card-text class="text-center">
          <v-icon size="40" color="primary" class="mb-2">mdi-package-variant</v-icon>
          <h3 class="text-h4 font-weight-bold">{{ stockData.length }}</h3>
          <p class="text-body-2 text-medium-emphasis">Types de viande</p>
        </v-card-text>
      </UiParentCard>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <UiParentCard>
        <v-card-text class="text-center">
          <v-icon size="40" color="warning" class="mb-2">mdi-alert-circle</v-icon>
          <h3 class="text-h4 font-weight-bold">{{ lowStockItems.length }}</h3>
          <p class="text-body-2 text-medium-emphasis">Alertes Stock</p>
        </v-card-text>
      </UiParentCard>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <UiParentCard>
        <v-card-text class="text-center">
          <v-icon size="40" color="error" class="mb-2">mdi-alert-octagon</v-icon>
          <h3 class="text-h4 font-weight-bold">{{ criticalStockItems.length }}</h3>
          <p class="text-body-2 text-medium-emphasis">Stock Critique</p>
        </v-card-text>
      </UiParentCard>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <UiParentCard>
        <v-card-text class="text-center">
          <v-icon size="40" color="success" class="mb-2">mdi-currency-usd</v-icon>
          <h3 class="text-h4 font-weight-bold">{{ formatCurrency(totalStockValue) }}</h3>
          <p class="text-body-2 text-medium-emphasis">Valeur Totale</p>
        </v-card-text>
      </UiParentCard>
    </v-col>

    <!-- État détaillé des stocks -->
    <v-col cols="12" md="8">
      <UiParentCard title="État des Stocks" :subtitle="`Dernière mise à jour: ${new Date().toLocaleDateString('fr-FR')}`">
        <template v-slot:actions>
          <v-btn
            color="primary"
            variant="outlined"
            size="small"
            prepend-icon="mdi-refresh"
            @click="refreshStock"
          >
            Actualiser
          </v-btn>
        </template>

        <v-data-table
          :headers="[
            { title: 'Type de viande', key: 'name', sortable: true },
            { title: 'Stock actuel', key: 'currentStock', sortable: true },
            { title: 'Seuil min', key: 'minThreshold', sortable: false },
            { title: 'Statut', key: 'status', sortable: true },
            { title: 'Prix/kg', key: 'price', sortable: true },
            { title: 'Valeur', key: 'value', sortable: true }
          ]"
          :items="stockData"
          class="elevation-0 mobile-table"
        >
          <template v-slot:item.status="{ item }">
            <v-chip 
              :color="getStatusColor(item.status)" 
              size="small"
              variant="flat"
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <template v-slot:item.value="{ item }">
            {{ formatCurrency(item.currentStock * item.price) }}
          </template>

          <template v-slot:item.currentStock="{ item }">
            <div class="d-flex align-center">
              <span class="me-2">{{ item.currentStock }} {{ item.unit }}</span>
              <v-progress-linear
                :model-value="(item.currentStock / item.maxThreshold) * 100"
                :color="getStatusColor(item.status)"
                height="4"
                rounded
                style="width: 60px"
              ></v-progress-linear>
            </div>
          </template>
        </v-data-table>
      </UiParentCard>
    </v-col>

    <!-- Alertes de stock -->
    <v-col cols="12" md="4">
      <UiParentCard title="Alertes de Stock">
        <v-list v-if="lowStockItems.length > 0" class="mobile-list">
          <v-list-item
            v-for="item in lowStockItems"
            :key="item.id"
            class="px-0"
          >
            <template v-slot:prepend>
              <v-avatar :color="getStatusColor(item.status)" size="small">
                <v-icon color="white" size="small">mdi-cow</v-icon>
              </v-avatar>
            </template>
            
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>
              Stock: {{ item.currentStock }}kg (Min: {{ item.minThreshold }}kg)
            </v-list-item-subtitle>
            
            <template v-slot:append>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                prepend-icon="mdi-truck-delivery"
                to="/main/stock/reception"
              >
                Commander
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-alert
          v-else
          type="success"
          variant="tonal"
          prepend-icon="mdi-check-circle"
        >
          Tous les stocks sont dans les normes
        </v-alert>
      </UiParentCard>
    </v-col>

    <!-- Historique des mouvements -->
    <v-col cols="12">
      <UiParentCard title="Historique des Mouvements">
        <template v-slot:actions>
          <v-row class="ma-0">
            <v-col cols="12" sm="4">
              <v-select
                v-model="selectedMeatType"
                :items="meatTypes"
                label="Type de viande"
                clearable
                density="compact"
                variant="outlined"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="selectedType"
                :items="movementTypes"
                item-title="name"
                item-value="value"
                label="Type de mouvement"
                clearable
                density="compact"
                variant="outlined"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="selectedDateRange"
                label="Période"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
        </template>

        <v-timeline density="compact" align="start">
          <v-timeline-item
            v-for="movement in filteredHistory"
            :key="movement.id"
            :dot-color="getMovementColor(movement.type)"
            size="small"
          >
            <div class="d-flex align-center">
              <v-icon :icon="getMovementIcon(movement.type)" size="small" class="me-2"></v-icon>
              <div class="flex-grow-1">
                <div class="text-body-2">
                  <span class="font-weight-medium">{{ movement.meatType }}</span>
                  - {{ movement.type === 'reception' ? 'Réception' : 'Vente' }} de 
                  <strong>{{ movement.quantity }}kg</strong>
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ movement.date }} à {{ movement.time }} - {{ movement.user }}
                </div>
              </div>
              <v-chip
                :color="getMovementColor(movement.type)"
                size="small"
                variant="flat"
              >
                {{ movement.type === 'reception' ? 'Réception' : 'Vente' }}
              </v-chip>
            </div>
          </v-timeline-item>
        </v-timeline>

        <v-alert
          v-if="filteredHistory.length === 0"
          type="info"
          variant="tonal"
          class="mt-4"
          prepend-icon="mdi-information"
        >
          Aucun mouvement trouvé pour les critères sélectionnés
        </v-alert>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
