<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const page = ref({ title: 'Rapport de Ventes' });

// Données de vente simulées
const salesData = ref([
  {
    id: 1,
    date: '2024-01-15',
    meatType: 'Bœuf',
    quantity: 25,
    unitPrice: 2500,
    totalAmount: 62500,
    customer: 'Client A'
  },
  {
    id: 2,
    date: '2024-01-15',
    meatType: 'Mouton',
    quantity: 15,
    unitPrice: 3000,
    totalAmount: 45000,
    customer: 'Client B'
  },
  {
    id: 3,
    date: '2024-01-14',
    meatType: 'Poulet',
    quantity: 30,
    unitPrice: 2000,
    totalAmount: 60000,
    customer: 'Client C'
  },
  {
    id: 4,
    date: '2024-01-14',
    meatType: 'Chèvre',
    quantity: 12,
    unitPrice: 2800,
    totalAmount: 33600,
    customer: 'Client D'
  }
]);

// Filtres
const dateFrom = ref<string | null>(null);
const dateTo = ref<string | null>(null);
const selectedMeatType = ref<string | null>(null);

// Types de viande pour le filtre
const meatTypes = ref(['Bœuf', 'Mouton', 'Chèvre', 'Poulet']);

// Données filtrées
const filteredSales = computed(() => {
  let filtered = salesData.value;
  
  if (dateFrom.value) {
    filtered = filtered.filter(sale => sale.date >= dateFrom.value);
  }
  
  if (dateTo.value) {
    filtered = filtered.filter(sale => sale.date <= dateTo.value);
  }
  
  if (selectedMeatType.value) {
    filtered = filtered.filter(sale => sale.meatType === selectedMeatType.value);
  }
  
  return filtered;
});

// Statistiques calculées
const totalSales = computed(() => {
  return filteredSales.value.reduce((total, sale) => total + sale.totalAmount, 0);
});

const totalQuantity = computed(() => {
  return filteredSales.value.reduce((total, sale) => total + sale.quantity, 0);
});

const averageSale = computed(() => {
  return filteredSales.value.length > 0 ? totalSales.value / filteredSales.value.length : 0;
});

const salesByMeatType = computed(() => {
  const grouped = filteredSales.value.reduce((acc, sale) => {
    if (!acc[sale.meatType]) {
      acc[sale.meatType] = { quantity: 0, amount: 0 };
    }
    acc[sale.meatType].quantity += sale.quantity;
    acc[sale.meatType].amount += sale.totalAmount;
    return acc;
  }, {} as Record<string, { quantity: number; amount: number }>);
  
  return Object.entries(grouped).map(([meatType, data]) => ({
    meatType,
    quantity: data.quantity,
    amount: data.amount
  }));
});

// Fonctions
function formatCurrency(amount: number) {
  return amount.toLocaleString() + ' FCFA';
}

function exportToPDF() {
  // Ici, vous implémenteriez l'export PDF
  console.log('Export PDF...');
}

function exportToExcel() {
  // Ici, vous implémenteriez l'export Excel
  console.log('Export Excel...');
}

function clearFilters() {
  dateFrom.value = null;
  dateTo.value = null;
  selectedMeatType.value = null;
}

onMounted(() => {
  // Charger les données initiales
  console.log('Chargement des données de vente...');
});
</script>

