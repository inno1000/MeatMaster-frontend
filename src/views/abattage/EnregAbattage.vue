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
        <v-form ref="abattoirForm" v-model="isFormValid" class="modern-form mobile-form">
          
          <!-- En-tête avec statistiques - Optimisé mobile -->
          <div class="mobile-stats mb-6">
            <v-row>
              <v-col cols="12" sm="4" class="mb-3">
                <v-card variant="outlined" class="stats-card pa-3 text-center mobile-stats-card">
                  <v-icon size="28" color="primary" class="mb-2">mdi-cow</v-icon>
                  <h3 class="text-h6 font-weight-bold">{{ animals.length }}</h3>
                  <p class="text-caption text-medium-emphasis">Animal(s)</p>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4" class="mb-3">
                <v-card variant="outlined" class="stats-card pa-3 text-center mobile-stats-card">
                  <v-icon size="28" color="success" class="mb-2">mdi-scale-balance</v-icon>
                  <h3 class="text-h6 font-weight-bold">{{ totalWeight }} kg</h3>
                  <p class="text-caption text-medium-emphasis">Poids total</p>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4" class="mb-3">
                <v-card variant="outlined" class="stats-card pa-3 text-center mobile-stats-card">
                  <v-icon size="28" color="info" class="mb-2">mdi-currency-usd</v-icon>
                  <h3 class="text-h6 font-weight-bold">{{ formatCurrency(totalValue) }}</h3>
                  <p class="text-caption text-medium-emphasis">Valeur totale</p>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Panels d'animaux - Optimisé mobile -->
          <v-expansion-panels v-model="activePanel" multiple class="modern-expansion-panels mobile-expansion-panels">
            <v-expansion-panel 
              v-for="(animal, animalIndex) in animals" 
              :key="animalIndex"
              class="modern-expansion-panel mobile-expansion-panel"
            >
              <v-expansion-panel-title class="modern-panel-title mobile-panel-title">
                <div class="d-flex justify-space-between align-center w-100 mobile-panel-header">
                  <div class="d-flex align-center mobile-panel-info">
                    <v-avatar color="primary" size="small" class="me-3">
                      <v-icon color="white">mdi-cow</v-icon>
                    </v-avatar>
                    <div class="mobile-panel-text">
                      <h4 class="text-subtitle-1 font-weight-bold">Animal {{ animalIndex + 1 }}</h4>
                      <p class="text-caption text-medium-emphasis mb-0">
                        {{ animal.weight ? `${animal.weight} kg` : 'Poids non défini' }}
                      </p>
                    </div>
                  </div>
                  <div class="d-flex align-center gap-1 mobile-panel-actions">
                    <v-chip 
                      v-if="animal.meatWeight && animal.tripesWeight"
                      :color="getDistributionStatus(animalIndex).color"
                      size="x-small"
                      variant="flat"
                      class="mobile-status-chip"
                    >
                      {{ getDistributionStatus(animalIndex).text }}
                    </v-chip>
                    <v-btn 
                      color="error" 
                      prepend-icon="mdi-close" 
                      variant="text" 
                      size="x-small"
                      v-if="animals.length > 1" 
                      @click.stop="removeAnimal(animalIndex)"
                      class="mobile-remove-btn"
                    >
                      <span class="d-none d-sm-inline">Supprimer</span>
                    </v-btn>
                  </div>
                </div>
              </v-expansion-panel-title>
              
              <v-expansion-panel-text class="modern-panel-content mobile-panel-content">
                <!-- Informations de base de l'animal - Structure simplifiée -->
                <div class="mobile-info-section mb-4">
                  <h5 class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center mobile-section-title">
                    <v-icon class="me-2" color="primary" size="small">mdi-information</v-icon>
                    Informations de base
                  </h5>
                  <v-row class="mobile-form-row">
                    <v-col cols="12" sm="6" class="pb-2">
                      <v-text-field
                        v-model="animal.weight"
                        label="Poids de l'animal"
                        type="number"
                        required
                        variant="outlined"
                        prepend-icon="mdi-scale-balance"
                        suffix="kg"
                        @input="validateDistribution(animalIndex)"
                        class="modern-form-field mobile-form-field"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" class="pb-2">
                      <v-text-field
                        v-model="animal.purchasePrice"
                        label="Prix d'achat"
                        type="number"
                        required
                        variant="outlined"
                        prepend-icon="mdi-currency-usd"
                        suffix="FCFA"
                        class="modern-form-field mobile-form-field"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" class="pb-2">
                      <v-text-field
                        v-model="animal.meatWeight"
                        label="Poids de la viande"
                        type="number"
                        required
                        variant="outlined"
                        prepend-icon="mdi-food-drumstick"
                        suffix="kg"
                        class="modern-form-field mobile-form-field"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" class="pb-2">
                      <v-text-field
                        v-model="animal.tripesWeight"
                        label="Poids des tripes"
                        type="number"
                        required
                        variant="outlined"
                        prepend-icon="mdi-food"
                        suffix="kg"
                        class="modern-form-field mobile-form-field"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </div>

                <!-- Distribution aux boucheries - Structure simplifiée -->
                <div class="mobile-distribution-section">
                  <div class="d-flex justify-space-between align-center mb-2 mobile-distribution-header">
                    <h5 class="text-subtitle-1 font-weight-bold d-flex align-center mb-0 mobile-section-title">
                      <v-icon class="me-2" color="success" size="small">mdi-home</v-icon>
                      <span class="d-none d-sm-inline">Distribution aux boucheries</span>
                      <span class="d-inline d-sm-none">Distribution</span>
                    </h5>
                    <v-btn 
                      variant="elevated" 
                      color="success" 
                      prepend-icon="mdi-plus" 
                      size="small"
                      @click="addButcher(animalIndex)"
                      class="mobile-add-btn"
                    >
                      <span class="d-none d-sm-inline">Ajouter une boucherie</span>
                      <span class="d-inline d-sm-none">Ajouter</span>
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

                  <!-- Liste des boucheries - Structure simplifiée -->
                  <v-scroll-y-transition class="py-0" tag="div" group>
                    <div
                      v-for="(butcher, butcherIndex) in animal.butchers" 
                      :key="butcherIndex" 
                      class="mobile-butcher-item mb-3"
                    >
                      <div class="d-flex justify-space-between align-center mb-2 mobile-butcher-header">
                        <div class="d-flex align-center mobile-butcher-title">
                          <v-avatar color="success" size="small" class="me-2">
                            <v-icon color="white" size="small">mdi-home</v-icon>
                          </v-avatar>
                          <h6 class="text-body-1 font-weight-bold mb-0">
                            Boucherie {{ butcherIndex + 1 }}
                          </h6>
                        </div>
                        <v-btn 
                          color="error" 
                          prepend-icon="mdi-close" 
                          variant="text" 
                          size="x-small"
                          v-if="animal.butchers.length > 1" 
                          @click.stop="removeButcher(animalIndex, butcherIndex)"
                          class="mobile-remove-butcher-btn"
                        >
                          <span class="d-none d-sm-inline">Supprimer</span>
                        </v-btn>
                      </div>
                      
                      <v-row class="mobile-butcher-form">
                        <v-col cols="12" class="pb-2">
                          <v-autocomplete
                            v-model="butcher.name"
                            :items="availableButcheries(animalIndex)"
                            label="Nom de la boucherie"
                            required
                            variant="outlined"
                            prepend-icon="mdi-home"
                            class="modern-form-field mobile-form-field"
                            :error-messages="getButcherError(animalIndex, butcherIndex)"
                            @update:model-value="validateButcherSelection(animalIndex, butcherIndex)"
                            density="compact"
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="6" class="pb-2">
                          <v-text-field
                            v-model="butcher.weight"
                            label="Poids distribué"
                            type="number"
                            required
                            variant="outlined"
                            prepend-icon="mdi-scale-balance"
                            suffix="kg"
                            @input="validateDistribution(animalIndex)"
                            class="modern-form-field mobile-form-field"
                            density="compact"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" class="pb-2">
                          <v-text-field
                            v-model="butcher.price"
                            label="Prix de vente"
                            type="number"
                            required
                            variant="outlined"
                            prepend-icon="mdi-currency-usd"
                            suffix="FCFA"
                            class="modern-form-field mobile-form-field"
                            density="compact"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </div>
                  </v-scroll-y-transition>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Actions principales - Optimisé mobile -->
          <div class="mobile-actions mt-4">
            <v-row>
              <v-col cols="12" sm="6" class="pb-2">
                <v-btn 
                  variant="elevated" 
                  color="success" 
                  prepend-icon="mdi-plus" 
                  size="large"
                  @click="addAnimal"
                  class="modern-btn mobile-action-btn"
                  block
                >
                  <span class="d-none d-sm-inline">Ajouter un animal</span>
                  <span class="d-inline d-sm-none">Ajouter animal</span>
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" class="pb-2">
                <v-btn 
                  variant="elevated" 
                  color="primary" 
                  prepend-icon="mdi-check" 
                  size="large"
                  :disabled="!isFormValid || !isDistributionValid"
                  @click="submitForm"
                  class="modern-btn mobile-action-btn"
                  block
                >
                  <span class="d-none d-sm-inline">Enregistrer l'abattage</span>
                  <span class="d-inline d-sm-none">Enregistrer</span>
                </v-btn>
              </v-col>
            </v-row>
          </div>
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

