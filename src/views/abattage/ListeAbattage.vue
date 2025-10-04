<template>
  <v-row>
    <v-col cols="12">
      <UiParentCard 
        title="Liste des Animaux Abattus"
        subtitle="Consultez et gérez l'historique des abattages"
        icon="mdi-cow"
        color="primary"
      >
        <!-- En-tête avec statistiques -->
        <v-row class="mb-6">
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="stats-card pa-4 text-center">
              <v-icon size="32" color="primary" class="mb-2">mdi-cow</v-icon>
              <h3 class="text-h5 font-weight-bold">{{ animals.length }}</h3>
              <p class="text-body-2 text-medium-emphasis">Animal(s) abattu(s)</p>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="stats-card pa-4 text-center">
              <v-icon size="32" color="success" class="mb-2">mdi-scale-balance</v-icon>
              <h3 class="text-h5 font-weight-bold">{{ totalWeight }} kg</h3>
              <p class="text-body-2 text-medium-emphasis">Poids total</p>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="stats-card pa-4 text-center">
              <v-icon size="32" color="info" class="mb-2">mdi-currency-usd</v-icon>
              <h3 class="text-h5 font-weight-bold">{{ formatCurrency(totalValue) }}</h3>
              <p class="text-body-2 text-medium-emphasis">Valeur totale</p>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="stats-card pa-4 text-center">
              <v-icon size="32" color="warning" class="mb-2">mdi-home</v-icon>
              <h3 class="text-h5 font-weight-bold">{{ totalButchers }}</h3>
              <p class="text-body-2 text-medium-emphasis">Boucheries impliquées</p>
            </v-card>
          </v-col>
        </v-row>

        <!-- Barre de recherche et filtres -->
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              label="Rechercher un animal..."
              variant="outlined"
              clearable
              prepend-icon="mdi-magnify"
              class="modern-search"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedFilter"
              :items="filterOptions"
              label="Filtrer par"
              variant="outlined"
              prepend-icon="mdi-filter"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              @click="addNewAnimal"
              class="modern-btn"
              block
            >
              Nouvel abattage
            </v-btn>
          </v-col>
        </v-row>

        <!-- Tableau des animaux -->
        <v-card variant="outlined" class="modern-table">
          <v-data-table
            :items="filteredAnimals"
            :search="search"
            :headers="headers"
            :items-per-page="10"
            class="elevation-0"
            :loading="loading"
          >
            <!-- Colonne du poids -->
            <template v-slot:item.weight="{ item }">
              <div class="d-flex align-center">
                <v-icon class="me-2" color="primary">mdi-scale-balance</v-icon>
                <span class="font-weight-bold">{{ item.weight }} kg</span>
              </div>
            </template>

            <!-- Colonne du prix d'achat -->
            <template v-slot:item.purchasePrice="{ item }">
              <div class="d-flex align-center">
                <v-icon class="me-2" color="success">mdi-currency-usd</v-icon>
                <span class="font-weight-bold">{{ formatCurrency(item.purchasePrice) }}</span>
              </div>
            </template>

            <!-- Colonne du poids de viande -->
            <template v-slot:item.meatWeight="{ item }">
              <div class="d-flex align-center">
                <v-icon class="me-2" color="info">mdi-food-drumstick</v-icon>
                <span class="font-weight-bold">{{ item.meatWeight }} kg</span>
              </div>
            </template>

            <!-- Colonne du poids des tripes -->
            <template v-slot:item.tripesWeight="{ item }">
              <div class="d-flex align-center">
                <v-icon class="me-2" color="warning">mdi-food</v-icon>
                <span class="font-weight-bold">{{ item.tripesWeight }} kg</span>
              </div>
            </template>

            <!-- Colonne des boucheries -->
            <template v-slot:item.butchers="{ item }">
              <div class="butchers-column">
                <div class="d-flex align-center gap-1 mb-1">
                  <v-chip
                    v-for="(butcher, index) in item.butchers.slice(0, 1)"
                    :key="index"
                    size="x-small"
                    color="primary"
                    variant="flat"
                    class="butcher-chip"
                  >
                    {{ butcher.name }}
                  </v-chip>
                  <v-chip
                    v-if="item.butchers.length > 1"
                    size="x-small"
                    color="grey"
                    variant="flat"
                  >
                    +{{ item.butchers.length - 1 }}
                  </v-chip>
                </div>
                <v-btn
                  color="primary"
                  variant="text"
                  size="x-small"
                  prepend-icon="mdi-eye"
                  @click="openModal(item.butchers)"
                  class="view-btn"
                >
                  Voir
                </v-btn>
              </div>
            </template>

            <!-- Colonne des actions -->
            <template v-slot:item.actions="{ item }">
              <div class="d-flex align-center gap-2">
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  prepend-icon="mdi-eye"
                  @click="viewDetails(item)"
                >
                  Détails
                </v-btn>
                <v-btn
                  color="success"
                  variant="text"
                  size="small"
                  prepend-icon="mdi-pencil"
                  @click="editAnimal(item)"
                >
                  Modifier
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  size="small"
                  prepend-icon="mdi-delete"
                  @click="deleteAnimal(item)"
                >
                  Supprimer
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>

        <!-- Modale pour afficher les boucheries -->
        <v-dialog v-model="modalOpen" max-width="900" class="modern-dialog">
          <v-card class="modern-card">
            <v-card-title class="modern-card-title">
              <div class="d-flex justify-space-between align-center w-100">
                <div class="d-flex align-center">
                  <v-icon class="me-2" color="primary">mdi-home</v-icon>
                  <h3 class="text-h5 font-weight-bold">Distribution aux Boucheries</h3>
                </div>
                <v-btn color="error" icon @click="closeModal" variant="text">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-6">
              <v-row>
                <v-col
                  v-for="(butcher, index) in selectedButchers"
                  :key="index"
                  cols="12"
                  md="6"
                >
                  <v-card variant="outlined" class="butcher-card pa-4">
                    <div class="d-flex align-center mb-3">
                      <v-avatar color="success" size="small" class="me-3">
                        <v-icon color="white" size="small">mdi-home</v-icon>
                      </v-avatar>
                      <h4 class="text-h6 font-weight-bold">{{ butcher.name }}</h4>
                    </div>
                    
                    <v-card variant="tonal" color="primary" class="pa-3 mb-3 text-center">
                      <h3 class="text-h5 font-weight-bold">
                        {{ butcher.weight }} kg à {{ formatCurrency(butcher.price) }}
                      </h3>
                      <p class="text-body-2 mb-0">Prix total: {{ formatCurrency(butcher.weight * butcher.price) }}</p>
                    </v-card>
                    
                    <div class="butcher-info">
                      <div class="d-flex align-center mb-2">
                        <v-icon class="me-2" color="info" size="small">mdi-map-marker</v-icon>
                        <span><strong>Adresse:</strong> {{ butcher.address }}</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon class="me-2" color="success" size="small">mdi-phone</v-icon>
                        <span><strong>Téléphone:</strong> {{ butcher.phone }}</span>
                      </div>
                      <div class="d-flex align-center">
                        <v-icon class="me-2" color="warning" size="small">mdi-city</v-icon>
                        <span><strong>Ville:</strong> {{ butcher.city }}</span>
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn color="primary" variant="elevated" @click="closeModal" class="modern-btn">
                <v-icon class="me-2">mdi-check</v-icon>
                Fermer
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </UiParentCard>
    </v-col>
  </v-row>
