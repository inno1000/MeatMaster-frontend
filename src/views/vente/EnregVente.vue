<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import AudioRecorder from '@/components/shared/AudioRecorder.vue';
import { Form } from 'vee-validate';
import { useDate } from 'vuetify';
import toastMessage from '@/helpers/toast';

const page = ref({ title: 'Enregistrement de Vente' });

// Données du formulaire
const selectedDate = ref<string | null>(null);
const selectedMeatType = ref<string | null>(null);
const soldQuantity = ref<number | null>(null);
const unitPrice = ref<number | null>(null);
const totalAmount = ref<number | null>(null);
const remainingQuantity = ref<number | null>(null);
const loading = ref(false);

// Menu de date
const fromDateMenu = ref(false);
const fromDateVal = ref(null);
const minDate = "2020-01-05";

const date = useDate();

// Types de viande avec prix et stock disponibles
const meatTypes = ref([
  { name: 'Bœuf', price: 2500, availableStock: 45, unit: 'kg' },
  { name: 'Mouton', price: 3000, availableStock: 23, unit: 'kg' },
  { name: 'Chèvre', price: 2800, availableStock: 12, unit: 'kg' },
  { name: 'Poulet', price: 2000, availableStock: 67, unit: 'kg' }
]);

// Règles de validation
const generalRules = ref([
  (v: string | number | null) => !!v || 'Ce champ est requis'
]);

// Calcul automatique du montant total
const calculatedTotal = computed(() => {
  if (soldQuantity.value && unitPrice.value) {
    return soldQuantity.value * unitPrice.value;
  }
  return 0;
});

// Calcul de la quantité restante
const calculatedRemaining = computed(() => {
  if (selectedMeatType.value && soldQuantity.value) {
    const selectedMeat = meatTypes.value.find(meat => meat.name === selectedMeatType.value);
    if (selectedMeat) {
      return selectedMeat.availableStock - soldQuantity.value;
    }
  }
  return null;
});

// Mise à jour automatique des calculs
const updateCalculations = () => {
  if (selectedMeatType.value) {
    const selectedMeat = meatTypes.value.find(meat => meat.name === selectedMeatType.value);
    if (selectedMeat) {
      unitPrice.value = selectedMeat.price;
      totalAmount.value = calculatedTotal.value;
      remainingQuantity.value = calculatedRemaining.value;
    }
  }
};

// Gestion de la date
const dateChanged = computed(() => {
  if (fromDateVal.value) {
    let tempDate = date.format(fromDateVal.value, 'keyboardDate');
    const [month, day, year] = tempDate.split('/');
    selectedDate.value = `${year}-${month}-${day}`;
    fromDateMenu.value = false;
  }
});

// Vérification du stock disponible
const isStockSufficient = computed(() => {
  if (selectedMeatType.value && soldQuantity.value) {
    const selectedMeat = meatTypes.value.find(meat => meat.name === selectedMeatType.value);
    if (selectedMeat) {
      return soldQuantity.value <= selectedMeat.availableStock;
    }
  }
  return true;
});

