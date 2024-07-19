<template>
  <UiParentCard title="Liste des animaux enregistrés">
    <v-text-field
        v-model="search"
        label="Rechercher"
        variant="outlined"
        clearable
        class="my-4 w-33"

    ></v-text-field>

    <v-data-table
        :items="animals"
        :search="search"
        :headers="headers"
        :items-per-page="5"
    >
      <template v-slot:item.butchers="{ item }">
        <v-btn
          color="primary"
          text
          @click="openModal(item.butchers)"
        >
          Voir boucheries
        </v-btn>
      </template>

      <!-- Nouvelle colonne pour les détails de l'animal -->
      <template v-slot:item.details="{ item }">
        <v-btn
          color="primary"
          text
          @click="viewDetails(item)"
        >
          Voir détails
        </v-btn>
      </template>
    </v-data-table>

    <!-- Modale pour afficher les boucheries -->
    <v-dialog v-model="modalOpen" max-width="800">
      <v-card>
        <v-card-title>
          <div class="d-flex justify-space-between align-center w-100">
            Boucheries
            <v-spacer></v-spacer>
            <v-btn color="error" icon @click="closeModal">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-row>
            <v-col
              v-for="(butcher, index) in selectedButchers"
              :key="index"
              cols="12"
              md="6"
            >
              <v-card class="mb-4">
                <v-card-title><h4 class="text-blue">{{ butcher.name }}</h4></v-card-title>
<!--                <v-card-subtitle>{{ butcher.weight }} kg à {{ butcher.price }} FCFA</v-card-subtitle>-->
                <v-card-text>
                  <div class="rounded bg-primary text-center py-4">
                    <h3>
                      {{ butcher.weight }} kg à {{ butcher.price }} FCFA

                    </h3>
                  </div>
                  <div class="my-4"><strong>Adresse:</strong> {{ butcher.address }}</div>
                  <div><strong>Téléphone:</strong> {{ butcher.phone }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="closeModal">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </UiParentCard>
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
