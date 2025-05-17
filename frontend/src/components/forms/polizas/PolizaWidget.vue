<script lang="ts" setup>
// prettier-ignoreç

const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);
</script>

<style scoped lang="scss">
p {
  margin: 0;
  padding: 0;
}
</style>

<template>
  <div class="mb-4">
    <!-- prettier-ignore -->
    <p v-if="props.data.compania"><strong>Compañia: </strong>{{ props.data.compania.nombre }}</p>
    <!-- prettier-ignore -->
    <p v-if="props.data.ramo"><strong>Ramo: </strong>{{ props.data.ramo.label }}</p>
    <!-- prettier-ignore -->
    <p v-if="props.data.producto"><strong>Producto: </strong>{{ props.data.producto.nombre }}</p>
    <!-- prettier-ignore -->
    <p v-if="props.data.cliente"><strong>Cliente: </strong>{{ props.data.cliente.nombre }}</p>
    <!-- prettier-ignore -->
    <p v-if="props.data.subAgente"><strong>Cliente: </strong>{{ props.data.subAgente.nombre }}</p>
  </div>
</template>