</template>

<script>
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { router } from '../../router';
import toastMessage from '@/helpers/toast';

export default {
  components: {
    UiParentCard,
  },
  data() {
    return {
      search: '',
      selectedFilter: null,
      loading: false,
      headers: [
        { title: 'Poids (kg)', key: 'weight', sortable: true, width: '120px' },
        { title: 'Prix d\'achat', key: 'purchasePrice', sortable: true, width: '150px' },
        { title: 'Viande (kg)', key: 'meatWeight', sortable: true, width: '120px' },
        { title: 'Tripes (kg)', key: 'tripesWeight', sortable: true, width: '120px' },
        { title: 'Boucheries', key: 'butchers', sortable: false, width: '200px' },
        { title: 'Actions', key: 'actions', sortable: false, align: 'center', width: '180px' },
      ],
      filterOptions: [
        { title: 'Poids élevé', value: 'high_weight' },
        { title: 'Prix élevé', value: 'high_price' },
        { title: 'Plus de boucheries', value: 'more_butchers' },
        { title: 'Récent', value: 'recent' },
      ],
      animals: [
        {
          id: 1,
          weight: 200,
          purchasePrice: 500000,
          meatWeight: 150,
          tripesWeight: 30,
          date: '2024-01-15',
          butchers: [
            { name: 'Boucherie Halal', weight: 80, price: 2000, address: 'Ngaoundéré, Yoko', city: 'Ngaoundéré', postal_code: '454', phone: '(+237) 695956707' },
            { name: 'Boucherie Centrale', weight: 70, price: 1750, address: 'Douala, Rue 5', city: 'Douala', postal_code: '123', phone: '(+237) 612345678' },
          ],
        },
        {
          id: 2,
          weight: 180,
          purchasePrice: 450000,
          meatWeight: 130,
          tripesWeight: 25,
          date: '2024-01-14',
          butchers: [
            { name: 'Boucherie Halal', weight: 70, price: 1800, address: 'Ngaoundéré, Yoko', city: 'Ngaoundéré', postal_code: '454', phone: '(+237) 695956707' },
            { name: 'Boucherie du Marché', weight: 60, price: 1500, address: 'Yaoundé, Marché Central', city: 'Yaoundé', postal_code: '789', phone: '(+237) 678901234' },
          ],
        },
        {
          id: 3,
          weight: 220,
          purchasePrice: 550000,
          meatWeight: 160,
          tripesWeight: 35,
          date: '2024-01-13',
          butchers: [
            { name: 'Boucherie Centrale', weight: 90, price: 2200, address: 'Douala, Rue 5', city: 'Douala', postal_code: '123', phone: '(+237) 612345678' },
          ],
        },
        {
          id: 4,
          weight: 190,
          purchasePrice: 480000,
          meatWeight: 140,
          tripesWeight: 28,
          date: '2024-01-12',
          butchers: [
            { name: 'Boucherie Halal', weight: 75, price: 1900, address: 'Ngaoundéré, Yoko', city: 'Ngaoundéré', postal_code: '454', phone: '(+237) 695956707' },
            { name: 'Boucherie du Marché', weight: 65, price: 1600, address: 'Yaoundé, Marché Central', city: 'Yaoundé', postal_code: '789', phone: '(+237) 678901234' },
            { name: 'Boucherie Centrale', weight: 60, price: 1500, address: 'Douala, Rue 5', city: 'Douala', postal_code: '123', phone: '(+237) 612345678' },
          ],
        },
        {
          id: 5,
          weight: 210,
          purchasePrice: 520000,
          meatWeight: 155,
          tripesWeight: 30,
          date: '2024-01-11',
          butchers: [
            { name: 'Boucherie du Marché', weight: 70, price: 1750, address: 'Yaoundé, Marché Central', city: 'Yaoundé', postal_code: '789', phone: '(+237) 678901234' },
            { name: 'Boucherie Centrale', weight: 85, price: 2000, address: 'Douala, Rue 5', city: 'Douala', postal_code: '123', phone: '(+237) 612345678' },
          ],
        },
      ],
      modalOpen: false,
      selectedButchers: [],
    };
  },
  computed: {
    totalWeight() {
      return this.animals.reduce((total, animal) => total + animal.weight, 0);
    },
    totalValue() {
      return this.animals.reduce((total, animal) => total + animal.purchasePrice, 0);
    },
    totalButchers() {
      const uniqueButchers = new Set();
      this.animals.forEach(animal => {
        animal.butchers.forEach(butcher => {
          uniqueButchers.add(butcher.name);
        });
      });
      return uniqueButchers.size;
    },
    filteredAnimals() {
      let filtered = [...this.animals];
      
      if (this.selectedFilter) {
        switch (this.selectedFilter) {
          case 'high_weight':
            filtered = filtered.sort((a, b) => b.weight - a.weight);
            break;
          case 'high_price':
            filtered = filtered.sort((a, b) => b.purchasePrice - a.purchasePrice);
            break;
          case 'more_butchers':
            filtered = filtered.sort((a, b) => b.butchers.length - a.butchers.length);
            break;
          case 'recent':
            filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        }
      }
      
      return filtered;
    }
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
      }).format(value);
    },
    openModal(butchers) {
      this.selectedButchers = butchers;
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
    },
    viewDetails(animal) {
      console.log('Détails de l\'animal :', animal);
      router.push(`/abattage/detail_abattage/${animal.id}`);
    },
    editAnimal(animal) {
      console.log('Modifier l\'animal :', animal);
      router.push(`/abattage/edit/${animal.id}`);
      toastMessage('Fonctionnalité de modification en cours de développement', 'info');
    },
    deleteAnimal(animal) {
      if (confirm(`Êtes-vous sûr de vouloir supprimer l'animal de ${animal.weight}kg ?`)) {
        const index = this.animals.findIndex(a => a.id === animal.id);
        if (index > -1) {
          this.animals.splice(index, 1);
          toastMessage('Animal supprimé avec succès', 'success');
        }
      }
    },
    addNewAnimal() {
      router.push('/abattage/enreg_abattage');
    }
  },
};
</script>

