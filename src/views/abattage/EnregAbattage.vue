<template>
  <v-row>
    <v-col cols="12">
      <UiParentCard 
        title="Enregistrement des Animaux"
        subtitle="Gérez l'abattage et la distribution de viande aux boucheries"
        icon="mdi-cow"
        color="primary"
      >
        <!-- Formulaire d'inscription des animaux -->
        <v-form ref="abattoirForm" v-model="isFormValid" class="modern-form">
          
          <!-- En-tête avec statistiques -->
          <v-row class="mb-6">
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="stats-card pa-4 text-center">
                <v-icon size="32" color="primary" class="mb-2">mdi-cow</v-icon>
                <h3 class="text-h5 font-weight-bold">{{ animals.length }}</h3>
                <p class="text-body-2 text-medium-emphasis">Animal(s) enregistré(s)</p>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="stats-card pa-4 text-center">
                <v-icon size="32" color="success" class="mb-2">mdi-scale-balance</v-icon>
                <h3 class="text-h5 font-weight-bold">{{ totalWeight }} kg</h3>
                <p class="text-body-2 text-medium-emphasis">Poids total</p>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="stats-card pa-4 text-center">
                <v-icon size="32" color="info" class="mb-2">mdi-currency-usd</v-icon>
                <h3 class="text-h5 font-weight-bold">{{ formatCurrency(totalValue) }}</h3>
                <p class="text-body-2 text-medium-emphasis">Valeur totale</p>
              </v-card>
            </v-col>
          </v-row>

          <!-- Panels d'animaux -->
          <v-expansion-panels v-model="activePanel" multiple class="modern-expansion-panels">
            <v-expansion-panel 
              v-for="(animal, animalIndex) in animals" 
              :key="animalIndex"
              class="modern-expansion-panel"
            >
              <v-expansion-panel-title class="modern-panel-title">
                <div class="d-flex justify-space-between align-center w-100">
                  <div class="d-flex align-center">
                    <v-avatar color="primary" size="small" class="me-3">
                      <v-icon color="white">mdi-cow</v-icon>
                    </v-avatar>
                    <div>
                      <h4 class="text-h6 font-weight-bold">Animal {{ animalIndex + 1 }}</h4>
                      <p class="text-body-2 text-medium-emphasis mb-0">
                        {{ animal.weight ? `${animal.weight} kg` : 'Poids non défini' }}
                      </p>
                    </div>
                  </div>
                  <div class="d-flex align-center gap-2">
                    <v-chip 
                      v-if="animal.meatWeight && animal.tripesWeight"
                      :color="getDistributionStatus(animalIndex).color"
                      size="small"
                      variant="flat"
                    >
                      {{ getDistributionStatus(animalIndex).text }}
                    </v-chip>
                    <v-btn 
                      color="error" 
                      prepend-icon="mdi-close" 
                      variant="text" 
                      size="small"
                      v-if="animals.length > 1" 
                      @click.stop="removeAnimal(animalIndex)"
                    >
                      Supprimer
                    </v-btn>
                  </div>
                </div>
              </v-expansion-panel-title>
              
              <v-expansion-panel-text class="modern-panel-content">
                <!-- Informations de base de l'animal -->
                <v-card variant="outlined" class="mb-6 pa-4">
                  <h5 class="text-h6 font-weight-bold mb-4 d-flex align-center">
                    <v-icon class="me-2" color="primary">mdi-information</v-icon>
                    Informations de base
                  </h5>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="animal.weight"
                        label="Poids de l'animal"
                        type="number"
                        required
                        variant="outlined"
                        prepend-icon="mdi-scale-balance"
                        suffix="kg"
                        @input="validateDistribution(animalIndex)"
                        class="modern-form-field"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="animal.purchasePrice"
                        label="Prix d'achat"
                        type="number"
                        required
                        variant="outlined"
                        prepend-icon="mdi-currency-usd"
                        suffix="FCFA"
                        class="modern-form-field"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="animal.meatWeight"
                        label="Poids de la viande"
                        type="number"
                        required
                        variant="outlined"
                        prepend-icon="mdi-food-drumstick"
                        suffix="kg"
                        class="modern-form-field"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="animal.tripesWeight"
                        label="Poids des tripes"
                        type="number"
                        required
                        variant="outlined"
                        prepend-icon="mdi-food"
                        suffix="kg"
                        class="modern-form-field"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card>

                <!-- Distribution aux boucheries -->
                <v-card variant="outlined" class="pa-4">
                  <div class="d-flex justify-space-between align-center mb-4">
                    <h5 class="text-h6 font-weight-bold d-flex align-center mb-0">
                      <v-icon class="me-2" color="success">mdi-home</v-icon>
                      Distribution aux boucheries
                    </h5>
                    <v-btn 
                      variant="elevated" 
                      color="success" 
                      prepend-icon="mdi-plus" 
                      size="small"
                      @click="addButcher(animalIndex)"
                    >
                      Ajouter une boucherie
                    </v-btn>
                  </div>

                  <!-- Alerte de validation -->
                  <v-alert
                    v-if="getDistributionStatus(animalIndex).type === 'warning'"
                    type="warning"
                    variant="tonal"
                    class="mb-4"
                    prepend-icon="mdi-alert"
                  >
                    {{ getDistributionStatus(animalIndex).message }}
                  </v-alert>

                  <v-alert
                    v-if="getDistributionStatus(animalIndex).type === 'error'"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                    prepend-icon="mdi-alert-circle"
                  >
                    {{ getDistributionStatus(animalIndex).message }}
                  </v-alert>

                  <v-alert
                    v-if="hasDuplicateButcheries(animalIndex)"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                    prepend-icon="mdi-alert-circle"
                  >
                    Une ou plusieurs boucheries sont sélectionnées plusieurs fois pour cet animal. Veuillez corriger cela avant de continuer.
                  </v-alert>

                  <!-- Liste des boucheries -->
                  <v-scroll-y-transition class="py-0" tag="div" group>
                    <v-card
                      v-for="(butcher, butcherIndex) in animal.butchers" 
                      :key="butcherIndex" 
                      variant="outlined"
                      class="butcher-card mb-4"
                    >
                      <v-card-text class="pa-4">
                        <div class="d-flex justify-space-between align-center mb-4">
                          <div class="d-flex align-center">
                            <v-avatar color="success" size="small" class="me-3">
                              <v-icon color="white" size="small">mdi-home</v-icon>
                            </v-avatar>
                            <h6 class="text-subtitle-1 font-weight-bold mb-0">
                              Boucherie {{ butcherIndex + 1 }}
                            </h6>
                          </div>
                          <v-btn 
                            color="error" 
                            prepend-icon="mdi-close" 
                            variant="text" 
                            size="small"
                            v-if="animal.butchers.length > 1" 
                            @click.stop="removeButcher(animalIndex, butcherIndex)"
                          >
                            Supprimer
                          </v-btn>
                        </div>
                        
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-autocomplete
                              v-model="butcher.name"
                              :items="availableButcheries(animalIndex)"
                              label="Nom de la boucherie"
                              required
                              variant="outlined"
                              prepend-icon="mdi-home"
                              class="modern-form-field"
                              :error-messages="getButcherError(animalIndex, butcherIndex)"
                              @update:model-value="validateButcherSelection(animalIndex, butcherIndex)"
                            ></v-autocomplete>
                          </v-col>
                          <v-col cols="12" md="3">
                            <v-text-field
                              v-model="butcher.weight"
                              label="Poids distribué"
                              type="number"
                              required
                              variant="outlined"
                              prepend-icon="mdi-scale-balance"
                              suffix="kg"
                              @input="validateDistribution(animalIndex)"
                              class="modern-form-field"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="3">
                            <v-text-field
                              v-model="butcher.price"
                              label="Prix de vente"
                              type="number"
                              required
                              variant="outlined"
                              prepend-icon="mdi-currency-usd"
                              suffix="FCFA"
                              class="modern-form-field"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-scroll-y-transition>
                </v-card>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Actions principales -->
          <v-row class="mt-6">
            <v-col cols="12" md="6">
              <v-btn 
                variant="elevated" 
                color="success" 
                prepend-icon="mdi-plus" 
                size="large"
                @click="addAnimal"
                class="modern-btn"
                block
              >
                Ajouter un animal
              </v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <v-btn 
                variant="elevated" 
                color="primary" 
                prepend-icon="mdi-check" 
                size="large"
                :disabled="!isFormValid || !isDistributionValid"
                @click="submitForm"
                class="modern-btn"
                block
              >
                Enregistrer l'abattage
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </UiParentCard>
    </v-col>
  </v-row>
