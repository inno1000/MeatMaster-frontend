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
          <div class="mt-4"><strong><v-icon icon="mdi-home"></v-icon> Adresse :</strong> {{ item.address }}</div>
          <v-divider class="my-3"></v-divider>
          <div class="mt-4"><strong><v-icon class="mr-2" icon="mdi-map"></v-icon>Ville:</strong> {{ item.city }}</div>
          <v-divider class="my-3"></v-divider>
          <div><strong> <v-icon class="mr-2" icon="mdi-mailbox"></v-icon>Code postal:</strong> {{ item.postal_code }}</div>
          <v-divider class="my-3"></v-divider>
          <div><strong> <v-icon class="mr-2" icon="mdi-phone"></v-icon>Téléphone:</strong> {{ item.phone }}</div>
          <v-divider class="my-3"></v-divider>
          <div><strong> <v-icon class="mr-2" icon="mdi-email"></v-icon>Email:</strong> <a :href="'mailto:' + item.email">{{ item.email }}</a></div>
          <v-divider class="my-3"></v-divider>
          <div><strong> <v-icon class="mr-2" icon="mdi-web"></v-icon>Site web:</strong> <a :href="item.website" v-if="item.website">{{ item.website }}</a><span v-else>N/A</span></div>
          <v-divider class="my-3"></v-divider>
          <div><strong> <v-icon class="mr-2" icon="mdi-clock-outline"></v-icon>Horaires:</strong> {{ item.opening_hours }}</div>
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
import {fetchWrapper} from '../../utils/helpers/fetch-wrapper';
import {ref} from 'vue';

export default {
  components: {
    UiParentCard,
  },
  data() {
    const items = ref([]);
    return {
      page: 1,
      itemsPerPage: 4,
      search: '',
      selectedCity: null,
      selectedSpecialty: null,
      items
    };
  },
  mounted() {
    this.getButchers();
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
        if (Array.isArray(item.specialties)) {
        item.specialties.forEach(specialty => specialties.add(specialty));
        }
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
    async getButchers() {
      const baseUrl = `${import.meta.env.VITE_API_URL}`;
      const butchers = await fetchWrapper.get(`${baseUrl}/butchers`);
      this.items = butchers.map(butcher => {
        return {
          ...butcher,
          specialties: Array.isArray(butcher.specialties) ? butcher.specialties : butcher.specialties.split(',')
        };
      });
      console.log('liste des boucheries', this.items);
    }
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
