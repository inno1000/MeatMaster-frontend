<template>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard :title="page.title">
        <v-row class="mt-4">
          <v-col cols="12" md="6" offset-md="3" lg="6" offset-lg="3">
            <v-form ref="Regform" lazy-validation class="loginForm">

              <v-text-field
                  v-model="name"
                  variant="outlined"
                  color="primary"
                  label="Nom"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-home"
              ></v-text-field>

              <v-text-field
                  v-model="address"
                  variant="outlined"
                  color="primary"
                  label="Adresse"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-book-account"
              ></v-text-field>

              <v-select
                  v-model="city"
                  clearable
                  density="comfortable"
                  label="Ville"
                  :items="['Ngaoundéré', 'Douala', 'Yaoundé', 'Garoua', 'Maroua', 'Bertoua', 'Maiganga']"
                  item-title="name"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-map"
                  variant="outlined"
              ></v-select>

              <v-text-field
                  v-model="postal_code"
                  variant="outlined"
                  color="primary"
                  label="Code postal"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-mailbox"
              ></v-text-field>

              <v-text-field
                  v-model="phone"
                  variant="outlined"
                  color="primary"
                  label="Numéro de téléphone"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-phone"
              ></v-text-field>

              <v-text-field
                  v-model="email"
                  variant="outlined"
                  color="primary"
                  label="Email"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-email"
              ></v-text-field>

              <v-text-field
                  v-model="website"
                  variant="outlined"
                  color="primary"
                  label="Site Web"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-web"
                  prefix="https://"
              ></v-text-field>

              <v-text-field
                  v-model="openingHour"
                  variant="outlined"
                  color="primary"
                  label="Heure d'ouverture"
                  :rules="timeRules"
                  class="mb-4"
                  type="time"
                  prepend-icon="mdi-clock-outline"
              ></v-text-field>

              <v-text-field
                  v-model="closingHour"
                  variant="outlined"
                  color="primary"
                  label="Heure de fermeture"
                  :rules="timeRules"
                  class="mb-4"
                  type="time"
                  prepend-icon="mdi-clock"
              ></v-text-field>

              <v-select
                  v-model="openingDays"
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
                  v-model="owner"
                  clearable
                  density="comfortable"
                  label="Propriétaire"
                  :items="['Inno', 'Batouri', 'Toto', 'Ali']"
                  item-title="name"
                  :rules="generalRules"
                  class="mb-4"
                  prepend-icon="mdi-account"
                  variant="outlined"
              ></v-select>

              <v-select
                  v-model="specialties"
                  clearable
                  density="comfortable"
                  label="Spécialité"
                  multiple
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
import { useDate } from 'vuetify'
import toastMessage from "@/helpers/toast";
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';

const page = ref({ title: 'Enregistrement de la boucherie' });

const selectedDate = ref<string | null>(null);
const name = ref<string | null>(null);
const address = ref<string | null>(null);
const city = ref<number | null>(null);
const postal_code = ref<number | null>(null);
const phone = ref<number | null>(null);
const email = ref<number | null>(null);
const website = ref<number | null>(null);
const openingHour = ref<number | null>(null);
const closingHour = ref<number | null>(null);
const openingDays = ref<number | null>(null);
const owner = ref<number | null>(null);
const specialties = ref<number | null>(null);


const Regform = ref();
const paymentFile = ref();
const loading = ref(false);

const fromDateMenu = ref(false)
const fromDateVal = ref(null)

const generalRules = [
  (value: string | number | null) => !!value || 'Ce champ est requis',
];

const timeRules = [
  v => !!v || 'Ce champ est requis',
  v => (v && v.length <= 5) || 'L\'heure doit être au format HH:MM',
];

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
async function submitForm() {
  loading.value = true

  const formData = {
    // 'date': selectedDate.value,
    'name': name.value,
    'city': city.value,
    'address': address.value,
    'postal_code': postal_code.value,
    'phone': phone.value,
    'email': email.value,
    'website': 'https://'+website.value,
    'opening_hours': openingHour.value +" - "+closingHour.value,
    'openingDays': openingDays.value,
    'owner': owner.value,
    'specialties': specialties.value.join(', '),
  }

  // setTimeout(() => {
    console.log(formData)

    const baseUrl = `${import.meta.env.VITE_API_URL}`;

    const butcher = await fetchWrapper.post(`${baseUrl}/butchers`, formData);


    console.log('butcher', login)

  if(butcher.status === 201)
    toastMessage('Enregistrement résussi')
  else
    toastMessage(login.message, 'error')

    loading.value = false

  // }, 3000)
  // Envoyer les données soumises à votre API ou effectuer toute autre action requise
}



</script>
