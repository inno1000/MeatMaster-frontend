<script setup lang="ts">
const props = defineProps({
  title: String,
  subtitle: String,
  icon: String,
  color: {
    type: String,
    default: 'primary'
  }
});
</script>

// ===============================|| Ui Parent Card||=============================== //
<template>
  <v-card class="modern-card gradient-card" variant="outlined" rounded="lg">
    <v-card-item class="pa-6 pb-4">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <div v-if="props.icon" class="icon-container me-3">
            <v-icon :color="props.color" class="modern-icon">{{ props.icon }}</v-icon>
          </div>
          <div>
            <v-card-title class="text-h5 font-weight-bold pa-0 mb-1">
              {{ props.title }}
            </v-card-title>
            <p v-if="props.subtitle" class="text-body-2 text-medium-emphasis mb-0">
              {{ props.subtitle }}
            </p>
          </div>
        </div>
        <slot name="action"></slot>
      </div>
    </v-card-item>
    <v-divider class="mx-6"></v-divider>
    <v-card-text class="pa-6 pt-4">
      <slot />
    </v-card-text>
  </v-card>
</template>
