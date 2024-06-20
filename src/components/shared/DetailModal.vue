<template>
  <v-dialog
      v-model="dialogVisible"
      transition="dialog-bottom-transition"
  >
    <v-card min-height="500">
      <v-toolbar color="secondary">
        <v-btn
            icon="mdi-close"
            @click="dialogVisible = false"
        ></v-btn>

        <v-toolbar-title>Détails de la transaction</v-toolbar-title>

      </v-toolbar>

      <v-card-title>Jour : {{ selectedElement.date }}</v-card-title>
      <v-card-text>
        <p class="py-2">Quantité restant : <b class="text-h4">{{ selectedElement.quantite }}  Kg</b></p>
        <p class="py-2">Montant : <b class="text-h4"> {{ selectedElement.montant }} FCFA</b></p>
        <p class="py-2">Référence : <b class="text-h4">FEZEZSDDF.54D5.FGDAEDFXXCD</b></p>
        <v-divider></v-divider>
        <p class="py-2">Commentaire</p>
        <div class="rounded pa-2 d-flex align-center justify-center"
             style="background: rgba(231,228,228,0.67); height: 50px; min-height: 50px;">
          <p>dffdfdfdfdf</p>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    selectedElement: Object
  },
  data() {
    return {
      dialogVisible: false
    };
  },
  watch: {
    selectedElement(newValue) {
      // console.log('newValue',newValue)
      if (newValue) {
        this.dialogVisible = true;
      } else {
        this.dialogVisible = true;
      }
    }
  }
};
</script>