/* Responsive design - Mobile optimizations */
@media (max-width: 768px) {
  /* Réduction des marges pour mieux utiliser l'espace */
  .v-container {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
  
  .v-row {
    margin-left: -4px !important;
    margin-right: -4px !important;
  }
  
  .v-col {
    padding-left: 4px !important;
    padding-right: 4px !important;
    width: 100% !important;
    flex: 1 1 100% !important;
  }
  
  /* Mobile stats cards */
  .mobile-stats-card {
    padding: 12px !important;
    margin-bottom: 8px;
  }
  
  .mobile-stats-card .v-icon {
    font-size: 24px !important;
  }
  
  .mobile-stats-card h3 {
    font-size: 1.1rem !important;
  }
  
  .mobile-stats-card p {
    font-size: 0.75rem !important;
  }
  
  /* Mobile expansion panels */
  .mobile-expansion-panels {
    margin: 0 -4px;
  }
  
  .mobile-expansion-panel {
    margin-bottom: 8px;
    border-radius: 8px;
  }
  
  .mobile-panel-title {
    padding: 12px 16px !important;
    min-height: 60px;
  }
  
  .mobile-panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .mobile-panel-info {
    width: 100%;
  }
  
  .mobile-panel-text h4 {
    font-size: 0.9rem !important;
  }
  
  .mobile-panel-text p {
    font-size: 0.7rem !important;
  }
  
  .mobile-panel-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .mobile-status-chip {
    font-size: 0.6rem !important;
    height: 20px !important;
  }
  
  .mobile-remove-btn {
    min-width: 32px !important;
    height: 32px !important;
  }
  
  .mobile-panel-content {
    padding: 12px !important;
  }
  
  /* Mobile info sections - Structure simplifiée */
  .mobile-info-section {
    padding: 8px;
    background: rgba(var(--v-theme-surface), 0.5);
    border-radius: 8px;
    border: 1px solid rgba(var(--v-theme-outline), 0.1);
    margin-bottom: 8px;
  }
  
  .mobile-section-title {
    font-size: 0.9rem !important;
    margin-bottom: 6px !important;
    color: rgba(var(--v-theme-on-surface), 0.8);
  }
  
  .mobile-form-row .v-col {
    padding-bottom: 4px !important;
  }
  
  /* Mobile distribution sections - Structure simplifiée */
  .mobile-distribution-section {
    padding: 8px;
    background: rgba(var(--v-theme-surface), 0.3);
    border-radius: 8px;
    border: 1px solid rgba(var(--v-theme-outline), 0.1);
  }
  
  .mobile-distribution-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .mobile-distribution-header h5 {
    font-size: 0.9rem !important;
  }
  
  .mobile-add-btn {
    width: 100%;
    font-size: 0.8rem !important;
  }
  
  /* Mobile butcher items - Structure simplifiée */
  .mobile-butcher-item {
    padding: 6px;
    background: rgba(var(--v-theme-surface), 0.2);
    border-radius: 6px;
    border: 1px solid rgba(var(--v-theme-outline), 0.08);
    margin-bottom: 6px;
  }
  
  .mobile-butcher-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .mobile-butcher-title {
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
  }
  
  .mobile-butcher-header h6 {
    font-size: 0.85rem !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
    padding: 0;
  }
  
  .mobile-remove-butcher-btn {
    flex-shrink: 0;
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    padding: 0 !important;
  }
  
  .mobile-butcher-form .v-col {
    padding-bottom: 4px !important;
  }
  
  /* Mobile form fields - Largeur uniforme */
  .mobile-form-field {
    width: 100% !important;
  }
  
  .mobile-form-field .v-field {
    font-size: 0.9rem;
    width: 100% !important;
  }
  
  .mobile-form-field .v-field__input {
    width: 100% !important;
  }
  
  .mobile-form-field .v-label {
    font-size: 0.8rem;
  }
  
  /* Assurer que tous les champs de formulaire ont la même largeur */
  .v-text-field,
  .v-autocomplete {
    width: 100% !important;
  }
  
  .v-text-field .v-field,
  .v-autocomplete .v-field {
    width: 100% !important;
  }
  
  /* Mobile actions */
  .mobile-actions {
    margin-top: 16px !important;
  }
  
  .mobile-action-btn {
    height: 48px !important;
    font-size: 0.9rem !important;
    margin-bottom: 8px !important;
  }
  
  /* Mobile alerts */
  .v-alert {
    font-size: 0.8rem !important;
    padding: 8px 12px !important;
    margin-bottom: 8px !important;
  }
  
  /* Mobile general adjustments */
  .stats-card {
    margin-bottom: 8px !important;
  }
  
  .modern-btn {
    width: 100%;
    margin-bottom: 8px;
  }
  
  /* Mobile spacing */
  .mb-6 {
    margin-bottom: 16px !important;
  }
  
  .mb-4 {
    margin-bottom: 12px !important;
  }
  
  .mb-3 {
    margin-bottom: 8px !important;
  }
  
  .pa-4 {
    padding: 12px !important;
  }
  
  .pa-3 {
    padding: 8px !important;
  }
}

/* Very small screens */
@media (max-width: 480px) {
  /* Marges encore plus réduites pour très petits écrans */
  .v-container {
    padding-left: 4px !important;
    padding-right: 4px !important;
  }
  
  .v-row {
    margin-left: -2px !important;
    margin-right: -2px !important;
  }
  
  .v-col {
    padding-left: 2px !important;
    padding-right: 2px !important;
    width: 100% !important;
    flex: 1 1 100% !important;
  }
  
  .mobile-panel-title {
    padding: 6px 8px !important;
    min-height: 50px;
  }
  
  .mobile-panel-content {
    padding: 6px !important;
  }
  
  /* Structure simplifiée pour très petits écrans */
  .mobile-info-section,
  .mobile-distribution-section {
    padding: 6px !important;
    margin-bottom: 8px !important;
  }
  
  .mobile-butcher-item {
    padding: 6px !important;
    margin-bottom: 6px !important;
  }
  
  .mobile-stats-card {
    padding: 6px !important;
  }
  
  .mobile-action-btn {
    height: 44px !important;
    font-size: 0.8rem !important;
  }
  
  .mobile-section-title {
    font-size: 0.8rem !important;
  }
  
  .mobile-form-field .v-field {
    font-size: 0.85rem;
  }
  
  .mobile-form-field .v-label {
    font-size: 0.75rem;
  }
  
  /* Largeur uniforme pour très petits écrans */
  .mobile-form-field {
    width: 100% !important;
  }
  
  .v-text-field,
  .v-autocomplete {
    width: 100% !important;
  }
  
  /* Optimisation pour très petits écrans - bouton sur même ligne */
  .mobile-butcher-header h6 {
    font-size: 0.8rem !important;
  }
  
  .mobile-remove-butcher-btn {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
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

.flex-grow-1 {
  flex-grow: 1;
}

.ml-2 {
  margin-left: 8px;
}
</style>