</template>

<script>
import UiParentCard from '@/components/shared/UiParentCard.vue';
import toastMessage from '@/helpers/toast';

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
      butcheries: [
        'Boucherie Halal', 
        'Boucherie du Marché', 
        'Boucherie Centrale',
        'Boucherie du Centre',
        'Boucherie Premium',
        'Boucherie Express'
      ], // Liste des boucheries disponibles
    };
  },
  computed: {
    totalWeight() {
      return this.animals.reduce((total, animal) => {
        return total + parseFloat(animal.weight || 0);
      }, 0).toFixed(1);
    },
    totalValue() {
      return this.animals.reduce((total, animal) => {
        return total + parseFloat(animal.purchasePrice || 0);
      }, 0);
    },
    isDistributionValid() {
      return this.animals.every(animal => {
        const totalDistributed = animal.butchers.reduce((sum, butcher) => 
          sum + parseFloat(butcher.weight || 0), 0
        );
        const meatWeight = parseFloat(animal.meatWeight || 0);
        
        // Vérifier qu'il n'y a pas de doublons de boucheries
        const butcherNames = animal.butchers.map(b => b.name).filter(name => name && name.trim() !== '');
        const uniqueButcherNames = new Set(butcherNames);
        const hasDuplicates = butcherNames.length !== uniqueButcherNames.size;
        
        return meatWeight > 0 && totalDistributed <= meatWeight && !hasDuplicates;
      });
    }
  },
  methods: {
    addAnimal() {
      this.animals.push({
        weight: '',
        purchasePrice: '',
        meatWeight: '',
        tripesWeight: '',
        butchers: [{ name: '', weight: '', price: '' }],
      });
      // Ouvrir automatiquement le nouveau panel
      this.activePanel.push(this.animals.length - 1);
    },
    removeAnimal(index) {
      if (this.animals.length > 1) {
        this.animals.splice(index, 1);
        // Ajuster les panels ouverts
        this.activePanel = this.activePanel.filter(panel => panel !== index);
        this.activePanel = this.activePanel.map(panel => panel > index ? panel - 1 : panel);
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
      const selectedButcheries = new Set(this.animals[animalIndex].butchers.map(b => b.name).filter(name => name && name.trim() !== ''));
      return this.butcheries.filter(b => !selectedButcheries.has(b));
    },
    getDistributionStatus(animalIndex) {
      const animal = this.animals[animalIndex];
      const meatWeight = parseFloat(animal.meatWeight || 0);
      const totalDistributed = animal.butchers.reduce((sum, butcher) => 
        sum + parseFloat(butcher.weight || 0), 0
      );
      
      if (meatWeight === 0) {
        return {
          type: 'info',
          color: 'grey',
          text: 'Poids non défini',
          message: 'Veuillez définir le poids de la viande'
        };
      }
      
      if (totalDistributed > meatWeight) {
        return {
          type: 'error',
          color: 'error',
          text: 'Sur-distribution',
          message: `La quantité distribuée (${totalDistributed}kg) dépasse le poids de viande disponible (${meatWeight}kg)`
        };
      }
      
      if (totalDistributed === meatWeight) {
        return {
          type: 'success',
          color: 'success',
          text: 'Distribution complète',
          message: 'Toute la viande a été distribuée'
        };
      }
      
      if (totalDistributed > 0) {
        return {
          type: 'warning',
          color: 'warning',
          text: 'Distribution partielle',
          message: `Il reste ${(meatWeight - totalDistributed).toFixed(1)}kg à distribuer`
        };
      }
      
      return {
        type: 'info',
        color: 'grey',
        text: 'Aucune distribution',
        message: 'Aucune viande n\'a encore été distribuée'
      };
    },
    validateDistribution(animalIndex) {
      const status = this.getDistributionStatus(animalIndex);
      if (status.type === 'error') {
        toastMessage(status.message, 'error');
      }
    },
    validateButcherSelection(animalIndex, butcherIndex) {
      const animal = this.animals[animalIndex];
      const currentButcher = animal.butchers[butcherIndex];
      
      if (!currentButcher.name) return;
      
      // Vérifier s'il y a des doublons
      const duplicateButchers = animal.butchers.filter((butcher, index) => 
        butcher.name === currentButcher.name && index !== butcherIndex
      );
      
      if (duplicateButchers.length > 0) {
        toastMessage(`La boucherie "${currentButcher.name}" est déjà sélectionnée pour cet animal`, 'error');
        // Réinitialiser la sélection
        currentButcher.name = '';
      }
    },
    getButcherError(animalIndex, butcherIndex) {
      const animal = this.animals[animalIndex];
      const currentButcher = animal.butchers[butcherIndex];
      
      if (!currentButcher.name) return '';
      
      // Vérifier s'il y a des doublons
      const duplicateButchers = animal.butchers.filter((butcher, index) => 
        butcher.name === currentButcher.name && index !== butcherIndex
      );
      
      if (duplicateButchers.length > 0) {
        return 'Cette boucherie est déjà sélectionnée pour cet animal';
      }
      
      return '';
    },
    hasDuplicateButcheries(animalIndex) {
      const animal = this.animals[animalIndex];
      const butcherNames = animal.butchers.map(b => b.name).filter(name => name && name.trim() !== '');
      const uniqueButcherNames = new Set(butcherNames);
      return butcherNames.length !== uniqueButcherNames.size;
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
      }).format(value);
    },
    async submitForm() {
      if (this.$refs.abattoirForm.validate()) {
        if (!this.isDistributionValid) {
          toastMessage('Veuillez corriger les erreurs de distribution avant de soumettre', 'error');
          return;
        }
        
        try {
          const data = {
            animals: this.animals,
            totalWeight: this.totalWeight,
            totalValue: this.totalValue,
            timestamp: new Date().toISOString()
          };
          
          console.log('Formulaire soumis avec les données suivantes :', data);
          
          // Simulation d'un appel API
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          toastMessage('Abattage enregistré avec succès!', 'success');
          
          // Réinitialiser le formulaire
          this.resetForm();
          
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement:', error);
          toastMessage('Erreur lors de l\'enregistrement de l\'abattage', 'error');
        }
      } else {
        toastMessage('Veuillez remplir tous les champs obligatoires', 'error');
      }
    },
    resetForm() {
      this.animals = [{
        weight: '',
        purchasePrice: '',
        meatWeight: '',
        tripesWeight: '',
        butchers: [{ name: '', weight: '', price: '' }],
      }];
      this.activePanel = [0];
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

/* Styles pour les panels d'expansion */
.modern-expansion-panels {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-expansion-panel {
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(var(--v-theme-outline), 0.08);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-expansion-panel:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.modern-panel-title {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-primary), 0.02));
  border-radius: 12px 12px 0 0;
  padding: 16px 20px;
  transition: all 0.3s ease;
}

.modern-panel-title:hover {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-primary), 0.04));
}

.modern-panel-content {
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0 0 12px 12px;
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
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--v-theme-success), 0.3);
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

/* Styles pour les champs de formulaire */
.modern-form-field {
  transition: all 0.3s ease;
}

.modern-form-field .v-field {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-form-field .v-field:hover {
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.1);
  transform: translateY(-1px);
}

.modern-form-field .v-field--focused {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
  transform: translateY(-2px);
}

/* Animations */
.fade-in {
  animation: fadeIn 0.6s ease-out;
}

.slide-up {
  animation: slideUp 0.6s ease-out;
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

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .modern-expansion-panel {
    margin-bottom: 12px;
  }
  
  .modern-panel-title {
    padding: 12px 16px;
  }
  
  .modern-panel-content {
    padding: 16px;
  }
  
  .stats-card {
    margin-bottom: 12px;
  }
  
  .modern-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}

/* Utilitaires */
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

.gap-2 {
  gap: 8px;
}
</style>
