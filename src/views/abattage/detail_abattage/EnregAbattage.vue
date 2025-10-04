<template>
  <UiParentCard title="Enregistrement des animaux">
    <!-- Formulaire d'inscription des animaux -->
    <v-form ref="abattoirForm" v-model="isFormValid">

        <v-expansion-panels v-model="activePanel" accordion>
          <v-slide-y-transition
            class="py-0 w-100"
            tag="div"
            group
        >
            <v-expansion-panel class="mt-4" v-for="(animal, animalIndex) in animals" :key="animalIndex">
              <v-expansion-panel-title color="twitter">
                <div class="d-flex justify-space-between align-center w-100">
                  <h4>Animal {{ animalIndex + 1 }}</h4>
                  <v-btn color="error" prepend-icon="mdi-close" variant="elevated" v-if="animals.length > 1" @click.stop="removeAnimal(animalIndex)">
                    Supprimer
                  </v-btn>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row class="mt-4">
                  <v-col cols="12" md="6">
                    <v-text-field
                        v-model="animal.weight"
                        label="Poids de l'animal (kg)"
                        type="number"
                        required
                        variant="outlined"
                        @input="validateDistribution(animalIndex)"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                        v-model="animal.purchasePrice"
                        label="Prix d'achat (FCFA)"
                        type="number"
                        required
                        variant="outlined"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                        v-model="animal.meatWeight"
                        label="Poids de la viande (kg)"
                        type="number"
                        required
                        variant="outlined"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                        v-model="animal.tripesWeight"
                        label="Poids des tripes (kg)"
                        type="number"
                        required
                        variant="outlined"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="120" class="my-4">
                    <h3>Distribution de la viande aux boucheries</h3>
                  </v-col>
                </v-row>
                <v-scroll-y-transition
                    class="py-0"
                    tag="div"
                    group
                >
                  <v-row v-for="(butcher, butcherIndex) in animal.butchers" :key="butcherIndex" class="butcher-form">
                    <v-col cols="12">
                      <div class="d-flex justify-space-between align-center w-100">
                        <span>Boucherie {{ butcherIndex + 1 }}</span>
                        <v-btn color="error" prepend-icon="mdi-close" variant="elevated" v-if="animal.butchers.length > 1" @click.stop="removeButcher(animalIndex, butcherIndex)">
                          Supprimer
                        </v-btn>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-autocomplete
                          v-model="butcher.name"
                          :items="availableButcheries(animalIndex)"
                          label="Boucherie"
                          required
                          variant="outlined"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                          v-model="butcher.weight"
                          label="Poids donné (kg)"
                          type="number"
                          required
                          variant="outlined"
                          @input="validateDistribution(animalIndex)"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                          v-model="butcher.price"
                          label="Prix (FCFA)"
                          type="number"
                          required
                          variant="outlined"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-scroll-y-transition>
                <v-row>
                  <v-col cols="12">
                    <v-btn variant="elevated" color="success" prepend-icon="mdi-home" @click="addButcher(animalIndex)">Ajouter</v-btn>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-slide-y-transition>
      </v-expansion-panels>



      <v-row class="my-4">
        <v-col cols="12">
          <v-btn variant="elevated" color="success" prepend-icon="mdi-cow" @click="addAnimal">Ajouter</v-btn>
        </v-col>
      </v-row>
      <!-- Soumettre le formulaire -->
      <v-row>
        <v-col cols="12" class="text-center">
          <v-btn variant="outlined" :disabled="!isFormValid" @click="submitForm">Soumettre</v-btn>
        </v-col>
      </v-row>
    </v-form>
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
      isFormValid: false,
      activePanel: [0], // Variable to track the active panel in the expansion panel
      animals: [
        {
          weight: '',
          purchasePrice: '',
          meatWeight: '',
          tripesWeight: '',
          butchers: [{ name: '', weight: '', price: '' }], // Au moins un élément par défaut
        },
      ],
      butcheries: ['Boucherie Halal', 'Boucherie du Marché', 'Boucherie Centrale'], // Liste des boucheries disponibles
    };
  },
  methods: {
    addAnimal() {
      this.animals.push({
                          weight: '',
                          purchasePrice: '',
                          meatWeight: '',
                          tripesWeight: '',
                          butchers: [{ name: '', weight: '', price: '' }], // Au moins un élément par défaut
                        });
    },
    removeAnimal(index) {
      if (this.animals.length > 1) {
        this.animals.splice(index, 1);
      }
    },
    addButcher(animalIndex) {
      this.animals[animalIndex].butchers.push({
                                                name: '',
                                                weight: '',
                                                price: '',
                                              });
    },
    removeButcher(animalIndex, butcherIndex) {
      if (this.animals[animalIndex].butchers.length > 1) {
        this.animals[animalIndex].butchers.splice(butcherIndex, 1);
      }
    },
    availableButcheries(animalIndex) {
      const selectedButcheries = new Set(this.animals[animalIndex].butchers.map(b => b.name));
      return this.butcheries.filter(b => !selectedButcheries.has(b));
    },
    validateDistribution(animalIndex) {
      const animal = this.animals[animalIndex];
      const totalDistributedWeight = animal.butchers.reduce((total, butcher) => total + parseFloat(butcher.weight || 0), 0);
      if (totalDistributedWeight > parseFloat(animal.meatWeight || 0)) {
        alert('La quantité distribuée dépasse la quantité totale de viande de l\'animal.');
      }
    },
    submitForm() {
      if (this.$refs.abattoirForm.validate()) {
        const data = {
          animals: this.animals,
        };
        console.log('Formulaire soumis avec les données suivantes :', data);
        // Ajoutez ici la logique pour soumettre les données au serveur
      } else {
        console.log('Le formulaire est invalide.');
      }
    },
  },
};
</script>

<style scoped>
.animal-form,
.butcher-form {
  border: 1px solid black;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  position: relative;
  background: rgb(252, 249, 249);
}

.d-flex {
  display: flex;
}

.justify-space-between {
  justify-content: space-between;
}

.align-center {
  align-items: center;
}

.w-100 {
  width: 100%;
}
</style>
