<template>
  <v-container ref="scrollContainer">
    <!-- Filtres -->
    <v-row>
      <v-col cols="12" md="4" class="pa-0 pr-1 mx-0">
        <v-text-field v-model="search" label="Recherche" variant="solo" clearable @input="applyFilters"></v-text-field>
      </v-col>
      <v-col cols="12" md="4" class="pa-0 pr-1 ma-0">
        <v-autocomplete
            v-model="selectedCity"
            :items="cities"
            label="Ville"
            clearable
            variant="solo"
            @change="applyFilters"
        ></v-autocomplete>
      </v-col>
      <v-col cols="12" md="4" class="pa-0 pr-1 ma-0">
        <v-autocomplete
            v-model="selectedSpecialty"
            :items="specialties"
            label="Spécialité"
            clearable
            variant="solo"
            @change="applyFilters"
        ></v-autocomplete>
      </v-col>
    </v-row>

    <!-- Liste des boucheries filtrée et paginée -->
    <v-row>
      <v-col v-for="(item, index) in paginatedItems" :key="index" cols="12" md="6"  class="pa-1 ma-0">
        <UiParentCard :title="item.name">
<!--          <div class="mt-4"><strong><v-icon icon="mdi-home"></v-icon> Adresse :</strong> {{ item.address }}</div>-->
<!--          <v-divider class="my-3"></v-divider>-->
          <div class="mt-4"><strong><v-icon class="mr-2" icon="mdi-map"></v-icon>Ville:</strong> {{ item.city }}</div>
          <v-divider class="my-3"></v-divider>
<!--          <div><strong> <v-icon class="mr-2" icon="mdi-mailbox"></v-icon>Code postal:</strong> {{ item.postal_code }}</div>-->
<!--          <v-divider class="my-3"></v-divider>-->
          <div><strong> <v-icon class="mr-2" icon="mdi-phone"></v-icon>Téléphone:</strong> {{ item.phone }}</div>
          <v-divider class="my-3"></v-divider>
<!--          <div><strong> <v-icon class="mr-2" icon="mdi-email"></v-icon>Email:</strong> <a :href="'mailto:' + item.email">{{ item.email }}</a></div>-->
<!--          <v-divider class="my-3"></v-divider>-->
<!--          <div><strong> <v-icon class="mr-2" icon="mdi-web"></v-icon>Site web:</strong> <a :href="item.website" v-if="item.website">{{ item.website }}</a><span v-else>N/A</span></div>-->
<!--          <v-divider class="my-3"></v-divider>-->
          <div><strong> <v-icon class="mr-2" icon="mdi-clock-outline"></v-icon>Horaires:</strong> {{ item.opening_hour }} - {{ item.closing_hour }}</div>
          <v-divider class="my-3"></v-divider>
          <div><strong> <v-icon class="mr-2" icon="mdi-cow"></v-icon>Spécialités:</strong> {{ item.specialties.join(', ') }}</div>
          <div class="mt-2">
            <v-rating color="warning" x-large :half-increments="true" v-model="item.average_rating" readonly></v-rating>
            <br>
            <span class="ml-3">({{ item.review_count }} avis)</span>
          </div>
          <v-card-actions>
            <v-btn color="primary" @click="editItem(item)">Editer</v-btn>
            <v-btn color="error" @click="disableItem(item)">Désactiver</v-btn>
          </v-card-actions>
        </UiParentCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex justify-center">
        <v-pagination
            v-model="page"
            :length="pageCount"
            :total-visible="5"
            circle
            color="primary"
            @input="scrollToTop"
        ></v-pagination>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import UiParentCard from '@/components/shared/UiParentCard.vue';

