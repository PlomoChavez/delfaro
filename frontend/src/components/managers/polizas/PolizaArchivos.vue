<script lang="ts" setup>
// Props y eventos
const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "cancelar"): void;
  (event: "changePanel", idx?: any): void;
}>();
</script>

<template>
  <div class="d-flex mb-6">
    <VIcon :icon="'tabler-license'" size="40" />
    <h1 class="pl-4 my-auto fontBold">Archivos</h1>
  </div>
  <pre>{{ props.data }}</pre>
</template>
