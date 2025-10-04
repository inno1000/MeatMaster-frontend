<script setup lang="ts">
import { ref, computed } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import AudioRecorder from '@/components/shared/AudioRecorder.vue';
import { Form } from 'vee-validate';
import { useDate } from 'vuetify';
import toastMessage from '@/helpers/toast';

const page = ref({ title: 'Réception de Viande' });

// Données du formulaire
const selectedDate = ref<string | null>(null);
const selectedMeatType = ref<string | null>(null);
const receivedQuantity = ref<number | null>(null);
const correspondingAmount = ref<number | null>(null);
const deliveryNote = ref<File | null>(null);
const loading = ref(false);

// Menu de date
const fromDateMenu = ref(false);
const fromDateVal = ref(null);
const minDate = "2020-01-05";

const date = useDate();

// Types de viande avec prix par défaut
const meatTypes = ref([
  { name: 'Bœuf', price: 2500, unit: 'kg' },
  { name: 'Mouton', price: 3000, unit: 'kg' },
  { name: 'Chèvre', price: 2800, unit: 'kg' },
  { name: 'Poulet', price: 2000, unit: 'kg' }
]);

// Règles de validation
const generalRules = ref([
  (v: string | number | null) => !!v || 'Ce champ est requis'
]);

// Calcul automatique du montant
const calculatedAmount = computed(() => {
  if (selectedMeatType.value && receivedQuantity.value) {
    const selectedMeat = meatTypes.value.find(meat => meat.name === selectedMeatType.value);
    if (selectedMeat) {
      return receivedQuantity.value * selectedMeat.price;
    }
  }
  return 0;
});

// Mise à jour automatique du montant
const updateAmount = () => {
  if (calculatedAmount.value > 0) {
    correspondingAmount.value = calculatedAmount.value;
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

// Soumission du formulaire
async function validate(values: any, { setErrors }: any) {
  try {
    loading.value = true;
    
    const formData = {
      date: selectedDate.value,
      meatType: selectedMeatType.value,
      quantity: receivedQuantity.value,
      amount: correspondingAmount.value,
      deliveryNote: deliveryNote.value,
      calculatedAmount: calculatedAmount.value
    };

    console.log('Données de réception:', formData);
    
    // Ici, vous feriez l'appel API pour sauvegarder
    // await api.saveReception(formData);
    
    // Simulation d'un délai
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toastMessage('Réception enregistrée avec succès!');
    
    // Réinitialiser le formulaire
    resetForm();
    
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    setErrors({ apiError: 'Erreur lors de l\'enregistrement de la réception' });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  selectedDate.value = null;
  selectedMeatType.value = null;
  receivedQuantity.value = null;
  correspondingAmount.value = null;
  deliveryNote.value = null;
  fromDateVal.value = null;
}

// Gestion de l'upload de fichier
function handleFileUpload(file: File) {
  if (file) {
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toastMessage('Veuillez sélectionner une image (JPEG, PNG)', 'error');
      return;
    }
    
    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toastMessage('Le fichier est trop volumineux (max 5MB)', 'error');
      return;
    }
    
    deliveryNote.value = file;
    toastMessage('Bordereau de livraison téléchargé avec succès');
  }
}
</script>

<template>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard 
        :title="page.title"
        subtitle="Enregistrez une nouvelle réception de viande"
        icon="mdi-truck-delivery"
        color="primary"
      >
        <v-row class="mt-4">
          <v-col cols="12" md="8" offset-md="2" lg="6" offset-lg="3">
            <Form @submit="validate" class="receptionForm modern-form" v-slot="{ errors, isSubmitting }">
              <!-- Date de réception -->
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
                      label="Date de réception"
                      readonly
                      prepend-icon="mdi-calendar-clock"
                      variant="outlined"
                      v-model="selectedDate"
                      :rules="generalRules"
                      color="primary"
                      v-bind="props"
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

              <!-- Type de viande -->
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
                class="mb-4"
                @update:model-value="updateAmount"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon>mdi-cow</v-icon>
                    </template>
                    <v-list-item-subtitle>{{ item.raw.name }} - {{ item.raw.price.toLocaleString() }} FCFA/kg</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>

              <!-- Quantité reçue -->
              <v-text-field
                v-model.number="receivedQuantity"
                variant="outlined"
                color="primary"
                label="Quantité reçue"
                type="number"
                :rules="generalRules"
                step="0.1"
                min="0.1"
                suffix="kg"
                prepend-icon="mdi-scale-balance"
                class="mb-4"
                @input="updateAmount"
              ></v-text-field>

              <!-- Montant calculé automatiquement -->
              <v-alert
                v-if="calculatedAmount > 0"
                type="info"
                variant="tonal"
                class="mb-4"
                prepend-icon="mdi-calculator"
              >
                Montant calculé automatiquement : <strong>{{ calculatedAmount.toLocaleString() }} FCFA</strong>
              </v-alert>

              <!-- Montant correspondant -->
              <v-text-field
                v-model.number="correspondingAmount"
                variant="outlined"
                color="primary"
                label="Montant correspondant"
                type="number"
                :rules="generalRules"
                step="100"
                min="0"
                suffix="FCFA"
                prepend-icon="mdi-currency-usd"
                class="mb-4"
              ></v-text-field>

              <!-- Upload du bordereau de livraison -->
              <v-file-input
                clearable
                label="Bordereau de livraison (optionnel)"
                variant="outlined"
                color="primary"
                class="mb-4"
                show-size
                accept="image/*"
                prepend-icon="mdi-camera"
                @change="handleFileUpload"
                :model-value="deliveryNote"
              >
                <template v-slot:prepend-inner>
                  <v-icon>mdi-camera</v-icon>
                </template>
              </v-file-input>

              <!-- Aperçu de l'image -->
              <v-card
                v-if="deliveryNote"
                variant="outlined"
                class="mb-4"
              >
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="me-2" color="success">mdi-check-circle</v-icon>
                    <span class="text-body-2">{{ deliveryNote.name }}</span>
                    <v-spacer></v-spacer>
                    <v-btn
                      icon="mdi-close"
                      size="small"
                      variant="text"
                      @click="deliveryNote = null"
                    ></v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Enregistrement vocal -->
              <v-divider class="mb-4"></v-divider>
              <div class="mb-4">
                <h4 class="text-h6 mb-2">Message vocal (optionnel)</h4>
                <p class="text-body-2 text-medium-emphasis mb-3">
                  Enregistrez un message vocal pour accompagner cette réception
                </p>
                <AudioRecorder />
              </div>

              <!-- Bouton d'enregistrement -->
              <v-btn 
                color="primary" 
                :loading="isSubmitting || loading" 
                class="mt-2" 
                variant="flat" 
                size="large" 
                block
                type="submit"
              >
                <v-icon class="me-2">mdi-content-save</v-icon>
                Enregistrer la réception
              </v-btn>

              <!-- Message d'erreur -->
              <div v-if="errors.apiError" class="mt-4">
                <v-alert color="error" variant="tonal">
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
