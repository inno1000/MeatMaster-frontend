<template>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard :title="page.title">
        <v-row class="mt-4">
          <v-col cols="12" md="8" offset-md="2" lg="6" offset-lg="3">
            <v-form lazy-validation class="paymentForm mobile-form">
              <!-- Date du versement -->
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
                    label="Date du versement"
                    readonly
                    prepend-icon="mdi-calendar-clock"
                    variant="outlined"
                    v-model="selectedDate"
                    :rules="generalRules"
                    class="mb-4"
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

              <!-- Sélection du fournisseur -->
              <v-select
                v-model="selectedSupplier"
                clearable
                density="comfortable"
                label="Fournisseur"
                :items="suppliers"
                item-title="name"
                item-value="id"
                :rules="generalRules"
                variant="outlined"
                prepend-icon="mdi-truck-delivery"
                class="mb-4"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon>mdi-truck-delivery</v-icon>
                    </template>
                    <v-list-item-subtitle>
                      {{ item.raw.name }} - {{ item.raw.contact }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
                <template v-slot:selection="{ item }">
                  {{ item.raw.name }}
                </template>
              </v-select>

              <!-- Montant du versement -->
              <v-text-field
                v-model.number="paymentAmount"
                variant="outlined"
                color="primary"
                label="Montant du versement"
                type="number"
                :rules="generalRules"
                step="100"
                min="0"
                suffix="FCFA"
                prepend-icon="mdi-currency-usd"
                class="mb-4"
              ></v-text-field>

              <!-- Méthode de paiement -->
              <v-select
                v-model="paymentMethod"
                clearable
                density="comfortable"
                label="Méthode de paiement"
                :items="paymentMethods"
                item-title="name"
                item-value="value"
                :rules="generalRules"
                variant="outlined"
                prepend-icon="mdi-credit-card"
                class="mb-4"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon>{{ item.raw.icon }}</v-icon>
                    </template>
                    <v-list-item-subtitle>{{ item.raw.name }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
                <template v-slot:selection="{ item }">
                  {{ item.raw.name }}
                </template>
              </v-select>

              <!-- Description du versement -->
              <v-textarea
                v-model="paymentDescription"
                variant="outlined"
                color="primary"
                label="Description du versement (optionnel)"
                prepend-icon="mdi-text"
                class="mb-4"
                rows="3"
                counter="200"
              ></v-textarea>

              <!-- Upload du reçu -->
              <v-file-input
                clearable
                label="Reçu de versement (optionnel)"
                variant="outlined"
                color="primary"
                class="mb-4"
                show-size
                accept="image/*,application/pdf"
                prepend-icon="mdi-file-document"
                @change="handleFileUpload"
                :model-value="paymentFile"
              >
                <template v-slot:prepend-inner>
                  <v-icon>mdi-file-document</v-icon>
                </template>
              </v-file-input>

              <!-- Aperçu du fichier -->
              <v-card
                v-if="paymentFile"
                variant="outlined"
                class="mb-4"
              >
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="me-2" color="success">mdi-check-circle</v-icon>
                    <span class="text-body-2">{{ paymentFile.name }}</span>
                    <v-spacer></v-spacer>
                    <v-btn
                      icon="mdi-close"
                      size="small"
                      variant="text"
                      @click="paymentFile = null"
                    ></v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Enregistrement vocal -->
              <v-divider class="mb-4"></v-divider>
              <div class="mb-4">
                <h4 class="text-h6 mb-2">Message vocal (optionnel)</h4>
                <p class="text-body-2 text-medium-emphasis mb-3">
                  Enregistrez un message vocal pour accompagner ce versement
                </p>
                <AudioRecorder />
              </div>

              <!-- Informations de statut -->
              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
                prepend-icon="mdi-information"
              >
                <strong>Note :</strong> Ce versement sera soumis à validation par le fournisseur. 
                Vous recevrez une notification une fois validé ou rejeté.
              </v-alert>

              <!-- Bouton d'enregistrement -->
              <v-btn 
                color="primary" 
                :loading="loading" 
                @click="validate()" 
                class="mt-2" 
                variant="flat" 
                size="large" 
                block
              >
                <v-icon class="me-2">mdi-bank-transfer</v-icon>
                Enregistrer le versement
              </v-btn>
            </v-form>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import AudioRecorder from '@/components/shared/AudioRecorder.vue';
import { useDate } from 'vuetify';
import toastMessage from '@/helpers/toast';

const page = ref({ title: 'Enregistrement de Versement' });

// Données du formulaire
const selectedDate = ref<string | null>(null);
const selectedSupplier = ref<string | null>(null);
const paymentAmount = ref<number | null>(null);
const paymentMethod = ref<string | null>(null);
const paymentFile = ref<File | null>(null);
const paymentDescription = ref<string | null>(null);
const loading = ref(false);

// Menu de date
const fromDateMenu = ref(false);
const fromDateVal = ref(null);
const minDate = "2020-01-05";

const date = useDate();

// Fournisseurs disponibles
const suppliers = ref([
  { name: 'Fournisseur A', id: 'supplier_a', contact: '+225 01 23 45 67' },
  { name: 'Fournisseur B', id: 'supplier_b', contact: '+225 01 23 45 68' },
  { name: 'Fournisseur C', id: 'supplier_c', contact: '+225 01 23 45 69' }
]);

// Méthodes de paiement
const paymentMethods = ref([
  { name: 'Espèces', value: 'cash', icon: 'mdi-cash' },
  { name: 'Virement bancaire', value: 'bank_transfer', icon: 'mdi-bank-transfer' },
  { name: 'Mobile Money', value: 'mobile_money', icon: 'mdi-cellphone' },
  { name: 'Chèque', value: 'check', icon: 'mdi-checkbook' }
]);

// Règles de validation
const generalRules = [
  (value: string | number | null) => !!value || 'Ce champ est requis',
];

// Gestion de la date
const dateChanged = computed(() => {
  if (fromDateVal.value) {
    let tempDate = date.format(fromDateVal.value, 'keyboardDate');
    const [month, day, year] = tempDate.split('/');
    selectedDate.value = `${year}-${month}-${day}`;
    fromDateMenu.value = false;
  }
});

// Validation du formulaire
function validate() {
  if (!selectedDate.value || !selectedSupplier.value || !paymentAmount.value || !paymentMethod.value) {
    toastMessage('Veuillez remplir tous les champs obligatoires', 'error');
    return;
  }
  
  if (paymentAmount.value <= 0) {
    toastMessage('Le montant doit être supérieur à 0', 'error');
    return;
  }
  
  submitForm();
}

// Soumission du formulaire
async function submitForm() {
  try {
    loading.value = true;
    
    const formData = {
      date: selectedDate.value,
      supplier: selectedSupplier.value,
      amount: paymentAmount.value,
      method: paymentMethod.value,
      description: paymentDescription.value,
      paymentFile: paymentFile.value,
      status: 'pending' // Statut initial
    };

    console.log('Données de versement:', formData);
    
    // Ici, vous feriez l'appel API pour sauvegarder
    // await api.savePayment(formData);
    
    // Simulation d'un délai
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toastMessage('Versement enregistré avec succès! En attente de validation.');
    
    // Réinitialiser le formulaire
    resetForm();
    
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    toastMessage('Erreur lors de l\'enregistrement du versement', 'error');
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  selectedDate.value = null;
  selectedSupplier.value = null;
  paymentAmount.value = null;
  paymentMethod.value = null;
  paymentDescription.value = null;
  paymentFile.value = null;
  fromDateVal.value = null;
}

// Gestion de l'upload de fichier
function handleFileUpload(file: File) {
  if (file) {
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toastMessage('Veuillez sélectionner une image ou un PDF', 'error');
      return;
    }
    
    // Vérifier la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toastMessage('Le fichier est trop volumineux (max 10MB)', 'error');
      return;
    }
    
    paymentFile.value = file;
    toastMessage('Reçu de versement téléchargé avec succès');
  }
}

// Obtenir l'icône de la méthode de paiement
function getPaymentMethodIcon(method: string) {
  const methodData = paymentMethods.value.find(m => m.value === method);
  return methodData ? methodData.icon : 'mdi-currency-usd';
}



</script>
