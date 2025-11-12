<!-- filepath: /Users/plomochavez/Documents/GitHub/delfaro/frontend/src/components/ui/BtnAtras.vue -->
<template>
  <div class="d-flex justify-start align-center fontBold">
    <VBtn
      icon="tabler-arrow-left"
      class="cursor-pointer"
      variant="text"
      color="secondary"
      @click="emitAtras"
    />
    <span v-if="titulo" class="ml-2 cursorPointer" @click="emitAtras">{{
      titulo
    }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  titulo?: string | null;
}>();

const emit = defineEmits(["atras"]);

function emitAtras() {
  emit("atras");
}
</script>