// Soumission du formulaire
async function validate(values: any, { setErrors }: any) {
  try {
    loading.value = true;
    
    // Vérifier le stock disponible
    if (!isStockSufficient.value) {
      setErrors({ stockError: 'Quantité insuffisante en stock' });
      return;
    }
    
    const formData = {
      date: selectedDate.value,
      meatType: selectedMeatType.value,
      soldQuantity: soldQuantity.value,
      unitPrice: unitPrice.value,
      totalAmount: totalAmount.value,
      remainingQuantity: remainingQuantity.value
    };

    console.log('Données de vente:', formData);
    
    // Ici, vous feriez l'appel API pour sauvegarder
    // await api.saveSale(formData);
    
    // Simulation d'un délai
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toastMessage('Vente enregistrée avec succès!');
    
    // Réinitialiser le formulaire
    resetForm();
    
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    setErrors({ apiError: 'Erreur lors de l\'enregistrement de la vente' });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  selectedDate.value = null;
  selectedMeatType.value = null;
  soldQuantity.value = null;
  unitPrice.value = null;
  totalAmount.value = null;
  remainingQuantity.value = null;
  fromDateVal.value = null;
}

// Charger les données de stock (simulation)
onMounted(() => {
  // Ici, vous feriez un appel API pour récupérer les stocks actuels
  // loadCurrentStocks();
});

function loadCurrentStocks() {
  // Simulation de données de stock
  // En réalité, vous feriez un appel API
  console.log('Chargement des stocks actuels...');
}
</script>

<template>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard 
        :title="page.title"
        subtitle="Enregistrez une nouvelle vente de viande"
        icon="mdi-cash-register"
        color="success"
      >
        <v-row class="mt-4">
          <v-col cols="12" md="8" offset-md="2" lg="6" offset-lg="3">
            <Form @submit="validate" class="saleForm modern-form" v-slot="{ errors, isSubmitting }">
              <!-- Date de vente -->
              <div class="modern-form-field mb-4">
                <v-menu
                  v-model="fromDateMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      label="Date de vente"
                      readonly
                      prepend-icon="mdi-calendar-clock"
                      variant="outlined"
                      v-model="selectedDate"
                      :rules="generalRules"
                      color="primary"
                      v-bind="props"
                      class="modern-form-field"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    locale="fr-fr"
                    v-model="fromDateVal"
                    no-title
                    @input="dateChanged"
                    :min="minDate"
                  ></v-date-picker>
                </v-menu>
              </div>

              <!-- Type de viande avec stock disponible -->
              <div class="modern-form-field mb-4">
                <v-select
                  v-model="selectedMeatType"
                  clearable
                  density="comfortable"
                  label="Type de viande"
                  :items="meatTypes"
                  item-title="name"
                  item-value="name"
                  :rules="generalRules"
                  variant="outlined"
                  prepend-icon="mdi-cow"
                  @update:model-value="updateCalculations"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-icon>mdi-cow</v-icon>
                      </template>
                      <v-list-item-subtitle>
                        {{ item.raw.name }} - Stock: {{ item.raw.availableStock }}kg | Prix: {{ item.raw.price.toLocaleString() }} FCFA/kg
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                    {{ item.raw.name }}
                  </template>
                </v-select>
              </div>

              <!-- Affichage du stock disponible -->
              <v-alert
                v-if="selectedMeatType"
                type="info"
                variant="tonal"
                class="mb-4 modern-alert"
                prepend-icon="mdi-package-variant"
              >
                Stock disponible : <strong>{{ meatTypes.find(m => m.name === selectedMeatType)?.availableStock }} kg</strong>
              </v-alert>

              <!-- Quantité vendue -->
              <div class="modern-form-field mb-4">
                <v-text-field
                  v-model.number="soldQuantity"
                  variant="outlined"
                  color="primary"
                  label="Quantité vendue"
                  type="number"
                  :rules="generalRules"
                  step="0.1"
                  min="0.1"
                  :max="selectedMeatType ? meatTypes.find(m => m.name === selectedMeatType)?.availableStock : undefined"
                  suffix="kg"
                  prepend-icon="mdi-scale-balance"
                  @input="updateCalculations"
                ></v-text-field>
              </div>

              <!-- Alerte de stock insuffisant -->
              <v-alert
                v-if="!isStockSufficient"
                type="error"
                variant="tonal"
                class="mb-4 modern-alert"
                prepend-icon="mdi-alert-circle"
              >
                Quantité insuffisante en stock !
              </v-alert>

              <!-- Prix unitaire -->
              <div class="modern-form-field mb-4">
                <v-text-field
                  v-model.number="unitPrice"
                  variant="outlined"
                  color="primary"
                  label="Prix unitaire"
                  type="number"
                  :rules="generalRules"
                  step="100"
                  min="0"
                  suffix="FCFA/kg"
                  prepend-icon="mdi-currency-usd"
                  @input="updateCalculations"
                ></v-text-field>
              </div>

              <!-- Montant total calculé automatiquement -->
              <v-alert
                v-if="calculatedTotal > 0"
                type="success"
                variant="tonal"
                class="mb-4 modern-alert"
                prepend-icon="mdi-calculator"
              >
                Montant total : <strong>{{ calculatedTotal.toLocaleString() }} FCFA</strong>
              </v-alert>

              <!-- Montant total (modifiable) -->
              <div class="modern-form-field mb-4">
                <v-text-field
                  v-model.number="totalAmount"
                  variant="outlined"
                  color="primary"
                  label="Montant total"
                  type="number"
                  :rules="generalRules"
                  step="100"
                  min="0"
                  suffix="FCFA"
                  prepend-icon="mdi-cash-multiple"
                ></v-text-field>
              </div>

              <!-- Quantité restante calculée -->
              <v-alert
                v-if="calculatedRemaining !== null"
                type="warning"
                variant="tonal"
                class="mb-4 modern-alert"
                prepend-icon="mdi-package-variant-minus"
              >
                Quantité restante après vente : <strong>{{ calculatedRemaining }} kg</strong>
              </v-alert>

              <!-- Quantité restante (saisie manuelle) -->
              <div class="modern-form-field mb-4">
                <v-text-field
                  v-model.number="remainingQuantity"
                  variant="outlined"
                  color="primary"
                  label="Quantité restante (vérification)"
                  type="number"
                  :rules="generalRules"
                  step="0.1"
                  min="0"
                  suffix="kg"
                  prepend-icon="mdi-package-variant-minus"
                ></v-text-field>
              </div>

              <!-- Enregistrement vocal -->
              <v-divider class="mb-4"></v-divider>
              <div class="mb-4">
                <h4 class="text-h6 mb-2">Message vocal (optionnel)</h4>
                <p class="text-body-2 text-medium-emphasis mb-3">
                  Enregistrez un message vocal pour accompagner cette vente
                </p>
                <AudioRecorder />
              </div>

              <!-- Bouton d'enregistrement -->
              <v-btn 
                color="success" 
                :loading="isSubmitting || loading" 
                class="mt-2 modern-btn" 
                variant="elevated" 
                size="large" 
                block
                type="submit"
                :disabled="!isStockSufficient"
              >
                <v-icon class="me-2">mdi-cash-register</v-icon>
                Enregistrer la vente
              </v-btn>

              <!-- Messages d'erreur -->
              <div v-if="errors.stockError" class="mt-4">
                <v-alert color="error" variant="tonal" class="modern-alert">
                  <v-icon class="me-2">mdi-alert-circle</v-icon>
                  {{ errors.stockError }}
                </v-alert>
              </div>
              
              <div v-if="errors.apiError" class="mt-4">
                <v-alert color="error" variant="tonal" class="modern-alert">
                  <v-icon class="me-2">mdi-alert-circle</v-icon>
                  {{ errors.apiError }}
                </v-alert>
              </div>
            </Form>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
