<template>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard :title="page.title">
        <v-row class="mt-4">
          <v-col cols="12" md="6" offset-md="3" lg="6" offset-lg="3">
            <v-form ref="Regform" lazy-validation class="loginForm">
<!--              <v-text-field-->
<!--                  v-model="selectedDate"-->
<!--                  variant="outlined"-->
<!--                  color="primary"-->
<!--                  label="Sélectionnez le jour"-->
<!--                  type="date"-->
<!--                  :rules="generalRules"-->
<!--                  class="mb-4"-->
<!--              ></v-text-field>-->

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
                      label="Date du jour"
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

              <v-select
                  v-model="selectedMeatType"
                  clearable
                  density="comfortable"
                  label="Type de viande"
                  :items="['boeuf', 'mouton', 'chèvre', 'poulet']"
                  item-title="name"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-cow"
                  variant="outlined"
              ></v-select>

              <v-text-field
                  v-model.number="receivedQuantity"
                  variant="outlined"
                  color="primary"
                  label="Quantité vendue"
                  type="number"
                  :rules="generalRules"
                  class="mb-4"
                  suffix="Kg"
                  prepend-icon="mdi-scale-balance"
              ></v-text-field>

              <v-text-field
                  v-model.number="correspondingAmount"
                  variant="outlined"
                  color="primary"
                  label="Montant correspondant"
                  type="number"
                  :rules="generalRules"
                  class="mb-4"
                  suffix="FCFA"
                  prepend-icon="mdi-currency-usd"
              ></v-text-field>

              <v-file-input
                  clearable
                  label="Reçu de versement"
                  variant="outlined"
                  color="primary"
                  class="mb-4"
                  show-size
                  :rules="generalRules"
                  v-model="paymentFile"
              ></v-file-input>

              <v-divider class="mb-4"></v-divider>
              <AudioRecorder />

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

const page = ref({ title: 'Versement journalier' });

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