<template>
  <v-row>
    <!-- En-tête avec filtres -->
    <v-col cols="12">
      <UiParentCard title="Rapport de Ventes">
        <template v-slot:actions>
          <div class="mobile-filters">
            <v-row class="ma-0">
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="dateFrom"
                  label="Date de début"
                  type="date"
                  density="compact"
                  variant="outlined"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="dateTo"
                  label="Date de fin"
                  type="date"
                  density="compact"
                  variant="outlined"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
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
              <v-col cols="12" sm="3">
                <div class="d-flex gap-2">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-filter"
                    @click="clearFilters"
                  >
                    Effacer
                  </v-btn>
                  <v-btn
                    color="success"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-file-pdf"
                    @click="exportToPDF"
                  >
                    PDF
                  </v-btn>
                  <v-btn
                    color="info"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-file-excel"
                    @click="exportToExcel"
                  >
                    Excel
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </div>
        </template>
      </UiParentCard>
    </v-col>

    <!-- Statistiques résumées -->
    <v-col cols="12" sm="6" md="3">
      <UiParentCard>
        <v-card-text class="text-center">
          <v-icon size="40" color="primary" class="mb-2">mdi-cash-multiple</v-icon>
          <h3 class="text-h4 font-weight-bold">{{ formatCurrency(totalSales) }}</h3>
          <p class="text-body-2 text-medium-emphasis">Chiffre d'affaires</p>
        </v-card-text>
      </UiParentCard>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <UiParentCard>
        <v-card-text class="text-center">
          <v-icon size="40" color="success" class="mb-2">mdi-scale-balance</v-icon>
          <h3 class="text-h4 font-weight-bold">{{ totalQuantity }} kg</h3>
          <p class="text-body-2 text-medium-emphasis">Quantité vendue</p>
        </v-card-text>
      </UiParentCard>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <UiParentCard>
        <v-card-text class="text-center">
          <v-icon size="40" color="info" class="mb-2">mdi-chart-line</v-icon>
          <h3 class="text-h4 font-weight-bold">{{ formatCurrency(averageSale) }}</h3>
          <p class="text-body-2 text-medium-emphasis">Vente moyenne</p>
        </v-card-text>
      </UiParentCard>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <UiParentCard>
        <v-card-text class="text-center">
          <v-icon size="40" color="warning" class="mb-2">mdi-receipt</v-icon>
          <h3 class="text-h4 font-weight-bold">{{ filteredSales.length }}</h3>
          <p class="text-body-2 text-medium-emphasis">Nombre de ventes</p>
        </v-card-text>
      </UiParentCard>
    </v-col>

    <!-- Ventes par type de viande -->
    <v-col cols="12" md="6">
      <UiParentCard title="Ventes par Type de Viande">
        <v-list>
          <v-list-item
            v-for="item in salesByMeatType"
            :key="item.meatType"
            class="px-0"
          >
            <template v-slot:prepend>
              <v-avatar color="primary" size="small">
                <v-icon color="white" size="small">mdi-cow</v-icon>
              </v-avatar>
            </template>
            
            <v-list-item-title>{{ item.meatType }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ item.quantity }}kg - {{ formatCurrency(item.amount) }}
            </v-list-item-subtitle>
            
            <template v-slot:append>
              <v-chip
                color="primary"
                size="small"
                variant="flat"
              >
                {{ Math.round((item.amount / totalSales) * 100) }}%
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </UiParentCard>
    </v-col>

    <!-- Détail des ventes -->
    <v-col cols="12" md="6">
      <UiParentCard title="Détail des Ventes">
        <v-data-table
          :headers="[
            { title: 'Date', key: 'date', sortable: true },
            { title: 'Type', key: 'meatType', sortable: true },
            { title: 'Qté (kg)', key: 'quantity', sortable: true },
            { title: 'Prix/kg', key: 'unitPrice', sortable: true },
            { title: 'Total', key: 'totalAmount', sortable: true }
          ]"
          :items="filteredSales"
          class="elevation-0"
          :items-per-page="5"
        >
          <template v-slot:item.unitPrice="{ item }">
            {{ formatCurrency(item.unitPrice) }}
          </template>
          
          <template v-slot:item.totalAmount="{ item }">
            <strong>{{ formatCurrency(item.totalAmount) }}</strong>
          </template>
        </v-data-table>
      </UiParentCard>
    </v-col>

    <!-- Message si aucune donnée -->
    <v-col cols="12" v-if="filteredSales.length === 0">
      <v-alert
        type="info"
        variant="tonal"
        prepend-icon="mdi-information"
        class="text-center"
      >
        Aucune vente trouvée pour les critères sélectionnés
      </v-alert>
    </v-col>
  </v-row>
</template>
