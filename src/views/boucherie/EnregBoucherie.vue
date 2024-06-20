<template>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard :title="page.title">
        <v-row class="mt-4">
          <v-col cols="12" md="6" offset-md="3" lg="6" offset-lg="3">
            <v-form ref="Regform" lazy-validation class="loginForm">

              <v-text-field
                  v-model="receivedQuantity"
                  variant="outlined"
                  color="primary"
                  label="Nom"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-home"
              ></v-text-field>

              <v-text-field
                  v-model="receivedQuantity"
                  variant="outlined"
                  color="primary"
                  label="Adresse"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-book-account"
              ></v-text-field>

              <v-text-field
                  v-model="receivedQuantity"
                  variant="outlined"
                  color="primary"
                  label="Code postal"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-mailbox"
              ></v-text-field>

              <v-text-field
                  v-model="receivedQuantity"
                  variant="outlined"
                  color="primary"
                  label="Numéro de téléphone"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-phone"
              ></v-text-field>

              <v-text-field
                  v-model="receivedQuantity"
                  variant="outlined"
                  color="primary"
                  label="Email"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-email"
              ></v-text-field>

              <v-text-field
                  v-model="receivedQuantity"
                  variant="outlined"
                  color="primary"
                  label="Heure d'ouverture"
                  :rules="timeRules"
                  class="mb-4"
                  type="time"
                  prepend-icon="mdi-clock-outline"
              ></v-text-field>

              <v-text-field
                  v-model="receivedQuantity"
                  variant="outlined"
                  color="primary"
                  label="Heure de fermeture"
                  :rules="timeRules"
                  class="mb-4"
                  type="time"
                  prepend-icon="mdi-clock"
              ></v-text-field>

              <v-select
                  v-model="selectedMeatType"
                  clearable
                  multiple
                  density="comfortable"
                  label="Jours ouvrables"
                  :items="['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']"
                  item-title="name"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-home-clock"
                  variant="outlined"
              ></v-select>

              <v-select
                  v-model="selectedMeatType"
                  clearable
                  density="comfortable"
                  label="Spécialité"
                  :items="['boeuf', 'mouton', 'chèvre', 'poulet']"
                  item-title="name"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-cow"
                  variant="outlined"
              ></v-select>

              <v-btn color="secondary" :loading="loading" @click="validate()" class="mt-2" variant="flat" block size="large">
                Enregistrer
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

const page = ref({ title: 'Enregistrement de la boucherie' });

const selectedDate = ref<string | null>(null);
const selectedMeatType = ref<string | null>(null);
const receivedQuantity = ref<number | null>(null);
const correspondingAmount = ref<number | null>(null);
const Regform = ref();
const paymentFile = ref();
const loading = ref(false);

const fromDateMenu = ref(false)
const fromDateVal = ref(null)
const minDate = "2020-01-05"

const generalRules = [
  (value: string | number | null) => !!value || 'Ce champ est requis',
];

const timeRules = [
  v => !!v || 'Ce champ est requis',
  v => (v && v.length <= 5) || 'L\'heure doit être au format HH:MM',
];

import { useDate } from 'vuetify'

const date = useDate()

const  dateChanged = computed(() => {

  let tempDate = date.format(fromDateVal.value, 'keyboardDate')

  const [month, day, year] = tempDate.split('/')

  selectedDate.value = `${year}-${month}-${day}`
  // selectedDate.value =fromDateVal.value

  fromDateMenu.value = false
  console.log(selectedDate.value) // Tuesday, April 13, 2010
  //
  // return formatted;
  // format/do something with date
})

function validate() {
  Regform.value.validate().then(result => {
    console.log(result.valid); // Affiche true ou false en fonction de la validité du formulaire
    if(result.valid)
      submitForm()
    else
      console.log(result.errors); // Affiche les erreurs de validation, le cas échéant
  });
  console.log(Regform.value.validate())

}
function submitForm() {
  loading.value = true

  const formData = {
    'date': selectedDate.value,
    'meatType': selectedMeatType.value,
    'quantity': receivedQuantity.value,
    'amount': correspondingAmount.value,
    'paymentFile': paymentFile.value,
  }

  setTimeout(() => {
    console.log(formData)
    loading.value = false
  }, 3000)
  // Envoyer les données soumises à votre API ou effectuer toute autre action requise
}



</script>
