<template>
  <v-row>
    <v-col cols="12">
      <UiParentCard 
        title="Détail de l'Abattage"
        subtitle="Informations complètes sur l'animal abattu"
        icon="mdi-cow"
        color="primary"
      >
        <!-- En-tête avec informations principales -->
        <v-row class="mb-6">
          <v-col cols="12" md="8">
            <v-card variant="outlined" class="animal-detail-card pa-6">
              <div class="d-flex align-center mb-4">
                <v-avatar color="primary" size="large" class="me-4">
                  <v-icon color="white" size="large">mdi-cow</v-icon>
                </v-avatar>
                <div>
                  <h2 class="text-h4 font-weight-bold">Animal #{{ animalId || '1' }}</h2>
                  <p class="text-body-1 text-medium-emphasis mb-0">Abattu le {{ formatDate(animalData.date) }}</p>
                </div>
              </div>
              
              <v-row>
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <v-icon class="me-2" color="primary">mdi-scale-balance</v-icon>
                    <span class="text-h6 font-weight-bold">{{ animalData.weight }} kg</span>
                    <p class="text-body-2 text-medium-emphasis mb-0">Poids total</p>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <v-icon class="me-2" color="success">mdi-currency-usd</v-icon>
                    <span class="text-h6 font-weight-bold">{{ formatCurrency(animalData.purchasePrice) }}</span>
                    <p class="text-body-2 text-medium-emphasis mb-0">Prix d'achat</p>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <v-icon class="me-2" color="info">mdi-food-drumstick</v-icon>
                    <span class="text-h6 font-weight-bold">{{ animalData.meatWeight }} kg</span>
                    <p class="text-body-2 text-medium-emphasis mb-0">Poids de viande</p>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <v-icon class="me-2" color="warning">mdi-food</v-icon>
                    <span class="text-h6 font-weight-bold">{{ animalData.tripesWeight }} kg</span>
                    <p class="text-body-2 text-medium-emphasis mb-0">Poids des tripes</p>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-card variant="outlined" class="stats-summary pa-4">
              <h3 class="text-h6 font-weight-bold mb-4">Résumé</h3>
              <div class="summary-item">
                <span class="text-body-2">Rendement viande:</span>
                <span class="text-h6 font-weight-bold">{{ meatYield }}%</span>
              </div>
              <div class="summary-item">
                <span class="text-body-2">Rendement tripes:</span>
                <span class="text-h6 font-weight-bold">{{ tripesYield }}%</span>
              </div>
              <div class="summary-item">
                <span class="text-body-2">Valeur totale:</span>
                <span class="text-h6 font-weight-bold">{{ formatCurrency(totalValue) }}</span>
              </div>
              <div class="summary-item">
                <span class="text-body-2">Boucheries:</span>
                <span class="text-h6 font-weight-bold">{{ animalData.butchers.length }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Distribution aux boucheries -->
        <v-card variant="outlined" class="distribution-card pa-6">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="text-h5 font-weight-bold d-flex align-center">
              <v-icon class="me-2" color="success">mdi-home</v-icon>
              Distribution aux Boucheries
            </h3>
            <v-chip color="success" variant="flat" size="large">
              {{ animalData.butchers.length }} boucherie(s)
            </v-chip>
          </div>

          <v-row>
            <v-col
              v-for="(butcher, index) in animalData.butchers"
              :key="index"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card variant="outlined" class="butcher-detail-card pa-4">
                <div class="d-flex align-center mb-3">
                  <v-avatar color="success" size="small" class="me-3">
                    <v-icon color="white" size="small">mdi-home</v-icon>
                  </v-avatar>
                  <h4 class="text-h6 font-weight-bold">{{ butcher.name }}</h4>
                </div>
                
                <v-card variant="tonal" color="primary" class="pa-3 mb-3 text-center">
                  <h3 class="text-h5 font-weight-bold">
                    {{ butcher.weight }} kg
                  </h3>
                  <p class="text-body-2 mb-1">{{ formatCurrency(butcher.price) }}/kg</p>
                  <p class="text-body-2 font-weight-bold mb-0">
                    Total: {{ formatCurrency(butcher.weight * butcher.price) }}
                  </p>
                </v-card>
                
                <div class="butcher-contact">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="me-2" color="info" size="small">mdi-map-marker</v-icon>
                    <span class="text-body-2">{{ butcher.address }}</span>
                  </div>
                  <div class="d-flex align-center mb-2">
                    <v-icon class="me-2" color="success" size="small">mdi-phone</v-icon>
                    <span class="text-body-2">{{ butcher.phone }}</span>
                  </div>
                  <div class="d-flex align-center">
                    <v-icon class="me-2" color="warning" size="small">mdi-city</v-icon>
                    <span class="text-body-2">{{ butcher.city }}</span>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>

        <!-- Actions -->
        <v-row class="mt-6">
          <v-col cols="12" md="6">
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-pencil"
              @click="editAnimal"
              class="modern-btn"
              block
            >
              Modifier l'abattage
            </v-btn>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn
              color="error"
              variant="elevated"
              prepend-icon="mdi-delete"
              @click="deleteAnimal"
              class="modern-btn"
              block
            >
              Supprimer l'abattage
            </v-btn>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>

<script>
import UiParentCard from '@/components/shared/UiParentCard.vue';

export default {
  components: {
    UiParentCard,
  },
  data() {
    return {
      search: '',
      headers: [
        { title: 'Poids de l\'animal (kg)', key: 'weight' },
        { title: 'Prix d\'achat (FCFA)', key: 'purchasePrice' },
        { title: 'Poids de la viande (kg)', key: 'meatWeight' },
        { title: 'Poids des tripes (kg)', key: 'tripesWeight' },
        { title: 'Boucheries', key: 'butchers', sortable: false  },
        { title: 'Détails', key: 'details', sortable: false },
      ],
      animals: [
        {
          weight: '200',
          purchasePrice: '500',
          meatWeight: '150',
          tripesWeight: '30',
          butchers: [
            { name: 'Boucherie Halal', weight: '80', price: '200', address: 'Ngaoundéré, Yoko', city: 'Ngaoundéré', postal_code: '454', phone: '(+237) 695956707' },
            { name: 'Boucherie Centrale', weight: '70', price: '175', address: 'Douala, Rue 5', city: 'Douala', postal_code: '123', phone: '(+237) 612345678' },
          ],
        },
        {
          weight: '180',
          purchasePrice: '450',
          meatWeight: '130',
          tripesWeight: '25',
          butchers: [
            { name: 'Boucherie Halal', weight: '70', price: '180', address: 'Ngaoundéré, Yoko', city: 'Ngaoundéré', postal_code: '454', phone: '(+237) 695956707' },
            { name: 'Boucherie du Marché', weight: '60', price: '150', address: 'Yaoundé, Marché Central', city: 'Yaoundé', postal_code: '789', phone: '(+237) 678901234' },
          ],
        },
        {
          weight: '220',
          purchasePrice: '550',
          meatWeight: '160',
          tripesWeight: '35',
          butchers: [
            { name: 'Boucherie Centrale', weight: '90', price: '220', address: 'Douala, Rue 5', city: 'Douala', postal_code: '123', phone: '(+237) 612345678' },
          ],
        },
        {
          weight: '190',
          purchasePrice: '480',
          meatWeight: '140',
          tripesWeight: '28',
          butchers: [
            { name: 'Boucherie Halal', weight: '75', price: '190', address: 'Ngaoundéré, Yoko', city: 'Ngaoundéré', postal_code: '454', phone: '(+237) 695956707' },
            { name: 'Boucherie du Marché', weight: '65', price: '160', address: 'Yaoundé, Marché Central', city: 'Yaoundé', postal_code: '789', phone: '(+237) 678901234' },
            { name: 'Boucherie Centrale', weight: '60', price: '150', address: 'Douala, Rue 5', city: 'Douala', postal_code: '123', phone: '(+237) 612345678' },
          ],
        },
        {
          weight: '210',
          purchasePrice: '520',
          meatWeight: '155',
          tripesWeight: '30',
          butchers: [
            { name: 'Boucherie du Marché', weight: '70', price: '175', address: 'Yaoundé, Marché Central', city: 'Yaoundé', postal_code: '789', phone: '(+237) 678901234' },
            { name: 'Boucherie Centrale', weight: '85', price: '200', address: 'Douala, Rue 5', city: 'Douala', postal_code: '123', phone: '(+237) 612345678' },
          ],
        },
      ],
      modalOpen: false,
      selectedButchers: [],
    };
  },
  methods: {
    openModal(butchers) {
      this.selectedButchers = butchers;
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
    },
    viewDetails(animal) {
      // Exemple d'action à effectuer pour voir les détails de l'animal
      console.log('Détails de l\'animal :', animal);
      // Vous pouvez implémenter ici une logique pour afficher les détails de l'animal
    },
  },
};
</script>

<style scoped>
.my-4 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.text-blue{
  color: rgb(30 136 229);
}
</style>
