<script>
import UiParentCard from '@/components/shared/UiParentCard.vue';

export default {
  components: {
    UiParentCard
  },
  data() {
    return {
      items: [
        // Remplissez avec des objets { title: 'Title', subtitle: 'Subtitle' }
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'in' },
        { title: '41000', date: '25/02/2024', quantite: '120', action: 'in' },
        { title: '55000', date: '25/02/2024', quantite: '120', action: 'out' },
        { title: '50500', date: '25/02/2024', quantite: '120', action: 'out' },
        { title: '65000', date: '25/02/2024', quantite: '120', action: 'in' },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'out' },
        { title: '54000', date: '25/02/2024', quantite: '120', action: 'out' },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'in' },
        { title: '50600', date: '25/02/2024', quantite: '120', action: 'in' },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'in' },
        { title: '985000', date: '25/02/2024', quantite: '120', action: 'in' },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'out' },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'in' },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'out' },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'in' },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'out' },
        { title: '55000', date: '25/02/2024', quantite: '120', action: 'in' },
        { title: '50800', date: '25/02/2024', quantite: '120', action: 'out' }

        // Ajoutez autant d'éléments que nécessaire
      ],
      page: 1,
      itemsPerPage: 5
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.items.length / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.items.slice(start, end);
    }
  },
  methods: {
    handlePageChange() {
      this.$nextTick(() => {
        const list = this.$refs.list;
        if (list) {
          list.scrollTop = 0;
        }
      });
    }
  }
};
</script>

<template>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard title="Liste des ventes">
        <v-row>
          <v-col cols="12" md="10" offset-md="1" lg="8" offset-lg="2">
            <v-list>
              <transition-group name="fade" tag="div">
                <div v-for="(item, index) in paginatedItems" :key="index">
                  <v-list-item class="px-0">
                    <p>{{ item.date }}</p>

                    <!--                    <template v-slot:prepend>-->
                    <!--                      <v-icon icon="mdi-check-circle"></v-icon>-->
                    <!--                    </template>-->

                    <template v-slot:append>
                      <b class="text-h4 mr-4">{{ item.quantite }} Kg</b> ({{ item.title }} FCFA)
                      <h3></h3>
                    </template>
                  </v-list-item>

                  <v-divider class="mt-2" :key="'divider-' + index"></v-divider>
                </div>
              </transition-group>
            </v-list>
            <v-pagination v-model="page" :length="pageCount" :total-visible="5" @input="handlePageChange"></v-pagination>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter, .list-leave-to /* .list-leave-active dans les versions inférieures à 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}
</style>