export default {
  components: {
    UiParentCard,
  },
  data() {
    return {
      page: 1,
      itemsPerPage: 4,
      search: '',
      selectedCity: null,
      selectedSpecialty: null,
      items: [
        {
          name: 'Boucherie Halal',
          address: 'Ngaoundéré, Yoko',
          city: 'Ngaoundéré',
          postal_code: '454',
          phone: '(+237) 695956707',
          email: 'baoutourimaidadi@gmail.com',
          opening_hour: '07:00',
          closing_hour: '17:00',
          website: '',
          owner: 'Inno Batouri',
          specialties: ['poulet', 'mouton', 'dindon'],
          average_rating: '4',
          review_count: '50',
        },
        {
          name: 'Boucherie du Marché',
          address: 'Douala, Bonapriso',
          city: 'Douala',
          postal_code: '123',
          phone: '(+237) 673456789',
          email: 'boucheriedumarche@example.com',
          opening_hour: '08:00',
          closing_hour: '18:00',
          website: 'http://boucheriedumarche.com',
          owner: 'Jean-Pierre Dupont',
          specialties: ['boeuf', 'agneau', 'poulet'],
          average_rating: '4.5',
          review_count: '75',
        },
        {
          name: 'Boucherie Centrale',
          address: 'Yaoundé, Mvog-Mbi',
          city: 'Yaoundé',
          postal_code: '789',
          phone: '(+237) 698745632',
          email: 'centraleboucherie@example.com',
          opening_hour: '07:30',
          closing_hour: '19:00',
          website: 'http://centraleboucherie.com',
          owner: 'Marie Claire Mbida',
          specialties: ['porc', 'veau', 'poulet'],
          average_rating: '4.2',
          review_count: '60',
        },
        {
          name: 'Boucherie de la Gare',
          address: 'Bafoussam, Centre Ville',
          city: 'Bafoussam',
          postal_code: '101',
          phone: '(+237) 699876543',
          email: 'boucheriedelagare@example.com',
          opening_hour: '06:00',
          closing_hour: '17:30',
          website: '',
          owner: 'Alain Nkem',
          specialties: ['mouton', 'agneau', 'dinde'],
          average_rating: '4.0',
          review_count: '45',
        },
        {
          name: 'Boucherie Royale',
          address: 'Garoua, Marché Central',
          city: 'Garoua',
          postal_code: '202',
          phone: '(+237) 697453210',
          email: 'royaleboucherie@example.com',
          opening_hour: '07:00',
          closing_hour: '18:00',
          website: '',
          owner: 'Fatima Aboubakar',
          specialties: ['boeuf', 'poulet', 'dinde'],
          average_rating: '4.3',
          review_count: '55',
        },
        {
          name: 'Boucherie du Soleil',
          address: 'Bertoua, Essos',
          city: 'Bertoua',
          postal_code: '303',
          phone: '(+237) 696321987',
          email: 'boucheriedusoleil@example.com',
          opening_hour: '08:30',
          closing_hour: '17:00',
          website: 'http://boucheriedusoleil.com',
          owner: 'Emmanuel Koffi',
          specialties: ['poulet', 'boeuf', 'mouton'],
          average_rating: '4.1',
          review_count: '30',
        },
        {
          name: 'Boucherie des Amis',
          address: 'Ebolowa, Centre Ville',
          city: 'Ebolowa',
          postal_code: '404',
          phone: '(+237) 674839201',
          email: 'amisboucherie@example.com',
          opening_hour: '09:00',
          closing_hour: '18:30',
          website: '',
          owner: 'Pauline Ebong',
          specialties: ['dinde', 'boeuf', 'poulet'],
          average_rating: '4.4',
          review_count: '70',
        },
        {
          name: 'Boucherie Traditionnelle',
          address: 'Maroua, Domayo',
          city: 'Maroua',
          postal_code: '505',
          phone: '(+237) 675483902',
          email: 'traditionnelleboucherie@example.com',
          opening_hour: '07:00',
          closing_hour: '16:00',
          website: 'http://traditionnelleboucherie.com',
          owner: 'Mohammed Issa',
          specialties: ['mouton', 'agneau', 'boeuf'],
          average_rating: '3.9',
          review_count: '40',
        },
        {
          name: 'Boucherie Moderne',
          address: 'Kumba, Fiango',
          city: 'Kumba',
          postal_code: '606',
          phone: '(+237) 693847562',
          email: 'modernboucherie@example.com',
          opening_hour: '08:00',
          closing_hour: '17:30',
          website: 'http://modernboucherie.com',
          owner: 'Eugène Ngong',
          specialties: ['poulet', 'dinde', 'boeuf'],
          average_rating: '4.5',
          review_count: '85',
        },
        {
          name: 'Boucherie du Carrefour',
          address: 'Bamenda, Commercial Avenue',
          city: 'Bamenda',
          postal_code: '707',
          phone: '(+237) 694738291',
          email: 'carrefourboucherie@example.com',
          opening_hour: '09:00',
          closing_hour: '18:00',
          website: '',
          owner: 'Chantal Fomunyam',
          specialties: ['boeuf', 'poulet', 'porc'],
          average_rating: '4.6',
          review_count: '90',
        },
      ],
    };
  },
  computed: {
    paginatedItems() {
      const filteredItems = this.filterItems();
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filteredItems.slice(start, end);
    },
    pageCount() {
      const filteredItems = this.filterItems();
      return Math.ceil(filteredItems.length / this.itemsPerPage);
    },
    cities() {
      // Récupérer toutes les villes uniques des items
      const cities = new Set();
      this.items.forEach(item => cities.add(item.city));
      return Array.from(cities);
    },
    specialties() {
      // Récupérer toutes les spécialités uniques des items
      const specialties = new Set();
      this.items.forEach(item => {
        item.specialties.forEach(specialty => specialties.add(specialty));
      });
      return Array.from(specialties);
    },
  },
  methods: {
    editItem(item) {
      // Méthode pour éditer l'élément
      console.log('Edit item:', item);
      // Implémentez votre logique d'édition ici
    },
    disableItem(item) {
      // Méthode pour désactiver l'élément
      console.log('Disable item:', item);
      // Implémentez votre logique de désactivation ici
    },
    applyFilters() {
      // Appliquer les filtres sur la liste des items
      this.page = 1; // Réinitialiser la pagination à la première page
    },
    filterItems() {
      // Fonction pour filtrer les items en fonction des critères sélectionnés
      let filteredItems = this.items;

      // Filtre par recherche
      if (this.search) {
        const lowerCaseSearch = this.search.toLowerCase();
        filteredItems = filteredItems.filter(item =>
                                                 item.name.toLowerCase().includes(lowerCaseSearch) ||
                                                 item.owner.toLowerCase().includes(lowerCaseSearch) ||
                                                 item.city.toLowerCase().includes(lowerCaseSearch)
        );
      }

      // Filtre par ville
      if (this.selectedCity) {
        filteredItems = filteredItems.filter(item => item.city === this.selectedCity);
      }

      // Filtre par spécialité
      if (this.selectedSpecialty) {
        filteredItems = filteredItems.filter(item => item.specialties.includes(this.selectedSpecialty));
      }

      return filteredItems;
    },
    scrollToTop() {
      // Fonction pour faire remonter en haut de la liste
      this.$refs.scrollContainer.scrollTop = 0;
    },
  },
};
</script>

<style scoped>
.v-card-title {
  color: #3f51b5;
}
.v-card-subtitle {
  color: #757575;
}
.v-card-text div {
  margin-bottom: 8px;
}
.v-pagination {
  margin-top: 20px;
}
</style>
