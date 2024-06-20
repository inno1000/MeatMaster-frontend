<script setup lang="ts">
import { ref } from 'vue';

import UiParentCard from '@/components/shared/UiParentCard.vue';

import { Form } from 'vee-validate';

const page = ref({ title: 'Déclaration de stock' });

const valid = ref(false);

const generalRules = ref([
  (v: string) => !!v || 'Ce champ est requis'
  // (v: string) => (v && v.length <= 10) || 'Password must be less than 10 characters'
]);

/* eslint-disable @typescript-eslint/no-explicit-any */
function validate(values: any, { setErrors }: any) {
  const authStore = useAuthStore();
  return authStore.login(username.value, password.value).catch((error) => setErrors({ apiError: error }));
}
</script>

<template>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard title="Enregistrer une reception">
        <v-row class="mt-4">
          <v-col cols="12" md="6" offset-md="3" lg="6" offset-lg="3">
            <Form @submit="validate" class="loginForm" v-slot="{ errors, isSubmitting }">
              <v-select
                clearable
                density="comfortable"
                label="Type de viande"
                :items="['boeuf', 'mouton', 'chèvre', 'poulet']"
                item-title="name"
                :rules="generalRules"
                return-object
                variant="outlined"
              ></v-select>

              <v-text-field
                variant="outlined"
                color="primary"
                label="Entrez la quantité reçue"
                type="number"
                :rules="generalRules"
                step="1"
                min="1"
                suffix="Kg"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                variant="outlined"
                color="primary"
                label="Entrez le montant correspondant"
                type="number"
                :rules="generalRules"
                step="1"
                min="1"
                suffix="FCFA"
                class="mb-4"
              ></v-text-field>

              <v-btn color="secondary" :loading="isSubmitting" class="mt-2" variant="flat" size="large" :disabled="valid" type="submit">
                Enregistrer</v-btn
              >
              <div v-if="errors.apiError" class="mt-2">
                <v-alert color="error">{{ errors.apiError }}</v-alert>
              </div>
            </Form>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