<style scoped>
/* Styles pour les cartes de statistiques */
.stats-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-outline), 0.08);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

/* Styles pour la barre de recherche */
.modern-search .v-field {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.modern-search .v-field:hover {
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.1);
  transform: translateY(-1px);
}

.modern-search .v-field--focused {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
  transform: translateY(-2px);
}

/* Styles pour le tableau */
.modern-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(var(--v-theme-outline), 0.08);
}

.modern-table .v-data-table__th {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-primary), 0.02));
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.modern-table .v-data-table__td {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.08);
}

/* Styles pour les boutons modernes */
.modern-btn {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
}

.modern-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.3);
}

/* Styles pour la modale */
.modern-dialog .v-card {
  border-radius: 16px;
  overflow: hidden;
}

.modern-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-outline), 0.08);
}

.modern-card-title {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-primary), 0.02));
  padding: 20px 24px;
}

/* Styles pour les cartes de boucherie */
.butcher-card {
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-outline), 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.butcher-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--v-theme-success), 0.3);
}

.butcher-info {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  padding: 12px;
}

/* Styles pour la colonne boucheries */
.butchers-column {
  max-width: 200px;
}

.butcher-chip {
  font-size: 0.7rem;
  height: 20px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-btn {
  font-size: 0.7rem;
  min-width: auto;
  padding: 0 8px;
  height: 24px;
}

/* Utilitaires */
.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.justify-space-between {
  justify-content: space-between;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.w-100 {
  width: 100%;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .stats-card {
    margin-bottom: 12px;
  }
  
  .modern-btn {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .butcher-card {
    margin-bottom: 12px;
  }
  
  .gap-2 {
    gap: 4px;
  }
}
</style>
