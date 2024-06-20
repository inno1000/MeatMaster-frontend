<template>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard title="Liste des versements">
        <v-row>
          <v-col cols="12" md="10" offset-md="1" lg="8" offset-lg="2">
            <v-list>
              <transition-group name="fade" tag="div">
                <div v-for="(item, index) in paginatedItems" :key="index">
                  <v-list-item
                      class="px-0"
                      @click="showDialog(item)"
                  >
                    <p>
                      {{ item.date }}
                    </p>

                    <template v-slot:append>
                      <b class="text-h4 mx-2">{{ item.quantite }} Kg</b>({{ item.title }} FCFA)
                      <v-icon v-if="item.state === 1" color="success" icon="mdi-check-circle ml-4"></v-icon>
                      <v-icon v-else-if="item.state === -1" color="error" icon="mdi-close-circle ml-4"></v-icon>
                      <v-icon v-else color="warning" icon="mdi-alert-circle ml-4"></v-icon>
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
        <DetailModal :selectedElement="selectedElement" ref="DetailModal"></DetailModal>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
<script>
import UiParentCard from '@/components/shared/UiParentCard.vue';
import DetailModal from '@/components/shared/DetailModal.vue';
import { ref } from 'vue';

export default {
  components: {
    UiParentCard,
    DetailModal
  },
  data() {
    const selectedElement = ref(null)
    return {
      items: [
        // Remplissez avec des objets { title: 'Title', subtitle: 'Subtitle' }
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'in', state:0 },
        { title: '41000', date: '25/02/2024', quantite: '120', action: 'in', state:1 },
        { title: '55000', date: '25/02/2024', quantite: '120', action: 'out' , state:-1 },
        { title: '50500', date: '25/02/2024', quantite: '120', action: 'out', state:1 },
        { title: '65000', date: '25/02/2024', quantite: '120', action: 'in' , state:0 },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'out' , state:-1 },
        { title: '54000', date: '25/02/2024', quantite: '120', action: 'out', state:-1 },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'in' , state:1 },
        { title: '50600', date: '25/02/2024', quantite: '120', action: 'in' , state:0 },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'in' , state:-1},
        { title: '985000', date: '25/02/2024', quantite: '120', action: 'in' , state:0 },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'out' , state:1 },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'in', state:0 },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'out', state:1 },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'in', state:1 },
        { title: '5000', date: '25/02/2024', quantite: '120', action: 'out' , state:-1 },
        { title: '55000', date: '25/02/2024', quantite: '120', action: 'in', state:1},
        { title: '50800', date: '25/02/2024', quantite: '120', action: 'out', state:0 },

        // Ajoutez autant d'éléments que nécessaire
      ],
      page: 1,
      itemsPerPage: 10,
      selectedElement,
      dialogVisible: false
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
    },
    showDialog(item) {
      this.selectedElement = {montant:item.title,quantite:item.quantite,date:item.date,state:item.state};
    }
  }
};
</script>
<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter, .list-leave-to /* .list-leave-active dans les versions inférieures à 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

.v-list-item__spacer{
  width: 10px !important;
}
</style>
